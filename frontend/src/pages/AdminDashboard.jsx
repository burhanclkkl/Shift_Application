import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { LayoutDashboard, Building2, Users, Calendar, Settings, Activity, LogOut, User, RefreshCw, AlertCircle, Zap, Shield, Search, X, Inbox, GripVertical, Edit, Moon, Sun, Maximize2, Minimize2, Download, ChevronLeft, ChevronRight, Clock, Building } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import './AdminDashboard.css';

const hourlySlots = Array.from({ length: 24 }).map((_, i) => {
  const start = String(i).padStart(2, '0') + ':00';
  const end = String(i + 1 === 24 ? 0 : i + 1).padStart(2, '0') + ':00';
  return { start, end };
});

const AdminDashboard = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'departments', 'employees', 'shifts', 'logs'
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shiftTemplates, setShiftTemplates] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bildirim mesajları
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // 'success' or 'error'

  // Departman form states
  const [newDeptName, setNewDeptName] = useState('');
  const [editingDept, setEditingDept] = useState(null); // { id, name }

  // Personel form states
  const [newEmpFirstName, setNewEmpFirstName] = useState('');
  const [newEmpLastName, setNewEmpLastName] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpDeptId, setNewEmpDeptId] = useState('');
  const [editingEmp, setEditingEmp] = useState(null); // { id, first_name, last_name, phone, department_id, is_active }

  // Vardiya Şablonu form states
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateStart, setNewTemplateStart] = useState('09:00');
  const [newTemplateEnd, setNewTemplateEnd] = useState('17:00');
  const [editingTemplate, setEditingTemplate] = useState(null); // { id, name, start_time, end_time }

  // Filtre state'leri
  const [deptFilter, setDeptFilter] = useState('');
  const [empFilter, setEmpFilter] = useState('');
  const [empDeptFilter, setEmpDeptFilter] = useState('');
  const [templateFilter, setTemplateFilter] = useState('');
  const [logFilter, setLogFilter] = useState('');

  // Haftalık Planlayıcı Takvim State'i (Haftanın Pazartesi gününü tutar)
  const getMonday = (d) => {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Pazartesi 1, Pazar 0'dır
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMonday(new Date()));

  // Özel Saatli Vardiya Modalı State'i (Sürükle bırak sonrasında açılır)
  const [customShiftModal, setCustomShiftModal] = useState(null); // { employeeId, dateStr, startTime, endTime }

  // Sürükle-bırak sırasında hangi hücrenin üzerinde olunduğunu tutan state
  const [dragOverCell, setDragOverCell] = useState(null); // { dateStr, templateId }

  // Hızlı şablon atama modal state'i
  const [templateAssignModal, setTemplateAssignModal] = useState(null); // { employeeId, dateStr }

  // Vardiya düzenleme modal state'i
  const [editingShiftModal, setEditingShiftModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [showNightHours, setShowNightHours] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [plannerEmpFilter, setPlannerEmpFilter] = useState('');
  const [profile, setProfile] = useState({ company_name: '', email: '', remaining_days: 0 });
  const [profileForm, setProfileForm] = useState({ company_name: '', new_password: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchProfile();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/admin/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setProfileForm({ company_name: data.company_name, new_password: '' });
      }
    } catch (error) {
      console.error("Profil yüklenirken hata:", error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMessage({ type: 'success', text: 'Profil başarıyla güncellendi!' });
        fetchProfile();
        setProfileForm(prev => ({ ...prev, new_password: '' })); // Şifre alanını temizle
      } else {
        setProfileMessage({ type: 'error', text: data.error || 'Güncelleme başarısız.' });
      }
    } catch (error) {
      setProfileMessage({ type: 'error', text: 'Bağlantı hatası.' });
    }
    setProfileLoading(false);
  };

  const [resizingShift, setResizingShift] = useState(null); // { message, onConfirm } // { shiftId, employeeId, employeeName, dateStr, startTime, endTime }

  // Çıkış yapma
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // API veri yükleme metotları
  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/departments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (err) {
      console.error("Departmanlar yüklenirken hata:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Map backend properties to match frontend usage
        const mappedData = data.map(e => ({
          ...e,
          phone_number: e.phone,
          department_name: e.department ? e.department.name : 'Atanmadı',
          department_id: e.department ? e.department.id : ''
        }));
        setEmployees(mappedData);
      }
    } catch (err) {
      console.error("Personeller yüklenirken hata:", err);
    }
  };

  const fetchShiftTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/shift-templates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setShiftTemplates(data);
      }
    } catch (err) {
      console.error("Şablonlar yüklenirken hata:", err);
    }
  };

  const fetchShifts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/shifts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Backend returns start_datetime, we map to start_time for compatibility with frontend rendering code
        const mappedData = data.map(s => ({
          ...s,
          start_time: s.start_datetime,
          end_time: s.end_datetime
        }));
        setShifts(mappedData);
      }
    } catch (err) {
      console.error("Vardiyalar yüklenirken hata:", err);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Loglar yüklenirken hata:", err);
    }
  };

  useEffect(() => {
    // Yetki kontrolü (admin veya super_admin olmalı)
    if (!token || (role !== 'admin' && role !== 'super_admin')) {
      navigate('/login');
      return;
    }

    const initData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDepartments(),
        fetchEmployees(),
        fetchShiftTemplates(),
        fetchShifts(),
        fetchLogs()
      ]);
      setLoading(false);
    };

    initData();
  }, [token, role, navigate]);

  const showNotification = (msg, type = 'success') => {
    setMessageType(type);
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  // Haftanın günlerini hesapla
  const getDaysOfWeek = () => {
    const days = [];
    const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
      
      const options = { day: 'numeric', month: 'short' };
      const formattedDate = date.toLocaleDateString('tr-TR', options);
      
      days.push({
        dayName: dayNames[i],
        dateStr,
        formattedDate
      });
    }
    return days;
  };

  // Önceki/Sonraki Hafta Butonları
  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const handleCurrentWeek = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  // ==========================================
  // === DEPARTMAN EYLEMLERİ ==================
  // ==========================================
  const handleAddDept = async (e) => {
    e.preventDefault();
    if (!newDeptName || !newDeptName.trim()) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newDeptName.trim() })
      });
      const data = await response.json();
      if (response.ok) {
        showNotification("Departman başarıyla eklendi.");
        setNewDeptName('');
        fetchDepartments();
        fetchLogs();
      } else {
        showNotification(data.error || "Departman eklenemedi.", "error");
      }
    } catch (err) {
      showNotification("Bağlantı hatası oluştu.", "error");
    }
  };

  const handleUpdateDept = async (e) => {
    e.preventDefault();
    if (!editingDept.name.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/departments/${editingDept.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editingDept.name.trim() })
      });
      const data = await response.json();
      if (response.ok) {
        showNotification("Departman adı güncellendi.");
        setEditingDept(null);
        fetchDepartments();
        fetchLogs();
      } else {
        showNotification(data.error || "Güncelleme başarısız.", "error");
      }
    } catch (err) {
      showNotification("Bağlantı hatası oluştu.", "error");
    }
  };

  const handleDeleteDept = async (id) => {
    setConfirmModal({
      message: "Bu departmanı silmek istediğinize emin misiniz? Bağlı personeller de etkilenebilir!",
      onConfirm: async () => {
        try {
      const response = await fetch(`${API_BASE_URL}/api/admin/departments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        showNotification("Departman silindi.");
        fetchDepartments();
        fetchEmployees();
        fetchLogs();
      } else {
        showNotification(data.error || "Silme işlemi başarısız.", "error");
      }
        } catch (err) {
          showNotification("Bağlantı hatası oluştu.", "error");
        }
      }
    });
  };

  // ==========================================
  // === PERSONEL EYLEMLERİ ==================
  // ==========================================
  const handleAddEmp = async (e) => {
    e.preventDefault();
    if (!newEmpFirstName || !newEmpLastName || !newEmpDeptId) {
      showNotification("Lütfen ad, soyad ve departman seçiniz.", "error");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: newEmpFirstName,
          last_name: newEmpLastName,
          phone: newEmpPhone || undefined,
          department_id: parseInt(newEmpDeptId)
        })
      });
      const data = await response.json();
      if (response.ok) {
        showNotification("Yeni personel sisteme eklendi.");
        setNewEmpFirstName('');
        setNewEmpLastName('');
        setNewEmpPhone('');
        setNewEmpDeptId('');
        fetchEmployees();
        fetchLogs();
      } else {
        showNotification(data.error || "Personel eklenemedi.", "error");
      }
    } catch (err) {
      showNotification("Bağlantı hatası oluştu.", "error");
    }
  };

  const handleUpdateEmp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/employees/${editingEmp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: editingEmp.first_name,
          last_name: editingEmp.last_name,
          phone: editingEmp.phone,
          department_id: parseInt(editingEmp.department_id),
          is_active: editingEmp.is_active
        })
      });
      const data = await response.json();
      if (response.ok) {
        showNotification("Personel bilgileri güncellendi.");
        setEditingEmp(null);
        fetchEmployees();
        fetchLogs();
      } else {
        showNotification(data.error || "Güncelleme başarısız.", "error");
      }
    } catch (err) {
      showNotification("Bağlantı hatası oluştu.", "error");
    }
  };

  const handleToggleEmpStatus = async (emp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/employees/${emp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !emp.is_active })
      });
      const data = await response.json();
      if (response.ok) {
        showNotification(`Personel durumu güncellendi.`);
        fetchEmployees();
        fetchLogs();
      } else {
        showNotification(data.error || "İşlem başarısız.", "error");
      }
    } catch (err) {
      showNotification("Bağlantı hatası oluştu.", "error");
    }
  };

  const handleDeleteEmp = async (id) => {
    setConfirmModal({
      message: "Bu personeli silmek istediğinize emin misiniz? Tüm vardiya kayıtları da silinecektir!",
      onConfirm: async () => {
        try {
      const response = await fetch(`${API_BASE_URL}/api/admin/employees/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        showNotification("Personel sistemden silindi.");
        fetchEmployees();
        fetchShifts();
        fetchLogs();
      } else {
        showNotification(data.error || "Silme işlemi başarısız.", "error");
      }
        } catch (err) {
          showNotification("Bağlantı hatası oluştu.", "error");
        }
      }
    });
  };

  // ==========================================
  // === VARDİYA / ŞABLON EYLEMLERİ ===========
  // ==========================================
  const handleAddTemplate = async (e) => {
    e.preventDefault();
    if (!newTemplateName) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/shift-templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newTemplateName,
          start_time: newTemplateStart,
          end_time: newTemplateEnd
        })
      });
      const data = await response.json();
      if (response.ok) {
        showNotification("Vardiya şablonu oluşturuldu.");
        setNewTemplateName('');
        fetchShiftTemplates();
        fetchLogs();
      } else {
        showNotification(data.error || "Şablon oluşturulamadı.", "error");
      }
    } catch (err) {
      showNotification("Bağlantı hatası oluştu.", "error");
    }
  };

  const handleDeleteTemplate = async (id) => {
    setConfirmModal({
      message: "Bu şablonu silmek istediğinize emin misiniz?",
      onConfirm: async () => {
        try {
      const response = await fetch(`${API_BASE_URL}/api/admin/shift-templates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        showNotification("Vardiya şablonu silindi.");
        fetchShiftTemplates();
        fetchLogs();
      } else {
        showNotification(data.error || "Şablon silinemedi.", "error");
      }
        } catch (err) {
          showNotification("Bağlantı hatası oluştu.", "error");
        }
      }
    });
  };

  const handleUpdateTemplate = async (e) => {
    e.preventDefault();
    if (!editingTemplate) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/shift-templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingTemplate.name,
          start_time: editingTemplate.start_time,
          end_time: editingTemplate.end_time,
        })
      });
      const data = await response.json();
      if (response.ok) {
        showNotification("Şablon başarıyla güncellendi.");
        setEditingTemplate(null);
        fetchShiftTemplates();
      } else {
        showNotification(data.error || "Şablon güncellenemedi.", "error");
      }
    } catch (err) {
      showNotification("Bağlantı hatası oluştu.", "error");
    }
  };

  // API Vardiya Atama Ortak Metodu
  const assignShiftAPI = async (employeeId, dateStr, startTime, endTime) => {
    // Gece vardiyası tarih hesabı
    const [startHour, startMin] = startTime.split(':');
    const [endHour, endMin] = endTime.split(':');

    const startDateTimeStr = `${dateStr} ${startTime}:00`;
    
    let [y, m, d] = dateStr.split('-').map(Number);
    let endDateObj = new Date(y, m - 1, d);

    if (
      parseInt(endHour) < parseInt(startHour) || 
      (parseInt(endHour) === parseInt(startHour) && parseInt(endMin) < parseInt(startMin))
    ) {
      endDateObj.setDate(endDateObj.getDate() + 1);
    }
    
    const endY = endDateObj.getFullYear();
    const endM = String(endDateObj.getMonth() + 1).padStart(2, '0');
    const endD = String(endDateObj.getDate()).padStart(2, '0');
    const endDateStr = `${endY}-${endM}-${endD}`;
    
    const endDateTimeStr = `${endDateStr} ${endTime}:00`;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/shifts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          employee_id: parseInt(employeeId),
          start_datetime: startDateTimeStr,
          end_datetime: endDateTimeStr
        })
      });

      const data = await response.json();
      if (response.ok) {
        showNotification("Vardiya başarıyla atandı.");
        fetchShifts();
        fetchLogs();
      } else {
        showNotification(data.error || "Vardiya atanamadı.", "error");
      }
    } catch (err) {
      showNotification("Bağlantı hatası oluştu.", "error");
    }
  };

  const handleDeleteShift = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/shifts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        showNotification("Vardiya silindi.");
        fetchShifts();
        fetchLogs();
      } else {
        showNotification(data.error || "Silme işlemi başarısız.", "error");
      }
    } catch (err) {
      showNotification("Bağlantı hatası oluştu.", "error");
    }
  };

  // ==========================================
  // === SÜRÜKLE BIRAK YARDIMCI METOTLARI =====
  // ==========================================
  const handleDragStart = (e, employeeId) => {
    e.dataTransfer.setData("employeeId", employeeId);
    e.dataTransfer.effectAllowed = "move";
  };

  // Tarih ve saat stringlerini güvenle ayıklayan yardımcılar (crash-proof)
  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return '00:00';
    const cleanStr = String(dateTimeStr);
    const parts = cleanStr.split(/[ T]/);
    return parts[1] ? parts[1].substring(0, 5) : '00:00';
  };

  const formatDatePart = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const cleanStr = String(dateTimeStr);
    const parts = cleanStr.split(/[ T]/);
    return parts[0] || '';
  };

  const isSlotInShift = (sStart, sEnd, slotStart, slotEnd) => {
    const toMins = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    let start = toMins(sStart);
    let end = toMins(sEnd);
    let s_start = toMins(slotStart);
    let s_end = toMins(slotEnd);

    // Handle overnight shifts
    if (end < start) {
      end += 24 * 60;
    }
    if (s_end < s_start) {
      s_end += 24 * 60;
    }

    return start <= s_start && end >= s_end;
  };

  const handleDropEmployee = (e, dateStr, slot) => {
    e.preventDefault();
    const employeeId = e.dataTransfer.getData("employeeId");
    if (!employeeId) return;

    // Direct assignment to the 1-hour slot
    assignShiftAPI(employeeId, dateStr, slot.start, slot.end);
  };


  // Zaman Çizelgesi Modeli İşlevleri
  const getShiftsStartingInHour = (dateStr, slot) => {
    return shifts.filter(s => {
      const sStart = formatTime(s.start_time);
      const sEnd = formatTime(s.end_time);
      const startDateStr = formatDatePart(s.start_time);
      const sHour = sStart.split(':')[0];
      const slotHour = slot.start.split(':')[0];
      
      // Durum 1: Vardiya bu tarihte ve saatte başlıyor
      if (startDateStr === dateStr && sHour === slotHour) {
        return true;
      }
      
      // Durum 2: Önceki gün başlayıp gece yarısını geçen vardiya (Ertesi günün 00:00 slotunda çizilir)
      if (slotHour === '00' && startDateStr !== dateStr) {
        let startDt = new Date(`${startDateStr}T00:00:00Z`);
        startDt.setUTCDate(startDt.getUTCDate() + 1);
        const nextDayStr = startDt.toISOString().split('T')[0];
        
        if (nextDayStr === dateStr) {
           const startParts = sStart.split(':').map(Number);
           const endParts = sEnd.split(':').map(Number);
           let startMins = startParts[0] * 60 + startParts[1];
           let endMins = endParts[0] * 60 + endParts[1];
           if (endMins <= startMins && endMins !== 0) {
              return true; // Geceyi geçmiş
           }
        }
      }
      return false;
    });
  };

  const calculateDayOverlaps = (shiftsForDay) => {
    if (!shiftsForDay || shiftsForDay.length === 0) return {};
    
    const parseTime = (timeStr) => {
      const parts = timeStr.split(':').map(Number);
      return parts[0] * 60 + parts[1];
    };
    
    const parsedShifts = shiftsForDay.map(s => {
      const startStr = s.start_time.includes(' ') ? s.start_time.split(' ')[1] : s.start_time;
      const endStr = s.end_time.includes(' ') ? s.end_time.split(' ')[1] : s.end_time;
      let startMins = parseTime(startStr);
      let endMins = parseTime(endStr);
      if (endMins <= startMins) endMins += 24 * 60; // cross midnight
      return { ...s, startMins, endMins };
    }).sort((a, b) => a.startMins - b.startMins || a.endMins - b.endMins);

    const placements = {};
    let currentCluster = [];
    let clusterEnd = 0;

    const processCluster = (cluster) => {
      const columns = [];
      cluster.forEach(shift => {
        let placed = false;
        for (let i = 0; i < columns.length; i++) {
          const col = columns[i];
          const lastShiftInCol = col[col.length - 1];
          // Allow edges to touch without triggering an overlap (<= instead of <)
          if (lastShiftInCol.endMins <= shift.startMins) {
            col.push(shift);
            placements[shift.id] = { index: i };
            placed = true;
            break;
          }
        }
        if (!placed) {
          columns.push([shift]);
          placements[shift.id] = { index: columns.length - 1 };
        }
      });
      const count = columns.length;
      cluster.forEach(shift => {
        placements[shift.id].count = count;
      });
    };

    parsedShifts.forEach(shift => {
      if (currentCluster.length === 0) {
        currentCluster.push(shift);
        clusterEnd = shift.endMins;
      } else {
        if (shift.startMins < clusterEnd) {
          currentCluster.push(shift);
          if (shift.endMins > clusterEnd) {
            clusterEnd = shift.endMins;
          }
        } else {
          processCluster(currentCluster);
          currentCluster = [shift];
          clusterEnd = shift.endMins;
        }
      }
    });

    if (currentCluster.length > 0) {
      processCluster(currentCluster);
    }
    return placements;
  };

  const getShiftBlockStyle = (shift, overlappingCount, index, currentDayStr) => {
    const startDateStr = formatDatePart(shift.start_time);
    const isContinuation = startDateStr !== currentDayStr;
    
    const sStart = formatTime(shift.start_time);
    const sEnd = formatTime(shift.end_time);
    
    const startParts = sStart.split(':').map(Number);
    const endParts = sEnd.split(':').map(Number);
    
    let startMins = startParts[0] * 60 + startParts[1];
    let endMins = endParts[0] * 60 + endParts[1];
    
    if (endMins <= startMins && endMins !== 0) {
      endMins += 24 * 60;
    }
    
    const pixelsPerMinute = 0.6; // 1 saat = 36px => 1dk = 0.6px
    let topOffset = 0;
    let height = 0;
    
    if (!isContinuation) {
      topOffset = startParts[1] * pixelsPerMinute;
      let durationMins = endMins - startMins;
      let maxVisibleMins = (24 * 60) - startMins;
      let visibleDurationMins = Math.min(durationMins, maxVisibleMins);
      height = visibleDurationMins * pixelsPerMinute;
      
      if (resizingShift && resizingShift.id === shift.id) {
         if (resizingShift.direction === 'top') {
            let diff = resizingShift.currentHeight - resizingShift.initialHeight;
            topOffset = topOffset - diff;
            // Prevent going above 00:00 (which is topOffset 0 relative to day start, actually in absolute it's startMins)
            if (topOffset < -startMins * pixelsPerMinute) {
               topOffset = -startMins * pixelsPerMinute;
            }
            height = resizingShift.currentHeight;
         } else {
            let currentDuration = Math.max(15, Math.round(resizingShift.currentHeight / pixelsPerMinute));
            height = Math.min(currentDuration, maxVisibleMins) * pixelsPerMinute;
         }
      }
    } else {
      topOffset = 0; // 00:00 slotundan başlar
      let remainingMins = endMins - (24 * 60);
      height = remainingMins * pixelsPerMinute;
      
      if (resizingShift && resizingShift.id === shift.id) {
         if (resizingShift.direction === 'bottom') {
            let currentDuration = Math.max(15, Math.round(resizingShift.currentHeight / pixelsPerMinute));
            let newEndMins = startMins + currentDuration;
            if (newEndMins > 24 * 60) {
                height = (newEndMins - 24 * 60) * pixelsPerMinute;
            } else {
                height = 0; // Artık ertesi güne sarkmıyor
            }
         }
      }
    }
    
    const hue = (shift.employee_id * 137.5) % 360;
    const backgroundColor = `hsl(${hue}, 75%, 92%)`;
    const borderColor = `hsl(${hue}, 70%, 65%)`;
    
    const widthPercent = 100 / (overlappingCount || 1);
    const leftPercent = index * widthPercent;
    
    return {
      top: `${topOffset}px`,
      height: `${height}px`,
      width: overlappingCount > 1 ? `calc(${widthPercent}% - 4px)` : '100%',
      left: overlappingCount > 1 ? `calc(${leftPercent}% + 2px)` : '0%',
      backgroundColor,
      borderLeftColor: borderColor,
      opacity: isContinuation ? 0.85 : 1 // Sarkan kısım biraz daha saydam
    };
  };

    const handleContextMenu = (e, shift) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      shift: shift
    });
  };

  // Tıklamayla menüyü kapat
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleResizeStart = (e, shift, currentDayStr, direction = 'bottom') => {
    e.stopPropagation();
    setResizingShift({
      id: shift.id,
      startY: e.clientY,
      initialHeight: parseInt(getShiftBlockStyle(shift, 1, 0, currentDayStr).height),
      currentHeight: parseInt(getShiftBlockStyle(shift, 1, 0, currentDayStr).height),
      pixelsPerMinute: 0.6,
      direction: direction
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizingShift) return;
      const deltaY = e.clientY - resizingShift.startY;
      let newHeight;
      if (resizingShift.direction === 'bottom') {
         newHeight = Math.max(30, resizingShift.initialHeight + deltaY); // Min 15 dk
      } else {
         newHeight = Math.max(30, resizingShift.initialHeight - deltaY);
      }
      setResizingShift(prev => ({ ...prev, currentHeight: newHeight }));
    };

    const handleMouseUp = async () => {
      if (!resizingShift) return;
      const shift = shifts.find(s => s.id === resizingShift.id);
      if (shift) {
         const newDurationMins = Math.round(resizingShift.currentHeight / resizingShift.pixelsPerMinute);
         
         const sStart = formatTime(shift.start_time);
         const startParts = sStart.split(':').map(Number);
         let startMins = startParts[0] * 60 + startParts[1];
         
         const sEnd = formatTime(shift.end_time);
         const endParts = sEnd.split(':').map(Number);
         let endMins = endParts[0] * 60 + endParts[1];
         if (endMins <= startMins) endMins += 24 * 60; // handle cross midnight
         
         let newStartDatetimeStr = shift.start_time;
         let newEndDatetimeStr = shift.end_time;
         
         const startDatePart = shift.start_time.split(/[ T]/)[0];
         
         if (resizingShift.direction === 'bottom') {
             let newEndMins = startMins + newDurationMins;
             let newDateStr = startDatePart;
             
             if (newEndMins >= 24 * 60) {
                 newEndMins -= 24 * 60;
                 let targetDate = new Date(`${startDatePart}T00:00:00Z`);
                 targetDate.setUTCDate(targetDate.getUTCDate() + 1);
                 newDateStr = targetDate.toISOString().split('T')[0];
             }
             const newEndHour = String(Math.floor(newEndMins / 60)).padStart(2, '0');
             const newEndMin = String(newEndMins % 60).padStart(2, '0');
             newEndDatetimeStr = `${newDateStr} ${newEndHour}:${newEndMin}:00`;
         } else {
             // Resizing from top
             let newStartMins = endMins - newDurationMins;
             if (newStartMins < 0) newStartMins = 0; // limit at 00:00 today
             
             const newStartHour = String(Math.floor(newStartMins / 60)).padStart(2, '0');
             const newStartMin = String(newStartMins % 60).padStart(2, '0');
             newStartDatetimeStr = `${startDatePart} ${newStartHour}:${newStartMin}:00`;
         }
         
         try {
            const response = await fetch(`${API_BASE_URL}/api/admin/shifts/${shift.id}`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                start_datetime: newStartDatetimeStr, 
                end_datetime: newEndDatetimeStr 
              })
            });
            if (response.ok) {
               showNotification("Vardiya süresi güncellendi.");
               fetchShifts(); 
               fetchLogs();
            } else {
               const errData = await response.json();
               showNotification(errData.error || "Süre güncellenemedi.", "error");
            }
         } catch (e) {
            showNotification("Bağlantı hatası.", "error");
         }
      }
      setResizingShift(null);
    };

    if (resizingShift) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingShift, shifts, token]);

  // Belirli Hücreye ait Atanmış Vardiyaları Getir (ESKİ)

  const getShiftsForCell = (dateStr, slot) => {
    return shifts.filter(s => {
      const sDate = formatDatePart(s.start_time);
      if (sDate !== dateStr) return false;

      const sStart = formatTime(s.start_time);
      const sEnd = formatTime(s.end_time);

      return isSlotInShift(sStart, sEnd, slot.start, slot.end);
    });
  };

  // Özel Saatli Vardiya Form Gönderimi
  const handleCustomShiftSubmit = (e) => {
    e.preventDefault();
    if (!customShiftModal) return;

    assignShiftAPI(
      customShiftModal.employeeId,
      customShiftModal.dateStr,
      customShiftModal.startTime,
      customShiftModal.endTime
    );
    setCustomShiftModal(null); // Modalı kapat
  };

  // Metrikler
  const _today = new Date();
  const todayStr = _today.getFullYear() + '-' + String(_today.getMonth() + 1).padStart(2, '0') + '-' + String(_today.getDate()).padStart(2, '0');
  const totalDepts = departments.length;
  const totalEmps = employees.length;
  const activeEmps = employees.filter(e => e.is_active).length;
  const activeShiftsToday = shifts.filter(s => formatDatePart(s.start_time) === todayStr);

  // --- RENDERING TABS ---

  // Sekme 1: Genel Bakış
  const renderOverview = () => (
    <div className="overview-tab">
      <section className="metrics-grid">
        <div className="metric-card">
          <Building2 size={24} className="metric-icon" />
          <div className="metric-info">
            <h3>Departman Sayısı</h3>
            <p className="metric-number">{totalDepts}</p>
          </div>
        </div>
        <div className="metric-card success">
          <Users size={24} className="metric-icon" />
          <div className="metric-info">
            <h3>Kayıtlı Çalışan (Aktif)</h3>
            <p className="metric-number">{totalEmps} ({activeEmps})</p>
          </div>
        </div>
        <div className="metric-card warning">
          <Calendar size={24} className="metric-icon" />
          <div className="metric-info">
            <h3>Bugünkü Aktif Vardiyalar</h3>
            <p className="metric-number">{activeShiftsToday.length}</p>
          </div>
        </div>
      </section>

      <div className="overview-summary-grid">
        <div className="summary-card expiring-card">
          <div className="summary-card-header-modern">
            <div className="icon-wrapper">
              <Calendar size={18} className="text-blue-500" />
            </div>
            <h3>Bugün Çalışan Personeller <span className="date-badge">{todayStr}</span></h3>
          </div>
          
          {activeShiftsToday.length > 0 ? (
            <div className="today-shifts-modern-list">
              {activeShiftsToday.map(s => (
                <div key={s.id} className="modern-shift-item">
                  <div className="shift-emp-info">
                    <div className="emp-avatar-small">
                      {s.employee_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="emp-name">{s.employee_name}</span>
                  </div>
                  <div className="shift-time-badge">
                    <Clock size={14} className="time-icon" />
                    {formatTime(s.start_time)} - {formatTime(s.end_time)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-shifts-state">
              <div className="empty-icon-circle">
                <Inbox size={24} />
              </div>
              <p>Bugün için atanmış aktif vardiya bulunmamaktadır.</p>
              <span className="empty-hint">Haftalık planlama sekmesinden yeni vardiyalar oluşturabilirsiniz.</span>
            </div>
          )}
        </div>

        <div className="summary-card stats-summary-card">
          <h3>Hızlı Planlama Aksiyonları</h3>
          <div className="quick-actions-list">
            <button onClick={() => setActiveTab('shifts')} className="quick-action-btn primary-action">
              Sürükle-Bırak Vardiya Planlama
            </button>
            <button onClick={() => setActiveTab('employees')} className="quick-action-btn secondary-action">
              Yeni Çalışan Ekle
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Sekme 2: Departmanlar
  const renderDepartments = () => (
    <div className="departments-tab-container">
      <div className="admin-grid-layout">
        {/* Sol Kolon: Departman Ekleme */}
        <section className="add-company-section">
          <h2>Departman Ekle</h2>
          <p className="form-description">Sistemde personel gruplayabileceğiniz yeni departmanlar tanımlayın.</p>
          <form onSubmit={handleAddDept} className="add-company-form">
            <div className="form-group">
              <label>Departman Adı</label>
              <input 
                type="text" 
                placeholder="Örn: Mutfak, Kasa, Kurye" 
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="create-company-btn">Ekle</button>
          </form>
        </section>

        {/* Sağ Kolon: Departman Listesi */}
        <section className="companies-list-section">
          <div className="section-title-row">
            <h2>Departmanlar</h2>
            <span className="list-count">{totalDepts} Tanımlı</span>
          </div>
          <div className="list-filter-bar">
            <span className="filter-icon"><Search size={16} /></span>
            <input
              type="text"
              className="list-filter-input"
              placeholder="Departman adına göre ara..."
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
            />
            {deptFilter && (
              <button className="filter-clear-btn" onClick={() => setDeptFilter('')}><X size={14} /></button>
            )}
          </div>
          <div className="companies-table-container">
            <table className="companies-table">
              <thead>
                <tr>
                  <th>Departman Adı</th>
                  <th>Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {departments.filter(d => d.name.toLowerCase().includes(deptFilter.toLowerCase())).length > 0 ? (
                  departments.filter(d => d.name.toLowerCase().includes(deptFilter.toLowerCase())).map(d => (
                    <tr key={d.id}>
                      <td>
                        <span className="comp-title">{d.name}</span>
                      </td>
                      <td>
                        <div className="row-actions-group">
                          <button 
                            onClick={() => setEditingDept({ id: d.id, name: d.name })} 
                            className="action-btn-small edit-btn"
                          >
                            Düzenle
                          </button>
                          <button 
                            onClick={() => handleDeleteDept(d.id)} 
                            className="action-btn-small freeze"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="no-logs">{deptFilter ? 'Arama sonucu bulunamadı.' : 'Tanımlanmış departman bulunmamaktadır.'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );

  // Sekme 3: Personeller
  const renderEmployees = () => (
    <div className="employees-tab-container">
      <div className="admin-grid-layout">
        {/* Sol Kolon: Personel Ekle */}
        <section className="add-company-section">
          <h2>Yeni Personel Ekle</h2>
          <p className="form-description">Şirketinize yeni bir çalışan tanımlayarak vardiya atamalarını açın.</p>
          <form onSubmit={handleAddEmp} className="add-company-form">
            <div className="form-group">
              <label>Adı</label>
              <input 
                type="text" 
                placeholder="Örn: Ahmet" 
                value={newEmpFirstName}
                onChange={(e) => setNewEmpFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Soyadı</label>
              <input 
                type="text" 
                placeholder="Örn: Yılmaz" 
                value={newEmpLastName}
                onChange={(e) => setNewEmpLastName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Telefon Numarası</label>
              <input 
                type="text" 
                placeholder="Örn: 05551112233" 
                value={newEmpPhone}
                onChange={(e) => setNewEmpPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Departmanı</label>
              <select 
                value={newEmpDeptId} 
                onChange={(e) => setNewEmpDeptId(e.target.value)}
                required
              >
                <option value="">Seçiniz...</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="create-company-btn">Personel Ekle</button>
          </form>
        </section>

        {/* Sağ Kolon: Personel Listesi */}
        <section className="companies-list-section">
          <div className="section-title-row">
            <h2>Personeller</h2>
            <span className="list-count">{totalEmps} Kayıtlı</span>
          </div>
          <div className="list-filter-bar">
            <span className="filter-icon"><Search size={16} /></span>
            <input
              type="text"
              className="list-filter-input"
              placeholder="Ad, soyad veya telefon ara..."
              value={empFilter}
              onChange={e => setEmpFilter(e.target.value)}
            />
            {empFilter && (
              <button className="filter-clear-btn" onClick={() => setEmpFilter('')}><X size={14} /></button>
            )}
            <select
              className="list-filter-select"
              value={empDeptFilter}
              onChange={e => setEmpDeptFilter(e.target.value)}
            >
              <option value="">Tüm Departmanlar</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="companies-table-container">
            <table className="companies-table">
              <thead>
                <tr>
                  <th>Ad Soyad / Telefon</th>
                  <th>Departman</th>
                  <th>Durum</th>
                  <th>Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {employees
                  .filter(emp => {
                    const q = empFilter.toLowerCase();
                    const matchText = !q ||
                      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(q) ||
                      (emp.phone_number || '').includes(q);
                    const matchDept = !empDeptFilter || (emp.department_name || '') === empDeptFilter;
                    return matchText && matchDept;
                  }).length > 0 ? (
                  employees
                    .filter(emp => {
                      const q = empFilter.toLowerCase();
                      const matchText = !q ||
                        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(q) ||
                        (emp.phone_number || '').includes(q);
                      const matchDept = !empDeptFilter || (emp.department_name || '') === empDeptFilter;
                      return matchText && matchDept;
                    })
                    .map(emp => (
                    <tr key={emp.id} className={!emp.is_active ? 'row-frozen' : ''}>
                      <td>
                        <div className="company-meta">
                          <span className="comp-title">{emp.first_name} {emp.last_name}</span>
                          <span className="comp-email">{emp.phone_number || 'Telefon girilmedi'}</span>
                        </div>
                      </td>
                      <td>{emp.department_name || 'Atanmadı'}</td>
                      <td>
                        <span className={`status-badge ${emp.is_active ? 'active' : 'frozen'}`}>
                          {emp.is_active ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions-group">
                          <button 
                            onClick={() => handleToggleEmpStatus(emp)} 
                            className={`action-btn-small ${emp.is_active ? 'freeze' : 'activate'}`}
                          >
                            {emp.is_active ? 'Pasif Et' : 'Aktif Et'}
                          </button>
                          <button 
                            onClick={() => setEditingEmp({ ...emp })} 
                            className="action-btn-small edit-btn"
                          >
                            Düzenle
                          </button>
                          <button 
                            onClick={() => handleDeleteEmp(emp.id)} 
                            className="action-btn-small freeze"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-logs">{empFilter || empDeptFilter ? 'Arama sonucu bulunamadı.' : 'Kayıtlı personel bulunmamaktadır.'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );

  // Sekme 4: Sürükle Bırak Vardiya Planlama (Drag & Drop Planner)

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Haftalık Vardiya', {
        views: [{ showGridLines: false }]
      });

      sheet.columns = [
        { header: '', key: 'emp', width: 25 },
        { header: '', key: 'dept', width: 20 },
        { header: '', key: 'mon', width: 18 },
        { header: '', key: 'tue', width: 18 },
        { header: '', key: 'wed', width: 18 },
        { header: '', key: 'thu', width: 18 },
        { header: '', key: 'fri', width: 18 },
        { header: '', key: 'sat', width: 18 },
        { header: '', key: 'sun', width: 18 }
      ];

      const companyName = profile.company_name || 'Vardiya Planı';
      const weekStr = `${new Date(currentWeekStart).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} Haftası`;

      sheet.mergeCells('A1:I2');
      const titleCell = sheet.getCell('A1');
      titleCell.value = `${companyName} - ${weekStr}`;
      titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };

      sheet.addRow([]);

      const headerRow = sheet.addRow(['Personel Adı', 'Departman', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']);
      headerRow.height = 25;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
        };
      });

      const activeEmployees = employees.filter(e => e.is_active);
      const days = getDaysOfWeek();

      activeEmployees.forEach((emp, index) => {
        const empShifts = shifts.filter(s => s.employee_id === emp.id);
        const rowData = [
          `${emp.first_name} ${emp.last_name}`,
          emp.department_name || 'Belirtilmedi'
        ];

        days.forEach(day => {
          const dayShifts = empShifts.filter(s => s.start_time.startsWith(day.dateStr));
          if (dayShifts.length > 0) {
            const shiftTexts = dayShifts.map(s => {
              const start = s.start_time.substring(11, 16);
              const end = s.end_time.substring(11, 16);
              return `${start} - ${end}`;
            }).join('\n');
            rowData.push(shiftTexts);
          } else {
            rowData.push('İzinli');
          }
        });

        const row = sheet.addRow(rowData);
        row.height = 30;
        const bgColor = index % 2 === 0 ? 'FFF8FAFC' : 'FFFFFFFF';

        row.eachCell((cell, colNum) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
          };
          
          if (colNum <= 2) {
             cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
             cell.font = { bold: true, color: { argb: 'FF334155' } };
          } else {
             if (cell.value === 'İzinli') {
                 cell.font = { italic: true, color: { argb: 'FF94A3B8' } };
             } else {
                 cell.font = { color: { argb: 'FF0F172A' }, bold: true };
                 cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } }; 
             }
          }
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Vardiya_Plani_${weekStr.replace(/\s+/g, '_')}.xlsx`);
    } catch (err) {
      console.error("Excel dışa aktarılırken hata:", err);
      alert("Excel dosyası oluşturulurken bir hata oluştu.");
    }
  };

  const renderShifts = () => {
    const daysOfWeek = getDaysOfWeek();
    
    const allOverlaps = {};
    daysOfWeek.forEach(day => {
       const dayShifts = shifts.filter(s => formatDatePart(s.start_time) === day.dateStr);
       const dayOverlaps = calculateDayOverlaps(dayShifts);
       Object.assign(allOverlaps, dayOverlaps);
    });

    return (
      <div className="planner-tab-layout">
        
        {/* Sol Kenar: Sürüklenebilir Çalışanlar Listesi */}
        <aside className="employees-drag-source">
          <div className="drag-source-header">
            <h3>Çalışan Kadrosu</h3>
            <p>Vardiya atamak için personeli takvime sürükleyin.</p>
            <div className="planner-emp-filter-container">
              <Search size={14} className="filter-icon" />
              <input 
                type="text" 
                placeholder="İsim veya departman ara..." 
                value={plannerEmpFilter}
                onChange={(e) => setPlannerEmpFilter(e.target.value)}
                className="planner-emp-filter-input"
              />
            </div>
          </div>
          <div className="draggable-employees-list">
            {employees
              .filter(e => e.is_active)
              .filter(e => {
                if (!plannerEmpFilter) return true;
                const searchStr = plannerEmpFilter.toLowerCase();
                const fullName = `${e.first_name} ${e.last_name}`.toLowerCase();
                const dept = (e.department_name || '').toLowerCase();
                return fullName.includes(searchStr) || dept.includes(searchStr);
              })
              .map(emp => (
              <div 
                key={emp.id}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, emp.id)}
                className="draggable-employee-card"
                title="Sürüklemek için fareyle tutup takvime bırakın"
              >
                <div className="card-avatar"><User size={16} /></div>
                <div className="card-info">
                  <span className="card-name">{emp.first_name} {emp.last_name}</span>
                  <span className="card-dept">{emp.department_name || 'Departmansız'}</span>
                </div>
                <span className="drag-handle-dots"><GripVertical size={16} /></span>
              </div>
            ))}
            {employees.filter(e => e.is_active).length === 0 && (
              <p className="no-active-emp-warn">Sistemde aktif personel bulunmamaktadır.</p>
            )}
          </div>
        </aside>

        {/* Sağ Kenar: Haftalık Sürükle Bırak Takvimi */}
        <main className="weekly-planner-container">
          <header className="planner-week-navigation">
            <div className="week-buttons">
              <button onClick={handlePrevWeek} className="nav-week-btn">◀ Önceki Hafta</button>
              <button onClick={handleCurrentWeek} className="nav-week-btn secondary">Bugün</button>
              <button onClick={handleNextWeek} className="nav-week-btn">Sonraki Hafta ▶</button>
              <button 
                onClick={() => setShowNightHours(!showNightHours)} 
                className={`nav-week-btn ${showNightHours ? 'secondary' : ''}`}
                style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: showNightHours ? 'var(--bg-dark-soft)' : '#f1f5f9' }}
              >
                {showNightHours ? <Sun size={14} /> : <Moon size={14} />}
                {showNightHours ? 'Geceyi Gizle' : 'Geceyi Göster'}
              </button>

              <button 
                onClick={handleExportExcel} 
                className="nav-week-btn excel-export-btn"
                style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#10b981', color: '#fff', borderColor: '#059669' }}
                title="Şu anki programı şık bir Excel olarak indir"
              >
                <Download size={14} /> Excel İndir
              </button>
            </div>
            <div className="week-range-label">
              <strong>{new Date(currentWeekStart).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> haftası
            </div>
          </header>

          <div className="planner-table-scroll-wrapper">
            <table className="planner-drag-table">
              <thead>
                <tr>
                  <th className="template-col-header">Vardiya Saatleri</th>
                  {(expandedDay ? daysOfWeek.filter(d => d.dateStr === expandedDay) : daysOfWeek).map(day => {
                    const isOverHeader = dragOverCell?.dateStr === day.dateStr && dragOverCell?.templateId === 'header';
                    return (
                      <th 
                        key={day.dateStr} 
                        className={`day-col-header ${isOverHeader ? 'drag-over-header' : ''} ${expandedDay === day.dateStr ? 'expanded-col' : ''}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (dragOverCell?.dateStr !== day.dateStr || dragOverCell?.templateId !== 'header') {
                            setDragOverCell({ dateStr: day.dateStr, templateId: 'header' });
                          }
                        }}
                        onDragLeave={() => setDragOverCell(null)}
                        onDrop={(e) => {
                          setDragOverCell(null);
                          e.preventDefault();
                          const employeeId = e.dataTransfer.getData("employeeId");
                          if (!employeeId) return;
                          
                          setTemplateAssignModal({
                            employeeId: parseInt(employeeId),
                            dateStr: day.dateStr
                          });
                        }}
                      onClick={(e) => { e.stopPropagation(); setExpandedDay(expandedDay === day.dateStr ? null : day.dateStr); }}
                      style={{ cursor: 'pointer' }}
                      >
                        <div className="day-header-top-row">
                          <div className="day-header-text">
                            <span className="day-name-hdr">{day.dayName}</span>
                            <span className="day-date-hdr">{day.formattedDate}</span>
                          </div>
                          <div className="expand-day-btn" title={expandedDay === day.dateStr ? "Daralt" : "Genişlet"}>
                            {expandedDay === day.dateStr ? <Minimize2 size={14}/> : <Maximize2 size={14}/>}
                          </div>
                        </div>
                        <div className="quick-drop-hint">Hızlı Şablon <Inbox size={14} /></div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {/* Her Bir 1 Saatlik Dilim İçin Satır */}
                {hourlySlots
                  .filter(slot => {
                    if (showNightHours) return true;
                    const h = parseInt(slot.start.split(':')[0]);
                    return h >= 8;
                  })
                  .map(slot => (
                  <tr key={`${slot.start}-${slot.end}`}>
                    <td className="template-cell-info">
                      <strong>{slot.start} - {slot.end}</strong>
                    </td>
                    {(expandedDay ? daysOfWeek.filter(d => d.dateStr === expandedDay) : daysOfWeek).map(day => {
                      const cellShifts = getShiftsStartingInHour(day.dateStr, slot);
                      const slotId = `${slot.start}-${slot.end}`;
                      const isOver = dragOverCell?.dateStr === day.dateStr && dragOverCell?.templateId === slotId;
                      return (
                        <td 
                          key={day.dateStr}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (dragOverCell?.dateStr !== day.dateStr || dragOverCell?.templateId !== slotId) {
                              setDragOverCell({ dateStr: day.dateStr, templateId: slotId });
                            }
                          }}
                          onDragLeave={() => setDragOverCell(null)}
                          onDrop={(e) => {
                            setDragOverCell(null);
                            handleDropEmployee(e, day.dateStr, slot);
                          }}
                          className={`planner-drop-zone-cell ${isOver ? 'drag-over' : ''} ${expandedDay === day.dateStr ? 'expanded-col' : ''}`}
                        >
                          <div className="dropped-employees-container">
                            {cellShifts.map((s, idx) => {
                              const overlapInfo = allOverlaps[s.id] || { count: 1, index: 0 };
                              const style = getShiftBlockStyle(s, overlapInfo.count, overlapInfo.index, day.dateStr);
                              let displayStartTime = formatTime(s.start_time);
                              let displayEndTime = formatTime(s.end_time);
                              
                              if (resizingShift?.id === s.id) {
                                  const startParts = formatTime(s.start_time).split(':').map(Number);
                                  let startMins = startParts[0] * 60 + startParts[1];
                                  
                                  const endParts = formatTime(s.end_time).split(':').map(Number);
                                  let endMins = endParts[0] * 60 + endParts[1];
                                  if (endMins <= startMins) endMins += 24 * 60;
                                  
                                  const currentDurationMins = Math.round(resizingShift.currentHeight / resizingShift.pixelsPerMinute);
                                  
                                  if (resizingShift.direction === 'bottom') {
                                      let newEndMins = startMins + currentDurationMins;
                                      if (newEndMins >= 24 * 60) newEndMins -= 24 * 60;
                                      const h = String(Math.floor(newEndMins / 60)).padStart(2, '0');
                                      const m = String(newEndMins % 60).padStart(2, '0');
                                      displayEndTime = `${h}:${m}`;
                                  } else {
                                      let newStartMins = endMins - currentDurationMins;
                                      if (newStartMins < 0) newStartMins = 0;
                                      const h = String(Math.floor(newStartMins / 60)).padStart(2, '0');
                                      const m = String(newStartMins % 60).padStart(2, '0');
                                      displayStartTime = `${h}:${m}`;
                                  }
                              }
                              
                              return (
                                <div 
                                  key={s.id} 
                                  className={`absolute-shift-block ${resizingShift?.id === s.id ? 'resizing' : ''}`}
                                  style={style}
                                  title={s.employee_name + " (Sağ Tıklayın)"}
                                  onContextMenu={(e) => handleContextMenu(e, s)}
                                >
                                  <div className="shift-resizer shift-resizer-top" onMouseDown={(e) => handleResizeStart(e, s, day.dateStr, 'top')} />
                                  <div className="shift-block-time">
                                     <span className="shift-time-text">{displayStartTime} - {displayEndTime}</span>
                                  </div>
                                  <div className="shift-block-name">{s.employee_name}</div>
                                  
                                  <div className="shift-resizer shift-resizer-bottom" onMouseDown={(e) => handleResizeStart(e, s, day.dateStr, 'bottom')} />
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    );
  };

  // Sekme 5: İşlem Logları
  const renderAuditLogs = () => (
    <section className="audit-logs-section no-margin-top">
      <div className="section-title-row">
        <h2>Şirket İşlem Geçmişi (Audit Logs)</h2>
        <button onClick={fetchLogs} className="refresh-logs-btn"><RefreshCw size={14} className="btn-icon" /> Listeyi Yenile</button>
      </div>
      <div className="list-filter-bar">
        <span className="filter-icon"><Search size={16} /></span>
        <input
          type="text"
          className="list-filter-input"
          placeholder="E-posta, eylem veya IP adresine göre ara..."
          value={logFilter}
          onChange={e => setLogFilter(e.target.value)}
        />
        {logFilter && (
          <button className="filter-clear-btn" onClick={() => setLogFilter('')}><X size={14} /></button>
        )}
      </div>
      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Tarih / Saat</th>
              <th>İşlemi Gerçekleştiren</th>
              <th>Eylem / Açıklama</th>
              <th>IP Adresi</th>
            </tr>
          </thead>
          <tbody>
            {logs
              .filter(log => {
                const q = logFilter.toLowerCase();
                return !q ||
                  (log.user_email || '').toLowerCase().includes(q) ||
                  (log.action || '').toLowerCase().includes(q) ||
                  (log.ip_address || '').includes(q);
              }).length > 0 ? (
              logs
                .filter(log => {
                  const q = logFilter.toLowerCase();
                  return !q ||
                    (log.user_email || '').toLowerCase().includes(q) ||
                    (log.action || '').toLowerCase().includes(q) ||
                    (log.ip_address || '').includes(q);
                })
                .map(log => (
                <tr key={log.id}>
                  <td className="log-time">{log.timestamp}</td>
                  <td className="log-user">{log.user_email}</td>
                  <td className="log-action">{log.action}</td>
                  <td className="log-ip">{log.ip_address || '127.0.0.1'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-logs">{logFilter ? 'Arama sonucu bulunamadı.' : 'Herhangi bir sistem işlemi kaydedilmemiştir.'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  // Sekme 6: Hazır Vardiya Şablonları (Templates Management)
  const renderTemplates = () => (
    <div className="templates-tab-container">
      <div className="admin-grid-layout">
        {/* Sol Kolon: Şablon Ekleme */}
        <section className="add-company-section">
          <h2>Hazır Vardiya Ekle</h2>
          <p className="form-description">Haftalık planlama ekranında hızlıca atayabileceğiniz vardiya saatleri tanımlayın.</p>
          <form onSubmit={handleAddTemplate} className="add-company-form">
            <div className="form-group">
              <label>Şablon Adı</label>
              <input 
                type="text" 
                placeholder="Örn: Sabah Vardiyası, Akşam Vardiyası" 
                value={newTemplateName} 
                onChange={(e) => setNewTemplateName(e.target.value)}
                required
              />
            </div>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label>Başlangıç Saati</label>
                <input 
                  type="time" 
                  value={newTemplateStart} 
                  onChange={(e) => setNewTemplateStart(e.target.value)}
                  className="modal-time-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Bitiş Saati</label>
                <input 
                  type="time" 
                  value={newTemplateEnd} 
                  onChange={(e) => setNewTemplateEnd(e.target.value)}
                  className="modal-time-input"
                  required
                />
              </div>
            </div>
            <button type="submit" className="create-company-btn">Şablon Ekle</button>
          </form>
        </section>

        {/* Sağ Kolon: Şablon Listesi */}
        <section className="companies-list-section">
          <div className="section-title-row">
            <h2>Kayıtlı Hazır Vardiyalar</h2>
            <span className="list-count">{shiftTemplates.length} Adet</span>
          </div>
          <div className="list-filter-bar">
            <span className="filter-icon"><Search size={16} /></span>
            <input
              type="text"
              className="list-filter-input"
              placeholder="Şablon adına göre ara..."
              value={templateFilter}
              onChange={e => setTemplateFilter(e.target.value)}
            />
            {templateFilter && (
              <button className="filter-clear-btn" onClick={() => setTemplateFilter('')}><X size={14} /></button>
            )}
          </div>
          <div className="companies-table-container">
            <table className="companies-table">
              <thead>
                <tr>
                  <th>Vardiya Adı</th>
                  <th>Saat Aralığı</th>
                  <th>Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                {shiftTemplates.filter(t => t.name.toLowerCase().includes(templateFilter.toLowerCase())).length > 0 ? (
                  shiftTemplates.filter(t => t.name.toLowerCase().includes(templateFilter.toLowerCase())).map(t => (
                    <tr key={t.id}>
                      <td>
                        <span className="comp-title">{t.name}</span>
                      </td>
                      <td>
                        <span className="comp-email">{t.start_time} - {t.end_time}</span>
                      </td>
                      <td>
                        <div className="row-actions-group">
                          <button
                            onClick={() => setEditingTemplate({ id: t.id, name: t.name, start_time: t.start_time, end_time: t.end_time })}
                            className="action-btn-small edit-btn"
                          >
                            Düzenle
                          </button>
                          <button 
                            onClick={() => handleDeleteTemplate(t.id)} 
                            className="action-btn-small freeze"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="no-logs">{templateFilter ? 'Arama sonucu bulunamadı.' : 'Kayıtlı hazır vardiya şablonu bulunmamaktadır.'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );

  // Şablon Düzenle Modali
  const renderEditTemplateModal = () => (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Вardiya Şablonunu Güncelle</h2>
          <button onClick={() => setEditingTemplate(null)} className="close-modal-btn"><X size={14} /></button>
        </div>
        <form onSubmit={handleUpdateTemplate} className="modal-form">
          <div className="form-group">
            <label>Şablon Adı</label>
            <input
              type="text"
              value={editingTemplate.name}
              onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
              required
              placeholder="Örn: Sabah Vardiyaşı"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Başlangıç Saati</label>
              <input
                type="time"
                value={editingTemplate.start_time}
                onChange={e => setEditingTemplate({ ...editingTemplate, start_time: e.target.value })}
                className="modal-time-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Bitiş Saati</label>
              <input
                type="time"
                value={editingTemplate.end_time}
                onChange={e => setEditingTemplate({ ...editingTemplate, end_time: e.target.value })}
                className="modal-time-input"
                required
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={() => setEditingTemplate(null)} className="modal-cancel-btn">Vazgeç</button>
            <button type="submit" className="modal-save-btn">Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  );


  // Silme Onay Modalı
  const renderConfirmModal = () => (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
            <AlertCircle size={20} /> Silme İşlemini Onayla
          </h2>
          <button onClick={() => setConfirmModal(null)} className="close-modal-btn"><X size={14} /></button>
        </div>
        <div className="modal-body" style={{ padding: '1rem 0', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
          {confirmModal.message}
        </div>
        <div className="modal-actions">
          <button onClick={() => setConfirmModal(null)} className="modal-cancel-btn">Vazgeç</button>
          <button 
            onClick={() => {
              confirmModal.onConfirm();
              setConfirmModal(null);
            }} 
            className="modal-btn cancel"
            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.7rem 1.75rem', borderRadius: 'var(--radius-md)', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)' }}
          >
            Evet, Sil
          </button>
        </div>
      </div>
    </div>
  );

  // Departman Düzenleme Modalı
  const renderEditDeptModal = () => (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Departman Adını Güncelle</h2>
          <button onClick={() => setEditingDept(null)} className="close-modal-btn"><X size={14} /></button>
        </div>
        <form onSubmit={handleUpdateDept} className="modal-form">
          <div className="form-group">
            <label>Departman Adı</label>
            <input 
              type="text" 
              value={editingDept.name} 
              onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={() => setEditingDept(null)} className="modal-cancel-btn">Vazgeç</button>
            <button type="submit" className="modal-save-btn">Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  );

  // Personel Düzenleme Modalı
  const renderEditEmpModal = () => (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Personel Bilgilerini Güncelle</h2>
          <button onClick={() => setEditingEmp(null)} className="close-modal-btn"><X size={14} /></button>
        </div>
        <form onSubmit={handleUpdateEmp} className="modal-form">
          <div className="form-group">
            <label>Adı</label>
            <input 
              type="text" 
              value={editingEmp.first_name} 
              onChange={(e) => setEditingEmp({ ...editingEmp, first_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Soyadı</label>
            <input 
              type="text" 
              value={editingEmp.last_name} 
              onChange={(e) => setEditingEmp({ ...editingEmp, last_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Telefon Numarası</label>
            <input 
              type="text" 
              value={editingEmp.phone || ''} 
              onChange={(e) => setEditingEmp({ ...editingEmp, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Departmanı</label>
            <select 
              value={editingEmp.department_id || ''} 
              onChange={(e) => setEditingEmp({ ...editingEmp, department_id: e.target.value })}
              required
            >
              <option value="">Seçiniz...</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={editingEmp.is_active} 
                onChange={(e) => setEditingEmp({ ...editingEmp, is_active: e.target.checked })}
              />
              Sistemde Aktif Çalışan
            </label>
          </div>
          <div className="modal-footer-buttons">
            <button type="button" onClick={() => setEditingEmp(null)} className="modal-btn cancel">Vazgeç</button>
            <button type="submit" className="modal-btn submit">Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  );

  // Sürükle Bırak Sonrası Özel Saat Belirleme Modalı
  const renderCustomShiftModal = () => {
    const emp = employees.find(e => e.id === parseInt(customShiftModal.employeeId));
    const empName = emp ? `${emp.first_name} ${emp.last_name}` : "Personel";

    return (
      <div className="modal-backdrop">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Özel Saatli Vardiya Ata</h2>
            <button onClick={() => setCustomShiftModal(null)} className="close-modal-btn"><X size={14} /></button>
          </div>
          <form onSubmit={handleCustomShiftSubmit} className="modal-form">
            <div className="custom-shift-info">
              <p><strong>Personel:</strong> {empName}</p>
              <p><strong>Tarih:</strong> {customShiftModal.dateStr}</p>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Başlangıç Saati</label>
                <input 
                  type="time" 
                  value={customShiftModal.startTime}
                  onChange={(e) => setCustomShiftModal({ ...customShiftModal, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Bitiş Saati</label>
                <input 
                  type="time" 
                  value={customShiftModal.endTime}
                  onChange={(e) => setCustomShiftModal({ ...customShiftModal, endTime: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="modal-footer-buttons">
              <button type="button" onClick={() => setCustomShiftModal(null)} className="modal-btn cancel">Vazgeç</button>
              <button type="submit" className="modal-btn submit">Vardiya Ata</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Hızlı Hazır Vardiya Şablonu Atama Modalı
  const renderTemplateAssignModal = () => {
    const emp = employees.find(e => e.id === templateAssignModal.employeeId);
    const empName = emp ? `${emp.first_name} ${emp.last_name}` : "Personel";

    return (
      <div className="modal-backdrop">
        <div className="modal-content text-left">
          <div className="modal-header">
            <h2>Hazır Vardiya Şablonu Ata</h2>
            <button onClick={() => setTemplateAssignModal(null)} className="close-modal-btn"><X size={14} /></button>
          </div>
          <div className="modal-body-content" style={{ textAlign: 'left' }}>
            <div className="custom-shift-info" style={{ marginBottom: '1.5rem' }}>
              <p><strong>Personel:</strong> {empName}</p>
              <p><strong>Tarih:</strong> {templateAssignModal.dateStr}</p>
            </div>
            
            <div className="templates-selector-group">
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', fontWeight: '800' }}>Bir Şablon Seçin:</h3>
              <div className="assign-templates-grid">
                {shiftTemplates.map(t => (
                  <button 
                    key={t.id}
                    type="button"
                    onClick={() => {
                      assignShiftAPI(templateAssignModal.employeeId, templateAssignModal.dateStr, t.start_time, t.end_time);
                      setTemplateAssignModal(null);
                    }}
                    className="assign-template-card-btn"
                  >
                    <strong>{t.name}</strong>
                    <span>{t.start_time} - {t.end_time}</span>
                  </button>
                ))}
                {shiftTemplates.length === 0 && (
                  <p className="no-templates-msg-modal">Kayıtlı hazır vardiya şablonu bulunmamaktadır. Lütfen sol panelden bir şablon ekleyin.</p>
                )}
              </div>

              <div className="modal-divider">veya</div>

              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', fontWeight: '800' }}>Özel Saat Aralığı Tanımla:</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const start = e.target.startTime.value;
                const end = e.target.endTime.value;
                assignShiftAPI(templateAssignModal.employeeId, templateAssignModal.dateStr, start, end);
                setTemplateAssignModal(null);
              }} className="mini-modal-form">
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Başlangıç Saati</label>
                    <input type="time" name="startTime" defaultValue="09:00" className="modal-time-input" required />
                  </div>
                  <div className="form-group">
                    <label>Bitiş Saati</label>
                    <input type="time" name="endTime" defaultValue="17:00" className="modal-time-input" required />
                  </div>
                </div>
                <button type="submit" className="modal-btn submit full-width mt-1" style={{ width: '100%', marginTop: '1.25rem' }}>Özel Vardiya Ata</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleEditShiftClick = (s) => {
    const sDate = formatDatePart(s.start_time);
    const sStart = formatTime(s.start_time);
    const sEnd = formatTime(s.end_time);
    setEditingShiftModal({
      shiftId: s.id,
      employeeId: s.employee_id,
      employeeName: s.employee_name,
      dateStr: sDate,
      startTime: sStart,
      endTime: sEnd
    });
  };

  const handleEditingShiftSubmit = async (e) => {
    e.preventDefault();
    if (!editingShiftModal) return;

    // Gece vardiyası tarih hesabı
    let endDate = new Date(editingShiftModal.dateStr);
    const [startHour, startMin] = editingShiftModal.startTime.split(':');
    const [endHour, endMin] = editingShiftModal.endTime.split(':');

    const startDateTimeStr = `${editingShiftModal.dateStr} ${editingShiftModal.startTime}:00`;

    if (
      parseInt(endHour) < parseInt(startHour) || 
      (parseInt(endHour) === parseInt(startHour) && parseInt(endMin) < parseInt(startMin))
    ) {
      endDate.setDate(endDate.getDate() + 1);
    }
    const endDateStr = endDate.toISOString().split('T')[0];
    const endDateTimeStr = `${endDateStr} ${editingShiftModal.endTime}:00`;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/shifts/${editingShiftModal.shiftId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          employee_id: editingShiftModal.employeeId,
          start_datetime: startDateTimeStr,
          end_datetime: endDateTimeStr
        })
      });

      const data = await response.json();
      if (response.ok) {
        showNotification("Vardiya başarıyla güncellendi.");
        fetchShifts();
        fetchLogs();
      } else {
        showNotification(data.error || "Vardiya güncellenemedi.", "error");
      }
    } catch (err) {
      showNotification("Bağlantı hatası oluştu.", "error");
    }
    setEditingShiftModal(null);
  };

  const renderEditingShiftModal = () => {
    return (
      <div className="modal-backdrop">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Vardiya Saatlerini Düzenle</h2>
            <button onClick={() => setEditingShiftModal(null)} className="close-modal-btn"><X size={14} /></button>
          </div>
          <form onSubmit={handleEditingShiftSubmit} className="modal-form">
            <div className="custom-shift-info" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <p><strong>Personel:</strong> {editingShiftModal.employeeName}</p>
              <p><strong>Tarih:</strong> {editingShiftModal.dateStr}</p>
            </div>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Başlangıç Saati</label>
                <input 
                  type="time" 
                  value={editingShiftModal.startTime}
                  onChange={(e) => setEditingShiftModal({ ...editingShiftModal, startTime: e.target.value })}
                  className="modal-time-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Bitiş Saati</label>
                <input 
                  type="time" 
                  value={editingShiftModal.endTime}
                  onChange={(e) => setEditingShiftModal({ ...editingShiftModal, endTime: e.target.value })}
                  className="modal-time-input"
                  required
                />
              </div>
            </div>
            <div className="modal-footer-buttons" style={{ marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setEditingShiftModal(null)} className="modal-btn cancel">Vazgeç</button>
              <button type="submit" className="modal-btn submit">Kaydet</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Yönetici paneli yükleniyor, lütfen bekleyiniz...</p>
      </div>
    );
  }

  const renderSettings = () => (
    <div className="tab-pane active fade-in">
      
      <div className="settings-container">
        {/* Lisans Durumu */}
        <div className="settings-card license-card">
          <div className="settings-card-header">
            <Clock size={20} className="icon-blue" />
            <h3>Abonelik Durumu</h3>
          </div>
          <div className="settings-card-body">
            <div className="license-stat">
              <span className="stat-label">Kalan Süre:</span>
              <span className={`stat-value ${(!profile.license_end_date || profile.remaining_days >= 7) ? 'success' : 'danger'}`}>
                {!profile.license_end_date ? 'Limitsiz' : `${profile.remaining_days} Gün`}
              </span>
            </div>
            <p className="license-note">Lisans bitiş tarihi: {profile.license_end_date ? new Date(profile.license_end_date).toLocaleDateString('tr-TR') : 'Sınırsız (Ömür Boyu)'}</p>
          </div>
        </div>

        {/* Profil Formu */}
        <div className="settings-card form-card">
          <div className="settings-card-header">
            <Building size={20} className="icon-purple" />
            <h3>Şirket Bilgileri</h3>
          </div>
          <div className="settings-card-body">
            <form onSubmit={handleUpdateProfile} className="settings-form">
              <div className="form-group">
                <label>Admin E-posta</label>
                <input type="text" value={profile.email} disabled className="disabled-input" />
                <span className="input-hint">E-posta adresi değiştirilemez.</span>
              </div>
              
              <div className="form-group">
                <label>Şirket Adı</label>
                <input 
                  type="text" 
                  value={profileForm.company_name} 
                  onChange={(e) => setProfileForm({...profileForm, company_name: e.target.value})} 
                  required
                />
              </div>

              <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '2.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                <Shield size={20} className="icon-red" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '700' }}>Güvenlik</h3>
              </div>
              
              <div className="form-group">
                <label>Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın)</label>
                <input 
                  type="password" 
                  placeholder="******" 
                  value={profileForm.new_password}
                  onChange={(e) => setProfileForm({...profileForm, new_password: e.target.value})}
                  minLength={6}
                />
              </div>

              {profileMessage && (
                <div className={`form-alert ${profileMessage.type}`}>
                  {profileMessage.text}
                </div>
              )}

              <button type="submit" className="save-settings-btn" disabled={profileLoading}>
                {profileLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  if (activeTab === 'shifts') {
    return (
      <div className="planner-full-screen-layout">
        {/* Full-screen planner header */}
        <header className="planner-fs-header">
          <div className="fs-header-left">
            <button onClick={() => setActiveTab('overview')} className="back-to-dashboard-btn">
              ← Yönetim Paneline Dön
            </button>
            <div className="fs-title-box">
              <h2>Vardiya Planlama Çalışma Alanı</h2>
              <p>Çalışanları 1 saatlik dilimlere sürükleyip bırakarak vardiyaları planlayın.</p>
            </div>
          </div>
          <div className="fs-header-right">
            <div className="user-avatar"><User size={20} /></div>
            <div className="user-details">
              <span className="user-email">{localStorage.getItem('email') || 'yonetici@sirket.com'}</span>
              <span className="user-role-label">Şirket Yöneticisi</span>
            </div>
          </div>
        </header>

        <div className="planner-fs-content">
          {message && (
            <div className={`dashboard-alert ${messageType}`}>
              {messageType === 'success' ? '' : ''} {message}
            </div>
          )}
                    {contextMenu && contextMenu.visible && (
            <div 
              className="shift-context-menu" 
              style={{ top: contextMenu.y, left: contextMenu.x }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => { handleEditShiftClick(contextMenu.shift); setContextMenu(null); }}>
                <Edit size={14} /> Düzenle
              </button>
              <button className="danger" onClick={() => { handleDeleteShift(contextMenu.shift.id); setContextMenu(null); }}>
                <X size={14} /> Kaldır
              </button>
            </div>
          )}
          {renderShifts()}
        </div>
        {/* Personel Düzenleme Modalı */}
        {editingEmp && renderEditEmpModal()}

        {/* Özel Saat Belirleme Modalı */}
        {customShiftModal && renderCustomShiftModal()}

        {/* Şablon Hızlı Atama Modalı */}
        {templateAssignModal && renderTemplateAssignModal()}

        {/* Vardiya Düzenleme Modalı */}
        {editingShiftModal && renderEditingShiftModal()}
      </div>
    );
  }

  return (
    <div className="super-admin-dashboard-layout">
      {/* Sol Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="logo-icon"><Zap size={24} color="#7c3aed" /></span>
          <div className="brand-meta">
            <span className="logo-text">Shift<span className="accent">App</span></span>
            <span className="sidebar-role">Şirket Yetkilisi</span>
          </div>
        </div>
        
        <nav className="sidebar-menu">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} className="sidebar-icon" /> Genel Bakış
          </button>
          <button 
            onClick={() => setActiveTab('departments')} 
            className={`sidebar-item ${activeTab === 'departments' ? 'active' : ''}`}
          >
            <Building2 size={18} className="sidebar-icon" /> Departmanlar
          </button>
          <button 
            onClick={() => setActiveTab('employees')} 
            className={`sidebar-item ${activeTab === 'employees' ? 'active' : ''}`}
          >
            <Users size={18} className="sidebar-icon" /> Personel Yönetimi
          </button>
          <button 
            onClick={() => setActiveTab('shifts')} 
            className={`sidebar-item ${activeTab === 'shifts' ? 'active' : ''}`}
          >
            <Calendar size={18} className="sidebar-icon" /> Vardiya Planlama
          </button>
          <button 
            onClick={() => setActiveTab('templates')} 
            className={`sidebar-item ${activeTab === 'templates' ? 'active' : ''}`}
          >
            <Settings size={18} className="sidebar-icon" /> Hazır Vardiyalar
          </button>
          <button 
            onClick={() => setActiveTab('logs')} 
            className={`sidebar-item ${activeTab === 'logs' ? 'active' : ''}`}
          >
            <Activity size={18} className="sidebar-icon" /> İşlem Logları
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <Settings size={18} className="sidebar-icon" /> Ayarlar
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-sidebar-btn">
            <LogOut size={18} className="sidebar-icon" /> Güvenli Çıkış
          </button>
        </div>
      </aside>

      {/* Sağ Ana İçerik Alanı */}
      <div className="main-content">
        <header className="main-header">
          <div className="header-title">
            <h1>{
              activeTab === 'overview' ? 'Şirket Genel Durumu' :
              activeTab === 'departments' ? 'Departman / Görev Yönetimi' :
              activeTab === 'employees' ? 'Personel Kadrosu' :
              activeTab === 'shifts' ? 'Haftalık Vardiya Planı' :
              activeTab === 'templates' ? 'Hazır Vardiya Şablonları' :
              activeTab === 'settings' ? 'Ayarlar ve Şirket Profili' :
              'Şirket İşlem Geçmişi (Audit Logs)'
            }</h1>
            <p>{
              activeTab === 'overview' ? 'Şirketinizin genel durumunu ve lisans bilgilerinizi görüntüleyin.' :
              activeTab === 'departments' ? 'Departmanları ve görev alanlarını yönetin.' :
              activeTab === 'employees' ? 'Personel kadronuzu yönetin ve izin durumlarını takip edin.' :
              activeTab === 'shifts' ? 'Sürükle bırak ile kolayca haftalık vardiyaları planlayın.' :
              activeTab === 'templates' ? 'Sık kullandığınız vardiya şablonlarını yönetin.' :
              activeTab === 'settings' ? 'Şirket profilinizi ve güvenlik ayarlarınızı yapılandırın.' :
              'Sistemdeki son işlemleri ve kullanıcı etkinliklerini inceleyin.'
            }</p>
          </div>
          <div className="user-profile-badge">
            <div className="user-avatar"><User size={20} /></div>
            <div className="user-details">
              <span className="user-email">{localStorage.getItem('email') || 'yonetici@sirket.com'}</span>
              <span className="user-role-label">Şirket Yöneticisi</span>
            </div>
          </div>
        </header>

        <div className="content-container">
          {message && (
            <div className={`dashboard-alert ${messageType}`}>
              {messageType === 'success' ? '' : ''} {message}
            </div>
          )}

          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'departments' && renderDepartments()}
          {activeTab === 'employees' && renderEmployees()}
          {activeTab === 'shifts' && renderShifts()}
          {activeTab === 'templates' && renderTemplates()}
          {activeTab === 'logs' && renderAuditLogs()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>

      {/* Silme Onay Modalı */}
      {confirmModal && renderConfirmModal()}

      {/* Departman Düzenleme Modalı */}
      {editingDept && renderEditDeptModal()}

      {/* Personel Düzenleme Modalı */}
      {editingEmp && renderEditEmpModal()}

      {/* Özel Saat Belirleme Modalı */}
      {customShiftModal && renderCustomShiftModal()}

      {/* Şablon Hızlı Atama Modalı */}
      {templateAssignModal && renderTemplateAssignModal()}

      {/* Vardiya Düzenleme Modalı */}
      {editingShiftModal && renderEditingShiftModal()}

      {/* Şablon Düzenle Modali */}
      {editingTemplate && renderEditTemplateModal()}
    </div>
  );
};

export default AdminDashboard;
