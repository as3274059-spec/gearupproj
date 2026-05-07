import { useState, useEffect, useRef } from "react";
import {
  MdCloudUpload, MdEdit, MdDelete, MdAdd, MdSave,
  MdKeyboardArrowDown, MdKeyboardArrowUp, MdClose, MdDirectionsCar, MdSearch
} from "react-icons/md";
import Swal from "sweetalert2";

interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  carPhotoUrl: string;
}

interface MyCarsProps {
  inputStyle?: string;
}

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1999 + 1 }, (_, i) => currentYear - i);

const FIELD_CLASS = "w-full text-right font-semibold py-3 px-4 rounded-2xl transition-all duration-200 border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-blue-400 ring-2 ring-blue-100 dark:ring-blue-900/40 shadow-sm focus:outline-none appearance-none";

const isDarkMode = () => document.documentElement.classList.contains('dark');

const InfoCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700">
    <p className="text-[10px] sm:text-[11px] text-gray-400 font-bold mb-1 uppercase tracking-wide">{label}</p>
    <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{value}</p>
  </div>
);

const PhotoUploader = ({ id, previewSrc, onChange }: { id: string; previewSrc?: string | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }) => (
  <div className="flex justify-center flex-shrink-0">
    <div className="relative">
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl border-4 border-blue-50 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center">
        {previewSrc ? <img src={previewSrc} className="w-full h-full object-cover" alt="preview" /> : (
          <div className="text-center p-2">
            <MdCloudUpload size={28} className="text-blue-200 mx-auto mb-1" />
            <p className="text-[10px] text-gray-400 font-bold">ارفع صورة</p>
          </div>
        )}
      </div>
      <label htmlFor={id} className="absolute -bottom-2 -right-2 bg-[#137FEC] hover:bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110">
        <MdCloudUpload size={15} />
      </label>
    </div>
    <input type="file" id={id} className="hidden" accept="image/*" onChange={onChange} />
  </div>
);

// --- مكون اختيار السنة ---
const CustomYearSelect = ({ value, onChange, years }: { value: string, onChange: (year: string) => void, years: number[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`${FIELD_CLASS} !pr-10 cursor-pointer flex items-center justify-between`}
      >
        <span className={!value ? "text-gray-400 font-normal" : ""}>{value || "اختر سنة الصنع"}</span>
        <MdKeyboardArrowDown className="text-gray-400" size={20} />
      </div>
      
      {/* تم تغيير z-50 إلى z-[9999] للتأكد من ظهورها فوق الكروت */}
      {isOpen && (
        <ul className="absolute z-[9999] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
          {years.map((y) => (
            <li
              key={y}
              onClick={() => { onChange(y.toString()); setIsOpen(false); }}
              className={`px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer text-gray-800 dark:text-gray-200 text-sm border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors flex justify-between items-center ${value === y.toString() ? "bg-blue-50 dark:bg-blue-900/20 text-[#137FEC]" : ""}`}
            >
              <span>{y}</span>
              {value === y.toString() && <MdKeyboardArrowDown className="text-[#137FEC] transform rotate-0" size={16} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// --- مكون البحث والاختيار للماركات ---
const SearchableBrandSelect = ({ value, onSelect, token }: { value: string, onSelect: (brand: string) => void, token: string | null }) => {
  const [query, setQuery] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const fetchBrands = async (searchTerm: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://gearupapp.runasp.net/api/customers/cars/brands/search?query=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBrands(data.brands || []);
      } else {
        setBrands([]);
      }
    } catch (e) { 
      console.error("Error searching brands:", e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBrands(query);
      if (!hasInitialized && query === "") {
        setHasInitialized(true);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, token]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => { 
            setIsOpen(true); 
            if (!hasInitialized) {
              fetchBrands(query);
              setHasInitialized(true);
            }
          }}
          placeholder="ابحث عن الماركة أو اختر من القائمة"
          className={`${FIELD_CLASS} !pr-10`}
        />
        <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      </div>
      
      {/* تم تغيير z-50 إلى z-[9999] للتأكد من ظهورها فوق الكروت */}
      {isOpen && (brands.length > 0 || loading) && (
        <ul className="absolute z-[9999] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
          {loading ? (
            <li className="px-4 py-3 text-center text-sm text-gray-500 flex justify-center items-center gap-2">
              جاري التحميل... <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></span>
            </li>
          ) : (
            <>
              {brands.map((brand) => (
                <li
                  key={brand}
                  onClick={() => { onSelect(brand); setQuery(brand); setIsOpen(false); }}
                  className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer text-gray-800 dark:text-gray-200 text-sm border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors flex justify-between items-center"
                >
                  <span>{brand}</span>
                  {brand === query && <MdKeyboardArrowDown className="text-blue-500" size={16} />}
                </li>
              ))}
              {brands.length === 0 && !loading && (
                 <li className="px-4 py-3 text-center text-sm text-gray-400">لا توجد نتائج مطابقة</li>
              )}
            </>
          )}
        </ul>
      )}
    </div>
  );
};

export const MyCars = ({}: MyCarsProps) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [expandedCarId, setExpandedCarId] = useState<string | null>(null);
  const [editModeId, setEditModeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const [newCar, setNewCar] = useState({ brand: "", model: "", year: "", plateNumber: "" });
  const [newCarPhoto, setNewCarPhoto] = useState<File | null>(null);

  const [editData, setEditData] = useState<Car | null>(null);
  const [editCarPhoto, setEditCarPhoto] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);

  const token = sessionStorage.getItem("userToken");
  const BASE_URL = "https://gearupapp.runasp.net/api/customers/cars";

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await fetch(BASE_URL, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setCars(d.cars); }
    } catch (e) { console.error(e); }
  };

  const fetchModelsList = async (brandName: string) => {
    if (!brandName) {
      setModels([]);
      return;
    }
    setLoadingModels(true);
    try {
      const res = await fetch(`${BASE_URL}/models/search?brand=${encodeURIComponent(brandName)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setModels(data.models || []);
      } else {
        setModels([]);
      }
    } catch (e) {
      console.error("Error fetching models:", e);
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const showToast = (icon: any, title: string) => {
    Swal.fire({
      icon, title,
      toast: true, position: 'top-end',
      showConfirmButton: false, timer: 3000,
      timerProgressBar: true,
      background: isDarkMode() ? '#1B1F2D' : '#fff',
      color: isDarkMode() ? '#fff' : '#000',
    });
  };

  const validatePlate = (plate: string) => {
    const trimmed = plate.trim();
    return trimmed.length > 0 && /^[\u0600-\u06FF0-9\s]+$/.test(trimmed);
  };

  const handleAddCar = async () => {
    if (!newCar.brand || !newCar.model || !newCarPhoto || !newCar.plateNumber) {
      return Swal.fire({
        icon: 'warning', title: 'بيانات ناقصة', text: 'يرجى ملء كافة البيانات وصورة السيارة',
        confirmButtonColor: '#137FEC',
        background: isDarkMode() ? '#1B1F2D' : '#fff',
        color: isDarkMode() ? '#fff' : '#000',
      });
    }
    if (!validatePlate(newCar.plateNumber)) {
      return Swal.fire({
        icon: 'error',
        title: 'تنسيق اللوحة غير صحيح',
        text: 'يجب أن تحتوي اللوحة على حروف عربية وأرقام فقط',
        confirmButtonColor: '#137FEC',
        background: isDarkMode() ? '#1B1F2D' : '#fff',
        color: isDarkMode() ? '#fff' : '#000',
      });
    }
    setLoading(true);
    const fd = new FormData();
    fd.append("Brand", newCar.brand);
    fd.append("Model", newCar.model);
    fd.append("Year", newCar.year);
    fd.append("PlateNumber", newCar.plateNumber.trim());
    fd.append("CarPhoto", newCarPhoto);

    try {
      const res = await fetch(`${BASE_URL}/register`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd
      });
      if (res.ok) {
        setNewCar({ brand: "", model: "", year: "", plateNumber: "" });
        setNewCarPhoto(null);
        setModels([]);
        setShowAddForm(false);
        fetchCars();
        showToast('success', 'تمت إضافة السيارة بنجاح');
      } else { showToast('error', 'فشل إضافة السيارة'); }
    } catch { showToast('error', 'فشل الاتصال بالسيرفر'); }
    finally { setLoading(false); }
  };

  const handleUpdateCar = async () => {
    if (!editData) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("Brand", editData.brand);
    fd.append("Model", editData.model);
    fd.append("Year", editData.year.toString());
    if (editCarPhoto) fd.append("CarPhoto", editCarPhoto);

    try {
      const res = await fetch(`${BASE_URL}/${editData.id}`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: fd
      });
      if (res.ok) {
        setEditModeId(null); setEditCarPhoto(null); setEditPreviewUrl(null);
        setModels([]);
        fetchCars(); showToast('success', 'تم تحديث البيانات');
      } else showToast('error', 'فشل التحديث');
    } catch { showToast('error', 'فشل الاتصال بالسيرفر'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "لن تتمكن من استعادة بيانات هذه السيارة!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#137FEC',
      confirmButtonText: 'نعم، احذفها',
      cancelButtonText: 'إلغاء',
      background: isDarkMode() ? '#1B1F2D' : '#fff',
      color: isDarkMode() ? '#fff' : '#000',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { setCars(cars.filter(c => c.id !== id)); showToast('success', 'تم الحذف بنجاح'); }
      } catch { showToast('error', 'فشل الحذف'); }
    }
  };

  return (
    <div className="bg-white dark:bg-primary_BGD border border-gray-100 dark:border-gray-700 rounded-[32px] sm:rounded-[40px] p-4 sm:p-8 md:p-10 shadow-xl" dir="rtl">
      <div className="flex items-center justify-between mb-5 border-b pb-4 dark:border-gray-700">
        <h2 className="text-[#137FEC] text-lg sm:text-2xl font-black flex items-center gap-2">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-1.5 sm:p-2 rounded-xl">
            <MdDirectionsCar size={22} className="text-[#137FEC]" />
          </div>
          سياراتي
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 ${showAddForm ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300" : "bg-[#137FEC] hover:bg-blue-600 text-white shadow-md"}`}
        >
          {showAddForm ? <><MdClose size={15} /> إلغاء</> : <><MdAdd size={15} /> <span>إضافة سيارة</span></>}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-5 border border-dashed border-blue-200 dark:border-blue-900/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-blue-50/30 dark:bg-blue-900/10">
          <div className="flex flex-col gap-5">
            <PhotoUploader id="newCarPhoto" previewSrc={newCarPhoto ? URL.createObjectURL(newCarPhoto) : null} onChange={(e) => setNewCarPhoto(e.target.files?.[0] || null)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-extrabold text-[#137FEC]">الماركة (Brand)</label>
                <SearchableBrandSelect 
                  value={newCar.brand} 
                  token={token}
                  onSelect={(selectedBrand) => {
                    setNewCar({ ...newCar, brand: selectedBrand, model: "" });
                    fetchModelsList(selectedBrand);
                  }} 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-extrabold text-[#137FEC]">الموديل (Model)</label>
                <select 
                  className={FIELD_CLASS} 
                  value={newCar.model} 
                  disabled={!newCar.brand || loadingModels}
                  onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                >
                  <option value="">{newCar.brand ? "اختر الموديل" : "يرجى اختيار الماركة أولاً"}</option>
                  {models.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                {loadingModels && <p className="text-xs text-blue-400 mt-1">جاري تحميل الموديلات...</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-extrabold text-[#137FEC]">سنة الصنع</label>
                <CustomYearSelect 
                  value={newCar.year} 
                  years={YEARS}
                  onChange={(year) => setNewCar({ ...newCar, year })} 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-extrabold text-[#137FEC]">رقم اللوحة</label>
                <input 
                  type="text" 
                  placeholder="مثال: أ ب ج 123" 
                  className={FIELD_CLASS} 
                  value={newCar.plateNumber} 
                  onChange={(e) => setNewCar({ ...newCar, plateNumber: e.target.value.replace(/[^\u0600-\u06FF0-9\s]/g, "") })} 
                />
              </div>
            </div>
            <button onClick={handleAddCar} disabled={loading} className="w-full bg-[#137FEC] hover:bg-blue-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 text-sm">
              <MdAdd size={18} /> {loading ? "جاري الإضافة..." : "تأكيد الإضافة"}
            </button>
          </div>
        </div>
      )}

      {cars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-center px-4">
          <MdDirectionsCar size={44} className="text-gray-200 dark:text-gray-700 mb-3" />
          <p className="font-bold text-gray-400 mb-1 text-sm">لا توجد سيارات مضافة بعد</p>
          <p className="text-xs text-gray-300 dark:text-gray-600">اضغط "إضافة سيارة" للبدء</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {cars.map((car) => {
            const isExpanded = expandedCarId === car.id;
            const isEditMode = editModeId === car.id;

            return (
               <div key={car.id} className="border border-gray-100 dark:border-gray-700/70 rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-800/30 shadow-sm">                <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-1 min-w-0" onClick={() => !isEditMode && setExpandedCarId(isExpanded ? null : car.id)}>
                    <div className="w-12 h-9 sm:w-16 sm:h-11 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 flex-shrink-0">
                      <img src={car.carPhotoUrl} alt={car.brand} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-gray-800 dark:text-white truncate text-sm sm:text-base">{car.brand} {car.model}</p>
                      <p className="text-[11px] sm:text-xs text-gray-400 truncate">{car.year} · {car.plateNumber}</p>
                    </div>
                    {!isEditMode && <span className="text-gray-400 flex-shrink-0">{isExpanded ? <MdKeyboardArrowUp size={20} className="text-[#137FEC]" /> : <MdKeyboardArrowDown size={20} />}</span>}
                  </div>

                  <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                    {!editModeId && (
                      <button onClick={() => {
                        setEditModeId(car.id);
                        setEditData(car);
                        setExpandedCarId(car.id);
                        fetchModelsList(car.brand); 
                      }} className="flex items-center gap-1 bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95">
                        <MdEdit size={14} /> <span className="hidden xs:inline">تعديل</span>
                      </button>
                    )}
                    <button onClick={() => handleDelete(car.id)} className="p-1.5 sm:p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95">
                      <MdDelete size={16} />
                    </button>
                  </div>
                </div>

             {isExpanded && (
  <div className="border-t border-gray-100 dark:border-gray-700/50 p-4 sm:p-6">
    {isEditMode ? (
      <div className="flex flex-col gap-5">
        <PhotoUploader id={`editPhoto-${car.id}`} previewSrc={editPreviewUrl || editData?.carPhotoUrl} onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) { setEditCarPhoto(f); setEditPreviewUrl(URL.createObjectURL(f)); }
        }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-extrabold text-[#137FEC]">الماركة</label>
            <SearchableBrandSelect 
              value={editData?.brand || ""} 
              token={token}
              onSelect={(selectedBrand) => {
                setEditData({ ...editData!, brand: selectedBrand, model: "" });
                fetchModelsList(selectedBrand);
              }} 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-extrabold text-[#137FEC]">الموديل</label>
            <select 
              className={FIELD_CLASS} 
              value={editData?.model} 
              disabled={!editData?.brand || loadingModels}
              onChange={(e) => setEditData({ ...editData!, model: e.target.value })}
            >
              <option value="">{editData?.brand ? "اختر الموديل" : "اختر الماركة أولاً"}</option>
              {models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            {loadingModels && <p className="text-xs text-blue-400 mt-1">جاري تحميل الموديلات...</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-extrabold text-[#137FEC]">سنة الصنع</label>
            <CustomYearSelect 
              value={editData?.year.toString() || ""} 
              years={YEARS}
              onChange={(year) => setEditData({ ...editData!, year: parseInt(year) })} 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-extrabold text-gray-400">
              رقم اللوحة <span className="text-[10px] font-normal">(غير قابل للتعديل)</span>
            </label>
            <div className={`${FIELD_CLASS} opacity-60 cursor-not-allowed select-none`}>
              {editData?.plateNumber}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button onClick={handleUpdateCar} disabled={loading} className="flex-1 bg-[#137FEC] hover:bg-blue-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 text-sm">
            <MdSave size={16} /> {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
          <button onClick={() => { 
            setEditModeId(null); 
            setEditPreviewUrl(null); 
            setModels([]); 
          }} className="flex-1 sm:flex-none bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-6 py-3 rounded-2xl font-bold text-sm">إلغاء</button>
        </div>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <InfoCard label="الماركة والموديل" value={`${car.brand} - ${car.model}`} />
        <InfoCard label="سنة الصنع" value={car.year} />
        <InfoCard label="رقم اللوحة" value={car.plateNumber} />
      </div>
    )}
  </div>
)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};