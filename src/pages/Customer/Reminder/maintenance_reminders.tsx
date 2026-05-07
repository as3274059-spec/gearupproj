
import { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "../../../components/Customer/customer_sidebar";
import Header from "../../../components/Customer/customer_header";
import CreateReminderModal from "./create_reminder_modal";
import axios from "axios";
import { useTheme } from "../../../contexts/ThemeContext";
import toast from 'react-hot-toast';

import { BsCalendarPlus } from "react-icons/bs";
import {
  FaTrash, FaCheck, FaPause, FaPlay, FaWrench, FaClock, FaSync, FaHistory, FaCalendarAlt
} from "react-icons/fa";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-md p-4 bg-black/40" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#1e293b] w-full max-w-[320px] rounded-[25px] shadow-2xl p-6 text-center border border-gray-100 dark:border-slate-700" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-orange-500 mb-3 text-4xl font-bold">!</div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white mb-2">{title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
          >
            إلغاء
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all text-sm"
          >
            نعم
          </button>
        </div>
      </div>
    </div>
  );
};

interface Reminder {
  carId: string | number; 
  id: string | number; 
  name: string; 
  title?: string; 
  description?: string; 
  startDate: string; 
  endDate?: string;
  preferredNotificationTime?: string; 
  frequencyType: string | number; 
  intervalValue?: number;
  intervalUnit?: string | number; 
  status: "Active" | "Paused" | "Completed" | "Cancelled";
  nextScheduledAt?: string;
  daysUntilNext?: number;
}

const formatToEgyptDate = (dateString: string) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("T")[0].split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return new Intl.DateTimeFormat("ar-EG", { year: "numeric", month: "long", day: "numeric" }).format(date);
};

const formatToEgyptTime = (timeString: string) => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setUTCHours(parseInt(hours), parseInt(minutes));
  return new Intl.DateTimeFormat("ar-EG", { timeZone: "Africa/Cairo", hour: "2-digit", minute: "2-digit", hour12: true }).format(date);
};

const MaintenanceReminders = () => {
  const { dark } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [cars, setCars] = useState<any[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [completedReminders, setCompletedReminders] = useState<Reminder[]>([]);
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | string | null>(null);

  const [isCompletedDrawerOpen, setIsCompletedDrawerOpen] = useState(false);

  const token = sessionStorage.getItem("userToken");
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [daysAhead, setDaysAhead] = useState<number>(7);

  const fetchUpcoming = useCallback(async () => {
    try {
      const res = await axios.get(
        `https://gearupapp.runasp.net/api/Reminder/upcoming?daysAhead=${daysAhead}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = Array.isArray(res.data) ? res.data : [];
      setUpcomingReminders(data);
    } catch {
      console.error("فشل جلب التذكيرات القادمة");
    }
  }, [token, daysAhead]);

  const fetchReminders = useCallback(async () => {
    if (!selectedCar || cars.length === 0) return;
    const carObj = cars.find((c) => `${c.year} ${c.brand} ${c.model}`.trim() === selectedCar.trim());
    if (!carObj) return;
    try {
      const res = await axios.get(`https://gearupapp.runasp.net/api/Reminder/car/${carObj.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setReminders(Array.isArray(res.data) ? res.data : []);
    } catch { 
      console.error("فشل جلب التذكيرات"); 
    }
  }, [token, selectedCar, cars]);

  const fetchCompleted = useCallback(async () => {
    try {
      const res = await axios.get("https://gearupapp.runasp.net/api/Reminder/completed", { headers: { Authorization: `Bearer ${token}` } });
      setCompletedReminders(Array.isArray(res.data) ? res.data : []);
    } catch { 
      console.error("فشل جلب المكتملة"); 
    }
  }, [token]);

  const refreshAll = useCallback(() => { 
    fetchReminders(); 
    fetchCompleted();
    fetchUpcoming(); 
  }, [fetchReminders, fetchCompleted, fetchUpcoming]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await axios.get("https://gearupapp.runasp.net/api/customers/cars", { headers: { Authorization: `Bearer ${token}` } });
        const carsData = Array.isArray(res.data) ? res.data : (res.data.cars || []);
        setCars(carsData);
        if (carsData.length > 0) {
          const savedCar = localStorage.getItem("selectedCar");
          if (savedCar && carsData.some((c: any) => `${c.year} ${c.brand} ${c.model}` === savedCar)) {
            setSelectedCar(savedCar);
          } else {
            setSelectedCar(`${carsData[0].year} ${carsData[0].brand} ${carsData[0].model}`);
          }
        }
      } catch { 
        console.error("فشل جلب السيارات"); 
      }
    };
    fetchCars();
    fetchCompleted();
    fetchUpcoming();
  }, [token, fetchCompleted, fetchUpcoming]);
  
  useEffect(() => {
    fetchReminders();
  }, [selectedCar, fetchReminders]);

  useEffect(() => {
    const handleRefresh = () => {
      refreshAll(); 
    };
    window.addEventListener("reminderCompleted", handleRefresh);
    window.addEventListener("reminderSnoozed", handleRefresh);
    return () => {
      window.removeEventListener("reminderCompleted", handleRefresh);
      window.removeEventListener("reminderSnoozed", handleRefresh);
    };
  }, [refreshAll]);

  const handleStatusAction = async (id: number | string, action: string) => {
    try {
      await axios.post(`https://gearupapp.runasp.net/api/Reminder/${id}/${action}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(action === "complete" ? "تم تسجيل الإتمام بنجاح" : "تم تحديث الحالة");
      refreshAll();
    } catch { 
      toast.error("حدث خطأ ما"); 
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTargetId) return;
    try {
      await axios.delete(`https://gearupapp.runasp.net/api/Reminder/${deleteTargetId}/delete`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("تم الحذف بنجاح");
      refreshAll();
    } catch { 
      toast.error("فشل الحذف"); 
    }
    setShowConfirm(false);
    setDeleteTargetId(null);
  };

  const hideCompletedReminder = (indexToRemove: number) => {
    setCompletedReminders(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const getFrequencyLabel = (r: any) => {
    const rawType = String(r.frequencyType ?? "").toLowerCase();
    const val = Number(r.intervalValue ?? 0);
    const unitKey = String(r.intervalUnit ?? "0");
    switch (rawType) {
      case "0": case "once": return "مرة واحدة";
      case "1": case "daily": return "يومي";
      case "2": case "weekly": return "أسبوعي";
      case "3": case "monthly": return "شهري";
      case "4": case "yearly": return "سنوي";
      case "5": case "custom": case "custominterval": {
        const unitMap: Record<string, string> = { "0": "أيام", "1": "أسابيع", "2": "شهور", "3": "سنوات" };
        return `كل ${val} ${unitMap[unitKey] ?? "أيام"}`;
      }
      default: return "غير معروف";
    }
  };

  const filteredUpcoming = useMemo(() => {
    const carObj = cars.find(
      (c) => `${c.year} ${c.brand} ${c.model}`.trim() === selectedCar.trim()
    );
    if (!carObj) return [];
    const filtered = upcomingReminders.filter((r) => String(r.carId) === String(carObj.id));
    return filtered;
  }, [upcomingReminders, selectedCar, cars]);

  const filteredActive = useMemo(() => {
    const carObj = cars.find(
      (c) => `${c.year} ${c.brand} ${c.model}`.trim() === selectedCar.trim()
    );
    if (!carObj) return [];
    if (filter === "upcoming") {
      return filteredUpcoming.filter((r) => r.status !== "Completed");
    }
    let list = reminders.filter((r) => String(r.carId) === String(carObj.id) && r.status !== "Completed");
    if (filter !== "all") {
      list = list.filter((r) => r.status === filter);
    }
    return list;
  }, [reminders, filter, selectedCar, cars, filteredUpcoming]);

  const filteredCompleted = useMemo(() => {
    const carObj = cars.find((c) => `${c.year} ${c.brand} ${c.model}`.trim() === selectedCar.trim());
    if (!carObj) return [];
    return completedReminders.filter((r) => String(r.carId) === String(carObj.id));
  }, [completedReminders, selectedCar, cars]);

  return (
     <div className="flex h-screen overflow-hidden dark:bg-primary_BGD" dir="rtl">
      
      {/* --- القائمة الجانبية (Drawer) --- */}
      {/* التعديل: نفس لون كروت التذكيرات (#137FEC33) */}
      <div 
        className={`fixed left-0 top-[210px] bottom-4 bg-white dark:bg-[#137FEC33] backdrop-blur-md shadow-2xl z-[60] transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-blue-500/30 flex flex-col rounded-r-2xl overflow-hidden
        ${isCompletedDrawerOpen ? 'w-[320px]' : 'w-[60px]'}`}
        dir="rtl"
      >
        <div 
          className="h-20 flex flex-col items-center justify-center px-4 border-b border-slate-100 dark:border-blue-500/30 cursor-pointer hover:bg-slate-50 dark:hover:bg-blue-600/30 transition-colors gap-1"
          onClick={() => setIsCompletedDrawerOpen(!isCompletedDrawerOpen)}
        >
          <div className="flex items-center gap-2">
            <FaHistory className="text-blue-500 text-xl" />
            {isCompletedDrawerOpen && (
              <span className="font-black text-slate-900 dark:text-white text-sm whitespace-nowrap leading-tight">
                المهام المكتملة
              </span>
            )}
          </div>
        </div>

        {isCompletedDrawerOpen && (
          <div className="flex-1 overflow-y-auto p-4 custom-scroll">
            <div className="space-y-4 pr-2 pl-2">   
              {filteredCompleted.length > 0 ? filteredCompleted.map((r, idx) => (
                <div 
                  key={idx} 
                  className="w-full flex flex-row items-center h-16 px-5 py-3 rounded-[1.5rem] transition-all duration-300 group
                             bg-slate-50 dark:bg-blue-900/50 
                             hover:bg-blue-50 dark:hover:bg-blue-800
                             border border-slate-100 dark:border-blue-500/30 mb-3 shadow-sm"
                  dir="rtl" 
                >
                  <div className="flex flex-col text-right ml-auto overflow-hidden pointer-events-none">
                    <p className="font-bold text-[14px] text-slate-700 dark:text-white transition-colors">
                      {r.name || r.title || "تذكير مكتمل"}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-300 font-bold mt-0.5">
                      {formatToEgyptDate(r.startDate)}
                    </p>
                  </div>

                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); hideCompletedReminder(idx); }} 
                    className="text-slate-400 dark:text-slate-300 hover:text-red-500 transition-colors p-2 flex items-center justify-center cursor-pointer min-w-[32px] h-[32px] rounded-full"
                  >
                    <span className="text-xl font-light leading-none">✕</span>
                  </button>
                </div>
              )) : (
                <p className="text-xs text-slate-400 italic text-center py-4">لا يوجد سجلات لهذه السيارة.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <style>{`
            .custom-scroll::-webkit-scrollbar { width: 6px; }
            .custom-scroll::-webkit-scrollbar-track { background: transparent; }
            .custom-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            .dark .custom-scroll::-webkit-scrollbar-thumb { background-color: #475569; }
          `}</style>

          <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-2xl md:text-3xl font-black mb-2 tracking-tight text-slate-900 dark:text-white">
                تذكيرات الصيانة
              </h3>
              <p className="font-medium text-base italic" style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(15,19,35,0.5)' }}>إدارة تذكيرات سيارتك ومتابعة مواعيدها</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 transition flex items-center gap-2">
              <BsCalendarPlus size={16} /> إنشاء تذكير جديد
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-9 space-y-6 order-1 flex flex-col h-full">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
                <h6 className="text-2xl font-black text-slate-800 dark:text-white">المهام ({filteredActive.length})</h6>

                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shadow-inner">
                  <div className="flex bg-white dark:bg-slate-700 p-0.5 rounded-xl">
                    {["upcoming", "all", "Active", "Paused"].map((f) => (
                      <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${filter === f ? "bg-blue-600 text-white shadow-md" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"}`}>
                        {f === "upcoming"
  ? "القادمة"
  : f === "all"
  ? "الكل"
  : f === "Active"
  ? "نشط"
  : "متوقفة"}
                      </button>
                    ))}
                  </div>
                  <select value={selectedCar} onChange={(e) => { setSelectedCar(e.target.value); localStorage.setItem("selectedCar", e.target.value); }} className={`bg-transparent font-bold text-xs md:text-xs outline-none cursor-pointer px-2 py-1 ${dark ? "text-white" : "text-slate-800"}`}>
                    {cars.map((car, idx) => (
                      <option key={idx} value={`${car.year} ${car.brand} ${car.model}`}>{car.year} {car.brand} {car.model}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-6 max-h-[700px] overflow-y-auto overflow-x-hidden pr-2 pl-4 custom-scroll pb-4">
                {filteredActive.length > 0 ? filteredActive.map((r) => {
                  const dateToShow = r.nextScheduledAt ? formatToEgyptDate(r.nextScheduledAt) : formatToEgyptDate(r.startDate);

                  return (
                  <div key={r.id} className="p-4 sm:p-6 md:p-4 rounded-2xl sm:rounded-[2.5rem] shadow-lg border transition-all dark:bg-[#137FEC33] dark:border-slate-600 border-slate-200 hover:shadow-xl hover:scale-105 transform-gpu duration-300">
                    <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6 items-start sm:items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-lg shadow-inner bg-blue-50 text-blue-500 dark:bg-blue-500/10">
                          <FaWrench />
                        </div>
                        <div className="space-y-1">
                          <span className={`inline-block mb-2 px-3 py-1 rounded-full font-bold text-xs ${r.status === "Active" ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300"}`}>
                            {r.status === "Active" ? "نشط" : "متوقفة"}
                          </span>
                          <h1 className="text-2xl font-black text-slate-700 dark:text-slate-200">{r.name}</h1>
                          {r.description && <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic">"{r.description}"</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:flex md:flex-col gap-3 text-xs font-bold border-r-2 border-slate-200 dark:border-slate-600 pr-0 md:pr-6 min-w-[150px]">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200"><FaClock className="text-blue-500" /> {r.preferredNotificationTime ? formatToEgyptTime(r.preferredNotificationTime) : "غير محدد"}</div>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200"><FaSync className="text-blue-500" /> {getFrequencyLabel(r)}</div>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200"><FaCalendarAlt className="text-blue-500" /> {dateToShow}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-200 dark:border-slate-600 px-2">
                      {r.status === "Active" && (
                        <button onClick={() => handleStatusAction(r.id, "complete")} className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 px-5 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-2 hover:bg-emerald-200 transition">
                          <FaCheck size={11} /> إتمام
                        </button>
                      )}
                      <button onClick={() => handleStatusAction(r.id, r.status === "Active" ? "pause" : "activate")} className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 px-5 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-2 hover:bg-amber-200 transition">
                        {r.status === "Active" ? <><FaPause size={10} /> إيقاف</> : <><FaPlay size={10} /> تنشيط</>}
                      </button>
                      <button onClick={() => { setDeleteTargetId(r.id); setShowConfirm(true); }} className="bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 px-5 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-2 hover:bg-red-200 transition">
                        <FaTrash size={10} /> حذف
                      </button>
                    </div>
                  </div>
                )}) : <p className="text-center py-20 text-slate-400 font-bold">لا يوجد تذكيرات حالية.</p>}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <ConfirmModal isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDeleteConfirmed} title="هل أنت متأكد؟" message="لن تتمكن من استعادة بيانات هذا التذكير!" />
      <CreateReminderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} cars={cars} selectedCar={selectedCar} setSelectedCar={setSelectedCar} onSuccess={refreshAll} />
    </div>
  );
};

export default MaintenanceReminders;
