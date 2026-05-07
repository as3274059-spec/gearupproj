import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../../../contexts/ThemeContext";
import { FaEdit, FaSave, FaSpinner, FaCamera } from "react-icons/fa";

interface PersonalData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePhotoUrl: string | null;
}

const BASE_URL = "https://gearupapp.runasp.net/api";
const getToken = () => sessionStorage.getItem("userToken");

const PersonalTab = () => {
  const { dark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [data, setData] = useState<PersonalData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profilePhotoUrl: null,
  });

  // لرفع الصورة
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ======= FETCH =======
  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      console.log("GET profile status:", res.status);
      if (!res.ok) throw new Error("Failed");

      const json = await res.json();
      console.log("Profile data:", json);

      setData({
        firstName: json.firstName || "",
        lastName: json.lastName || "",
        email: json.email || "",
        phone: json.phone || "",
        profilePhotoUrl: json.profilePhotoUrl || null,
      });
    } catch {
      setError("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ======= اختيار صورة =======
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedPhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ======= SAVE =======
  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      // الـ API بتاخد multipart/form-data
      const formData = new FormData();
      formData.append("FirstName", data.firstName);
      formData.append("LastName", data.lastName);
      formData.append("Phone", data.phone);
      if (selectedPhoto) {
        formData.append("ProfilePhoto", selectedPhoto);
      }

      console.log("Saving as FormData:", {
        FirstName: data.firstName,
        LastName: data.lastName,
        Phone: data.phone,
        ProfilePhoto: selectedPhoto?.name || "none",
      });

      const res = await fetch(`${BASE_URL}/users/profile`, {
        method: "PUT",
        headers: {
          // ⚠️ لا تحط Content-Type - المتصفح بيحطه تلقائي مع boundary
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });

      const json = await res.json().catch(() => null);
      console.log("PUT response:", json);

      if (!res.ok) {
        setError(json?.message || "حدث خطأ أثناء الحفظ");
        return;
      }

      setSuccess("تم حفظ التغييرات بنجاح ✅");
      setIsEditing(false);
      setSelectedPhoto(null);
      setPreviewUrl(null);
      setTimeout(() => window.location.reload(), 1000); // ✅
      fetchData();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedPhoto(null);
    setPreviewUrl(null);
    fetchData();
  };

  const update = (field: keyof PersonalData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const inputClass = `w-full px-4 py-3 rounded-lg border outline-none transition-all ${
    !dark
      ? "bg-gray-50 border-gray-300 text-gray-900"
      : "bg-[#131c2f] border-gray-700 text-white"
  } ${isEditing ? "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" : "cursor-not-allowed"}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="animate-spin text-3xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className={`rounded-xl border overflow-hidden ${!dark ? "bg-white shadow-md border-gray-200" : "bg-[#0d1629] border-blue-900/30"}`}>

      {/* Avatar + Edit Button */}
      <div className={`p-6 border-b ${!dark ? "border-gray-200" : "border-gray-800"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">

            {/* الصورة مع زرار التغيير */}
            <div className="relative">
              <img
                src={previewUrl || data.profilePhotoUrl || "https://i.pravatar.cc/150?img=12"}
                alt="Profile"
                className="w-20 h-20 rounded-full border-4 border-blue-500 object-cover"
              />
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 left-0 w-6 h-6 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition"
                >
                  <FaCamera className="text-white text-xs" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>

            <div>
              <h3 className="text-xl font-bold mb-1">
                {data.firstName} {data.lastName}
              </h3>
              <p className={`text-sm ${!dark ? "text-gray-600" : "text-gray-400"}`}>
                ميكانيكي محترف
              </p>
              {selectedPhoto && (
                <p className="text-xs text-blue-500 mt-1">
                  📷 {selectedPhoto.name}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            {isSaving ? (
              <><FaSpinner className="animate-spin" /><span>جاري الحفظ...</span></>
            ) : isEditing ? (
              <><FaSave /><span>حفظ التغييرات</span></>
            ) : (
              <><FaEdit /><span>تعديل البيانات</span></>
            )}
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="p-6">
        <h4 className="text-lg font-bold mb-6">البيانات الشخصية الأساسية</h4>

        {/* Messages */}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-500 text-sm text-center">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "الاسم الأول",      field: "firstName" as keyof PersonalData, type: "text"  },
            { label: "الاسم الأخير",      field: "lastName"  as keyof PersonalData, type: "text"  },
            { label: "رقم الهاتف",        field: "phone"     as keyof PersonalData, type: "tel"   },
          ].map(({ label, field, type }) => (
            <div key={field}>
              <label className={`block text-sm mb-2 ${!dark ? "text-gray-600" : "text-gray-400"}`}>
                {label}
              </label>
              <input
                type={type}
                value={data[field] as string}
                onChange={(e) => update(field, e.target.value)}
                readOnly={!isEditing}
                className={inputClass}
              />
            </div>
          ))}

          {/* البريد الإلكتروني - للعرض فقط */}
          <div>
            <label className={`block text-sm mb-2 ${!dark ? "text-gray-600" : "text-gray-400"}`}>
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={data.email}
              readOnly
              className={`w-full px-4 py-3 rounded-lg border outline-none cursor-not-allowed ${
                !dark
                  ? "bg-gray-100 border-gray-300 text-gray-500"
                  : "bg-[#0d1629] border-gray-700 text-gray-500"
              }`}
            />
          </div>
        </div>

        {/* Cancel Button */}
        {isEditing && (
          <button
            onClick={handleCancel}
            className={`mt-6 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              !dark ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            إلغاء
          </button>
        )}
      </div>
    </div>
  );
};

export default PersonalTab;