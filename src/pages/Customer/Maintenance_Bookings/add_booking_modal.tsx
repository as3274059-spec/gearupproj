import { useEffect, useMemo, useState, useRef } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import {
  MdCalendarMonth,
  MdAccessTime,
  MdKeyboardArrowDown,
  MdClose,
  MdDirectionsCar,
  MdBuild,
  MdPerson,
} from "react-icons/md";

interface MechanicOption { id: string; name: string; }
interface CarApiItem { id: string; brand: string; model: string; year: number; plateNumber: string; carPhotoUrl: string; }
interface CarOption { id: string; name: string; }
interface PricedServiceOption { id: string; name: string; price: number; subSpecializationId: string; }

interface AddBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mechanicId?: string;
  preselectedMechanicId?: string;
}

const API_BASE_URL = "https://gearupapp.runasp.net/api";

// ✅ Reusable Custom Dropdown
interface CustomDropdownProps {
  value: string;
  onChange: (id: string) => void;
  options: { id: string; label: string }[];
  placeholder: string;
  icon: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

const CustomDropdown = ({
  value,
  onChange,
  options,
  placeholder,
  icon,
  disabled = false,
  loading = false,
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.id === value)?.label ?? "";

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const inputStyle =
    "w-full bg-gray-100 dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-800 dark:text-blue-400 font-bold outline-none transition-all focus:border-blue-500/50";

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { if (!disabled) setIsOpen((prev) => !prev); }}
        className={`${inputStyle} pr-12 flex items-center justify-between w-full
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-200 dark:hover:bg-[#0F172A]"}`}
        dir="rtl"
      >
        <span className={selectedLabel ? "text-gray-800 dark:text-blue-400" : "text-gray-400 dark:text-gray-500 font-normal"}>
          {loading ? "جاري تحميل..." : selectedLabel || placeholder}
        </span>
        <MdKeyboardArrowDown
          className={`text-gray-500 text-2xl transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Icon */}
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#137FEC] text-xl pointer-events-none">
        {icon}
      </span>

      {/* Dropdown List */}
      {isOpen && !disabled && (
        <div
          className="absolute top-full mt-2 w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          dir="rtl"
        >
          <div className="max-h-52 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-400 dark:text-gray-500 text-sm">
                لا توجد خيارات
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onChange(option.id); setIsOpen(false); }}
                  className={`w-full text-right px-4 py-3 text-sm font-semibold transition-colors hover:bg-blue-50 dark:hover:bg-[#0F172A] flex items-center gap-3
                    ${value === option.id
                      ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-200"
                    }`}
                >
                  <span className={`text-lg flex-shrink-0 ${value === option.id ? "text-blue-500" : "text-gray-400"}`}>
                    {icon}
                  </span>
                  {option.label}
                  {value === option.id && (
                    <span className="mr-auto text-blue-500 text-xs">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ Searchable Dropdown (للميكانيكي)
interface SearchableDropdownProps {
  value: string;
  onChange: (id: string) => void;
  options: { id: string; label: string }[];
  placeholder: string;
  icon: React.ReactNode;
  loading?: boolean;
}

const SearchableDropdown = ({
  value,
  onChange,
  options,
  placeholder,
  icon,
  loading = false,
}: SearchableDropdownProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = options.find((o) => o.id === value)?.label ?? "";

  const filtered = useMemo(() => {
    if (!inputValue.trim() || inputValue === selectedLabel) return options;
    return options.filter((o) => o.label.toLowerCase().includes(inputValue.toLowerCase()));
  }, [options, inputValue, selectedLabel]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setInputValue(selectedLabel);
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [selectedLabel]);

  useEffect(() => {
    if (value && selectedLabel) setInputValue(selectedLabel);
  }, [selectedLabel, value]);

  const inputStyle =
    "w-full bg-gray-100 dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-800 dark:text-blue-400 font-bold outline-none transition-all focus:border-blue-500/50";

  return (
    <div ref={ref} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => { setInputValue(e.target.value); onChange(""); setIsOpen(true); }}
        onFocus={() => { setInputValue(""); setIsOpen(true); }}
        placeholder={loading ? "جاري تحميل..." : placeholder}
        className={`${inputStyle} pr-12 pl-10 cursor-text`}
        dir="rtl"
        autoComplete="off"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#137FEC] text-xl pointer-events-none">
        {icon}
      </span>
      <MdKeyboardArrowDown
        onClick={() => {
          if (isOpen) { setInputValue(selectedLabel); setIsOpen(false); }
          else { setInputValue(""); setIsOpen(true); inputRef.current?.focus(); }
        }}
        className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-2xl cursor-pointer transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      />

      {isOpen && (
        <div
          className="absolute top-full mt-2 w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          dir="rtl"
        >
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-400 dark:text-gray-500 text-sm">
                لا توجد نتائج
              </div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onChange(option.id); setInputValue(option.label); setIsOpen(false); }}
                  className={`w-full text-right px-4 py-3 text-sm font-semibold transition-colors hover:bg-blue-50 dark:hover:bg-[#0F172A] flex items-center gap-3
                    ${value === option.id
                      ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-200"
                    }`}
                >
                  <span className={`text-lg flex-shrink-0 ${value === option.id ? "text-blue-500" : "text-gray-400"}`}>
                    {icon}
                  </span>
                  {option.label}
                  {value === option.id && (
                    <span className="mr-auto text-blue-500 text-xs">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ Main Component
const AddBookingModal = ({
  isOpen,
  onClose,
  onSuccess,
  mechanicId: legacyMechanicId,
  preselectedMechanicId,
}: AddBookingModalProps) => {
  const effectivePreselectedId = preselectedMechanicId || legacyMechanicId;

  const [mechanicId, setMechanicId] = useState("");
  const [carId, setCarId] = useState("");
  const [mechanicServiceId, setMechanicServiceId] = useState("");
  const [date, setDate] = useState("");
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");
  const [loading, setLoading] = useState(false);

  const [cars, setCars] = useState<CarOption[]>([]);
  const [mechanics, setMechanics] = useState<MechanicOption[]>([]);
  const [pricedServices, setPricedServices] = useState<PricedServiceOption[]>([]);

  const [loadingCars, setLoadingCars] = useState(false);
  const [loadingMechanics, setLoadingMechanics] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  const labelStyle = "text-right font-bold text-gray-700 dark:text-white mb-2 block text-sm pr-1";
  const inputStyle = "w-full bg-gray-100 dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-800 dark:text-blue-400 font-bold outline-none cursor-pointer hover:bg-gray-200 dark:hover:bg-[#0F172A] transition-all focus:border-blue-500/50";

  const minDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  // تحويل البيانات لـ options format
  const mechanicOptions = useMemo(() => mechanics.map((m) => ({ id: m.id, label: m.name })), [mechanics]);
  const carOptions = useMemo(() => cars.map((c) => ({ id: c.id, label: c.name })), [cars]);
  const serviceOptions = useMemo(() => pricedServices.map((s) => ({ id: s.id, label: `${s.name} - ${s.price} EGP` })), [pricedServices]);

  const getToken = () => sessionStorage.getItem("userToken");
  const getAuthHeaders = () => {
    const token = getToken();
    if (!token) return { Accept: "*/*" };
    return { Authorization: `Bearer ${token}`, Accept: "*/*" };
  };

  const fetchCars = async () => {
    try {
      const token = getToken();
      if (!token) { setCars([]); return; }
      setLoadingCars(true);
      const response = await axios.get(`${API_BASE_URL}/customers/cars`, { headers: getAuthHeaders() });
      const carsData: CarApiItem[] = response?.data?.cars ?? [];
      setCars(carsData.map((car) => ({ id: car.id, name: `${car.brand} ${car.model} - ${car.year}` })));
    } catch (error: any) {
      console.error("Fetch cars error:", error?.response?.data || error);
      setCars([]);
    } finally { setLoadingCars(false); }
  };

  const fetchMechanics = async () => {
    try {
      setLoadingMechanics(true);
      const response = await axios.get(`${API_BASE_URL}/mechanics`, { headers: { Accept: "*/*" } });
      const data = response?.data?.data || [];
      setMechanics(
        data.filter((item: any) => item.mechanicProfileId)
            .map((item: any) => ({ id: item.id, name: `${item.firstName} ${item.lastName}` }))
      );
    } catch (error: any) {
      console.error("Fetch mechanics error:", error?.response?.data || error);
      setMechanics([]);
    } finally { setLoadingMechanics(false); }
  };

  const fetchMechanicServices = async (selectedMechanicId: string) => {
    try {
      if (!selectedMechanicId) { setPricedServices([]); setMechanicServiceId(""); return; }
      setLoadingServices(true);
      setPricedServices([]);
      setMechanicServiceId("");
      const response = await axios.get(
        `${API_BASE_URL}/specializations/mechanic/${selectedMechanicId}/priced-services`,
        { headers: getAuthHeaders() }
      );
      const data = Array.isArray(response.data) ? response.data : Array.isArray(response.data?.data) ? response.data.data : [];
      setPricedServices(data.map((item: any) => ({
        id: item.id,
        name: item.subSpecializationName,
        price: Number(item.price ?? 0),
        subSpecializationId: item.subSpecializationId,
      })));
    } catch (error: any) {
      console.error("Fetch services error:", error?.response?.data || error);
      setPricedServices([]);
    } finally { setLoadingServices(false); }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchCars();
    fetchMechanics();
    if (effectivePreselectedId) {
      setMechanicId(effectivePreselectedId);
      fetchMechanicServices(effectivePreselectedId);
    } else {
      setMechanicId("");
      setPricedServices([]);
    }
    setCarId("");
    setMechanicServiceId("");
    setDate("");
    setSlotStart("");
    setSlotEnd("");
  }, [isOpen, effectivePreselectedId]);

  if (!isOpen) return null;

  const resetForm = () => {
    setMechanicId(""); setCarId(""); setMechanicServiceId("");
    setPricedServices([]); setDate(""); setSlotStart(""); setSlotEnd("");
  };

  const closeModal = () => { resetForm(); onClose(); };
  const toApiTimeFormat = (time: string) => (!time ? "" : time.length === 5 ? `${time}:00` : time);

  const handleSubmit = async () => {
    if (!mechanicId || !carId || !mechanicServiceId || !date || !slotStart || !slotEnd) {
      Swal.fire({ icon: "warning", title: "تنبيه", text: "من فضلك املي كل البيانات المطلوبة.", confirmButtonColor: "#f59e0b", confirmButtonText: "حسنًا" });
      return;
    }
    if (slotEnd <= slotStart) {
      Swal.fire({ icon: "warning", title: "تنبيه", text: "وقت النهاية لازم يكون بعد وقت البداية.", confirmButtonColor: "#f59e0b", confirmButtonText: "حسنًا" });
      return;
    }
    try {
      const token = getToken();
      if (!token) {
        Swal.fire({ icon: "warning", title: "تنبيه", text: "انتهت الجلسة. الرجاء تسجيل الدخول مرة أخرى.", confirmButtonColor: "#f59e0b", confirmButtonText: "حسنًا" });
        return;
      }
      setLoading(true);
      const payload = { mechanicId, carId, mechanicServiceId, date, slotStart: toApiTimeFormat(slotStart), slotEnd: toApiTimeFormat(slotEnd) };
      await axios.post(`${API_BASE_URL}/bookings`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "*/*" },
      });
      Swal.fire({ icon: "success", title: "تم بنجاح", text: "تم إضافة الحجز بنجاح!", confirmButtonText: "حسنًا", confirmButtonColor: "#137FEC" });
      setTimeout(async () => { await onSuccess?.(); resetForm(); onClose(); }, 500);
    } catch (error: any) {
      const apiErrors = error?.response?.data?.errors;
      const message = apiErrors?.mechanicId?.[0] || apiErrors?.carId?.[0] || apiErrors?.mechanicServiceId?.[0] ||
        apiErrors?.date?.[0] || apiErrors?.slotStart?.[0] || apiErrors?.slotEnd?.[0] ||
        error?.response?.data?.error || error?.response?.data?.title ||
        error?.response?.data?.message || "حدث خطأ أثناء إنشاء الحجز.";
      Swal.fire({ icon: "error", title: "خطأ", text: message, confirmButtonColor: "#dc2626", confirmButtonText: "حسنًا" });
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />

<div className="relative w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-[40px] shadow-2xl border border-gray-200 dark:border-blue-500/20 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto scrollbar-hide">        <button type="button" onClick={closeModal} className="absolute top-6 left-6 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors z-10">
          <MdClose size={30} />
        </button>

        <div className="p-8 md:p-12">
          <div className="mb-10 text-center">
            <h2 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white">إضافة حجز جديد</h2>
            <p className="mt-2 text-sm md:text-base text-gray-500 dark:text-gray-300">اختار الميكانيكي والخدمة والسيارة وحدد الموعد المناسب</p>
          </div>

          <div className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* الميكانيكي — Searchable */}
              <div className="text-right">
                <label className={labelStyle}>الميكانيكي</label>
                <SearchableDropdown
                  value={mechanicId}
                  onChange={(id) => { setMechanicId(id); fetchMechanicServices(id); }}
                  options={mechanicOptions}
                  placeholder="اختر الميكانيكي..."
                  icon={<MdPerson />}
                  loading={loadingMechanics}
                />
              </div>

              {/* الخدمة — Custom Dropdown */}
              <div className="text-right">
                <label className={labelStyle}>نوع الخدمة</label>
                <CustomDropdown
                  value={mechanicServiceId}
                  onChange={setMechanicServiceId}
                  options={serviceOptions}
                  placeholder={!mechanicId ? "اختر الميكانيكي أولًا..." : pricedServices.length === 0 ? "لا توجد خدمات" : "اختر الخدمة..."}
                  icon={<MdBuild />}
                  disabled={!mechanicId || loadingServices || pricedServices.length === 0}
                  loading={loadingServices}
                />
              </div>
            </div>

            {/* السيارة — Custom Dropdown */}
            <div className="text-right">
              <label className={labelStyle}>اختيار السيارة</label>
              <CustomDropdown
                value={carId}
                onChange={setCarId}
                options={carOptions}
                placeholder={cars.length === 0 ? "لا توجد سيارات" : "اختر السيارة..."}
                icon={<MdDirectionsCar />}
                disabled={loadingCars || cars.length === 0}
                loading={loadingCars}
              />
            </div>

            {/* التاريخ والوقت */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="text-right">
                <label className={labelStyle}>التاريخ</label>
                <div className="relative">
                  <input type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)}
                    className={`${inputStyle} custom-date-input pl-12 text-center md:text-right`} dir="rtl" />
                  <MdCalendarMonth className="absolute left-4 top-1/2 -translate-y-1/2 text-[#137FEC] text-xl pointer-events-none" />
                </div>
              </div>
              <div className="text-right">
                <label className={labelStyle}>وقت البداية</label>
                <div className="relative">
                  <input type="time" value={slotStart} onChange={(e) => setSlotStart(e.target.value)}
                    className={`${inputStyle} custom-time-input pl-12 text-center md:text-right`} dir="rtl" />
                  <MdAccessTime className="absolute left-4 top-1/2 -translate-y-1/2 text-[#137FEC] text-xl pointer-events-none" />
                </div>
              </div>
              <div className="text-right">
                <label className={labelStyle}>وقت النهاية</label>
                <div className="relative">
                  <input type="time" value={slotEnd} onChange={(e) => setSlotEnd(e.target.value)}
                    className={`${inputStyle} custom-time-input pl-12 text-center md:text-right`} dir="rtl" />
                  <MdAccessTime className="absolute left-4 top-1/2 -translate-y-1/2 text-[#137FEC] text-xl pointer-events-none" />
                </div>
              </div>
            </div>

            {/* الأزرار */}
            <div className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:justify-center" dir="rtl">
                <button type="button" onClick={closeModal} disabled={loading}
                  className="sm:min-w-[160px] bg-gray-100 text-gray-700 dark:bg-[#0F1323] dark:text-white px-8 py-4 rounded-2xl font-black text-lg border border-gray-200 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-[#1e293b] transition-all disabled:opacity-60">
                  إلغاء
                </button>
                <button type="button" onClick={handleSubmit} disabled={loading}
                  className="sm:min-w-[220px] bg-[#137FEC] text-white px-8 py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:hover:scale-100">
                  {loading ? "جاري إرسال الحجز..." : "إرسال طلب الحجز"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-date-input::-webkit-calendar-picker-indicator,
        .custom-time-input::-webkit-calendar-picker-indicator {
          position: absolute; top: 0; left: 0;
          width: 100%; height: 100%;
          background: transparent; cursor: pointer; opacity: 0;
            .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        }
      `}</style>
    </div>
  );
};

export default AddBookingModal;