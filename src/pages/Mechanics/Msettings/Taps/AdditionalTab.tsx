
import { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../../../../contexts/ThemeContext";
import { FaEdit, FaSave, FaSpinner, FaLocationArrow } from "react-icons/fa";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

// --- Map ---
function MapPicker({ latitude, longitude, setLocation, isEditing, dark }: any) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBX8_y6ZtDBv722QljpxUubkpQQQG4sTQ0", // 🔥 تأكد إن المفتاح شغال
  });

  if (loadError)
    return <div className="text-red-500 text-sm">خطأ في تحميل الخريطة</div>;

  if (!isLoaded)
    return (
      <div className="h-[250px] flex items-center justify-center animate-pulse bg-gray-200 rounded-xl">
        جاري تحميل الخريطة...
      </div>
    );

  const defaultCenter = { lat: 26.8206, lng: 30.8025 }; // مصر

  const center =
    latitude && longitude
      ? { lat: Number(latitude), lng: Number(longitude) }
      : defaultCenter;

  return (
    <div
      className={`rounded-xl overflow-hidden border ${
        dark ? "border-gray-700" : "border-gray-300"
      }`}
      style={{ height: "250px", width: "100%" }}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={latitude ? 17 : 6} 
        onClick={(e) => {
          if (isEditing && e.latLng) {
            setLocation(e.latLng.lat(), e.latLng.lng());
          }
        }}
        options={{
          draggable: isEditing,
          clickableIcons: isEditing,
          scrollwheel: true,
        }}
      >
        {latitude && longitude && (
          <Marker
            position={{ lat: Number(latitude), lng: Number(longitude) }}
            animation={window.google?.maps?.Animation?.DROP}
          />
        )}
      </GoogleMap>
    </div>
  );
}

// ---------------- TYPE ----------------
interface AdditionalData {
  location: string;
  latitude?: number;
  longitude?: number;
  mainSpecialty: string[];
  subSpecialty: string;
  fieldVisit: boolean;
  workingHoursFrom: string;
  workingHoursTo: string;
  experience: string;
}

const getStorageKey = () => {
  const token = sessionStorage.getItem("userToken");
  if (!token) return "mechanic_data_guest";

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    const userId = payload.nameid || payload.sub || payload.id || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    
    return `mechanic_data_${userId}`;
  } catch {
    return `mechanic_data_${token}`;
  }
};

const defaultData: AdditionalData = {
  location: "",
  latitude: undefined,
  longitude: undefined,
  mainSpecialty: [],
  subSpecialty: "",
  fieldVisit: false,
  workingHoursFrom: "08:00",
  workingHoursTo: "18:00",
  experience: "",
};

// ---------------- COMPONENT ----------------
const AdditionalTab = () => {
  const { dark } = useTheme();
  const token = sessionStorage.getItem("userToken") || "";

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [specializations, setSpecializations] = useState<any[]>([]);
  const [selectedMain, setSelectedMain] = useState("");
  const [selectedSub, setSelectedSub] = useState("");

  // ---------------- DATA ----------------
  const [data, setData] = useState<AdditionalData>(() => {
    try {
      const saved = localStorage.getItem(getStorageKey());
      return saved ? JSON.parse(saved) : defaultData;
    } catch {
      return defaultData;
    }
  });

  // تحديث حالة الـ Main/Sub بناءً على الـ Data
  useEffect(() => {
    // 🔥 تعديل: نتأكد إن القيم مش null قبل ما ناخدها عشان القائمة ماتظهرش فاضية
    if (data?.mainSpecialty?.length && data.mainSpecialty[0]) {
      setSelectedMain(String(data.mainSpecialty[0]));
    } else {
      setSelectedMain("");
    }
    
    if (data?.subSpecialty) {
      setSelectedSub(String(data.subSpecialty));
    } else {
      setSelectedSub("");
    }
  }, [data]);

  // ---------------- FETCH SPECIALIZATIONS ----------------
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const res = await axios.get(
          "https://gearupapp.runasp.net/api/specializations",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const rawData: any[] = res.data;
        const namesWithSubs = new Set(
          rawData.filter((i: any) => i.subSpecializations.length > 0).map((i: any) => i.name)
        );
        
        const filteredRaw = rawData.filter((item: any) => {
          if (item.subSpecializations.length === 0 && namesWithSubs.has(item.name)) {
            return false;
          }
          return true; 
        });

        const mergedMap = new Map<string, any>();
        filteredRaw.forEach((item: any) => {
          if (mergedMap.has(item.name)) {
            const existing = mergedMap.get(item.name);
            existing.subSpecializations.push(...item.subSpecializations);
          } else {
            mergedMap.set(item.name, {
              ...item,
              subSpecializations: [...item.subSpecializations]
            });
          }
        });

        const cleanedData = Array.from(mergedMap.values()).map((main: any) => ({
          ...main,
          subSpecializations: Array.from(
            new Map(main.subSpecializations.map((sub: any) => [sub.name, sub])).values()
          )
        }));

        setSpecializations(cleanedData);

      } catch (err) {
        console.log(err);
      }
    };

    fetchSpecializations();
  }, []);

  // ---------------- FETCH MY DATA ----------------
  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const res = await axios.get(
          "https://gearupapp.runasp.net/api/mechanics/my/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        const apiData = res.data;
  
        setData({
          location: apiData.location || "",
          latitude: apiData.latitude,
          longitude: apiData.longitude,
          // 🔥 تعديل: لو القيمة null هنخلي مصفوفة فاضية عشان مبيظهرش [null] في السلكت
          mainSpecialty: apiData.primarySpecializationId ? [apiData.primarySpecializationId] : [],
          subSpecialty: apiData.subSpecializationId || "",
          fieldVisit: apiData.supportsFieldVisit || false,
          workingHoursFrom: apiData.workStartTime || "08:00",
          workingHoursTo: apiData.workEndTime || "18:00",
          experience: "",
        });
  
      } catch (err) {
        console.log(err);
      }
    };
  
    fetchMyData();
  }, []);

  const selectedMainObj = specializations.find((s) => s.id === selectedMain);
  const subList = selectedMainObj?.subSpecializations || [];

  // ---------------- تحديد موقعي ----------------
  const handleGetMyLocation = () => {
    if (!navigator.geolocation) {
      setError("المتصفح لا يدعم تحديد الموقع");
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setError("");
        setData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
      },
      (err) => {
        setError("خطأ في تحديد الموقع، تأكد من تفعيل خدمة الموقع من إعدادات المتصفح");
        console.error(err);
      }
    );
  };

  // ---------------- SAVE ----------------
  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    // 🔥 خطوة 1: التحقق من صحة البيانات قبل الإرسال (Validation)
    if (!selectedMain) {
      setError("يرجى اختيار التخصص الرئيسي");
      setIsSaving(false);
      return;
    }

    if (!data.latitude || !data.longitude) {
      setError("يرجى تحديد الموقع بدقة على الخريطة (انقر على الموقع)");
      setIsSaving(false);
      return;
    }

    // ✅ التعديل الجديد: التحقق من التواريخ
    if (data.workingHoursFrom >= data.workingHoursTo) {
      setError("يجب أن يكون تاريخ نهاية العمل قبل تاريخ البداية");
      setIsSaving(false);
      return;
    }

    try {
      // 🔥 خطوة 2: تجهيز البيانات والتأكد من الأنواع
      const payloadLocation = {
        latitude: Number(data.latitude), // تأكد إنه رقم
        longitude: Number(data.longitude), // تأكد إنه رقم
        location: data.location || "تم التحديد عبر الخريطة",
      };

      const payloadSpecialization = {
        primarySpecializationId: selectedMain,
        subSpecializationId: selectedSub || null,
      };

      const payloadFieldVisit = {
        supportsFieldVisit: data.fieldVisit,
      };

      const payloadWorkingHours = {
        workStartTime: data.workingHoursFrom,
        workEndTime: data.workingHoursTo,
      };

      // إرسال الطلبات
      await Promise.all([
        axios.put("https://gearupapp.runasp.net/api/mechanics/my/location", payloadLocation, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.put("https://gearupapp.runasp.net/api/mechanics/my/profile/complete", payloadSpecialization, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.put("https://gearupapp.runasp.net/api/mechanics/my/field-visit", payloadFieldVisit, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.put("https://gearupapp.runasp.net/api/mechanics/my/working-hours", payloadWorkingHours, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // 🔥 خطوة 3: الحفظ في LocalStorage فقط بعد النجاح
      localStorage.setItem(
        getStorageKey(),
        JSON.stringify({
          ...data,
          mainSpecialty: [selectedMain],
          subSpecialty: selectedSub,
        })
      );

      setSuccess("تم الحفظ بنجاح");
      setIsEditing(false);
      setTimeout(() => setSuccess(""), 2500);

    } catch (err: any) {
      console.error("Save Error:", err);
      // 🔥 خطوة 4: عرض رسالة الخطأ من السيرفر لو موجودة
      const serverMessage = err?.response?.data?.message || err?.response?.data || "حصل خطأ أثناء الحفظ";
      setError(typeof serverMessage === 'string' ? serverMessage : "حصل خطأ غير متوقع");
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------- إلغاء ----------------
  const handleCancel = () => {
    setIsEditing(false);
    try {
      const saved = localStorage.getItem(getStorageKey());
      if (saved) {
        setData(JSON.parse(saved));
      }
    } catch {
        // ignore error
    }
  };

  // ---------------- UI ----------------
  return (
    <div
      className={`rounded-2xl border p-6 space-y-6 ${
        !dark
          ? "bg-white border-gray-200 shadow-md"
          : "bg-[#0d1629] border-blue-900/30"
      }`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">البيانات الإضافية</h3>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button onClick={handleCancel} className={`px-4 py-2 rounded-xl text-sm font-medium ${!dark ? "bg-gray-200" : "bg-gray-700 text-white"}`}>إلغاء</button>
              <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium disabled:opacity-50">
                {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />} حفظ
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium">
              <FaEdit /> تعديل
            </button>
          )}
        </div>
      </div>

      {/* messages */}
      {success && <div className="p-3 bg-green-500/10 text-green-500 text-center text-sm font-medium">{success}</div>}
      {error && <div className="p-3 bg-red-500/10 text-red-500 text-center text-sm font-medium">{error}</div>}

      {/* ================= LOCATION ================= */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold">موقع الورشة <span className="text-red-500">*</span></label>
          {isEditing && (
            <button onClick={handleGetMyLocation} className="text-blue-500 flex gap-2 items-center text-sm hover:underline">
              <FaLocationArrow /> تحديد موقعي
            </button>
          )}
        </div>

        <MapPicker
          latitude={data.latitude}
          longitude={data.longitude}
          setLocation={(lat: number, lng: number) => setData((p) => ({ ...p, latitude: lat, longitude: lng }))}
          isEditing={isEditing}
          dark={dark}
        />
      </div>

      {/* ================= SPECIALIZATION ================= */}
      <div className={`grid grid-cols-1 ${subList.length > 0 ? "md:grid-cols-2" : ""} gap-4`}>
        <div className="space-y-2">
          <label className="text-sm font-bold">التخصص الرئيسي <span className="text-red-500">*</span></label>
          <select
            disabled={!isEditing}
            value={selectedMain}
            onChange={(e) => { setSelectedMain(e.target.value); setSelectedSub(""); }}
            className={`w-full px-4 py-3 rounded-xl border outline-none ${!dark ? "bg-gray-50 border-gray-300 text-gray-900" : "bg-[#131c2f] border-gray-700 text-white"} ${!isEditing ? "cursor-not-allowed opacity-70" : ""}`}
          >
            <option value="">اختر التخصص الرئيسي</option>
            {specializations.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
          </select>
        </div>

        {subList.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-bold">التخصص الفرعي</label>
            <select
              disabled={!isEditing}
              value={selectedSub}
              onChange={(e) => setSelectedSub(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border outline-none ${!dark ? "bg-gray-50 border-gray-300 text-gray-900" : "bg-[#131c2f] border-gray-700 text-white"} ${!isEditing ? "cursor-not-allowed opacity-70" : ""}`}
            >
              <option value="">اختر التخصص الفرعي</option>
              {subList.map((sub: any) => (<option key={sub.id} value={sub.id}>{sub.name}</option>))}
            </select>
          </div>
        )}
      </div>

      {/* ================= FIELD VISIT & WORKING HOURS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* FIELD VISIT */}
        <div className={`flex items-center justify-between p-3 rounded-xl border ${
          !dark ? "bg-gray-50 border-gray-200" : "bg-[#131c2f] border-gray-700"
        }`}>
          <div>
            <label className="text-sm font-bold">الزيارة الميدانية</label>
            <p className={`text-xs mt-0.5 ${!dark ? "text-gray-500" : "text-gray-400"}`}>
              تقديم الخدمة في الموقع
            </p>
          </div>
          
          <div
            onClick={() => { if (isEditing) setData((prev) => ({ ...prev, fieldVisit: !prev.fieldVisit })); }}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer shrink-0 ${
              data.fieldVisit ? "bg-blue-600" : (dark ? "bg-gray-600" : "bg-gray-300")
            } ${!isEditing ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
              data.fieldVisit ? "translate-x-5" : "translate-x-0"
            }`} />
          </div>
        </div>

        {/* WORKING HOURS */}
        <div className={`p-3 rounded-xl border ${
          !dark ? "bg-gray-50 border-gray-200" : "bg-[#131c2f] border-gray-700"
        }`}>
          <label className="text-sm font-bold">ساعات العمل</label>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="time"
              value={data.workingHoursFrom}
              onChange={(e) => setData((prev) => ({ ...prev, workingHoursFrom: e.target.value }))}
              disabled={!isEditing}
              className={`w-full px-3 py-1.5 rounded-lg border outline-none text-sm ${
                !dark ? "bg-white border-gray-300 text-gray-900" : "bg-[#0d1629] border-gray-600 text-white [color-scheme:dark]"
              } ${!isEditing ? "cursor-not-allowed opacity-70" : ""}`}
            />
            <span className={`text-sm font-bold ${!dark ? "text-gray-500" : "text-gray-400"}`}>إلى</span>
            <input
              type="time"
              value={data.workingHoursTo}
              onChange={(e) => setData((prev) => ({ ...prev, workingHoursTo: e.target.value }))}
              disabled={!isEditing}
              className={`w-full px-3 py-1.5 rounded-lg border outline-none text-sm ${
                !dark ? "bg-white border-gray-300 text-gray-900" : "bg-[#0d1629] border-gray-600 text-white [color-scheme:dark]"
              } ${!isEditing ? "cursor-not-allowed opacity-70" : ""}`}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdditionalTab;
