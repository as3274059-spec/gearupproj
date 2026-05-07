import { useState, useEffect, useRef } from "react";
import { FaEdit, FaSave, FaSpinner, FaCamera } from "react-icons/fa";
import Swal from "sweetalert2";

interface PersonalDataProps {
  inputStyle?: string;
  profileImage?: string | null;
  handleImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface PersonalData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePhotoUrl: string | null;
}

const BASE_URL = "https://gearupapp.runasp.net/api";
const getToken = () => sessionStorage.getItem("userToken");

export const PersonalData = (_props: PersonalDataProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  const [data, setData] = useState<PersonalData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profilePhotoUrl: null,
  });

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const html = document.documentElement;

    const updateTheme = () => {
      setIsDark(html.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(() => {
      updateTheme();
    });

    observer.observe(html, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);
 
  const fetchData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        setError("انتهت الجلسة، سجّل دخولك مرة أخرى.");
        return;
      }

      const res = await fetch(`${BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }

      const json = await res.json();

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

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("صيغة الصورة غير مدعومة. ارفعي JPG أو PNG أو WEBP فقط.");
      return;
    }

    const maxSizeInMB = 2;
    if (file.size > maxSizeInMB * 1024 * 1024) {
      setError(`حجم الصورة كبير جداً. الحد الأقصى هو ${maxSizeInMB} MB.`);
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setError("");
    setSelectedPhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    if (!data.firstName.trim() || !data.lastName.trim()) {
      setError("الاسم الأول واسم العائلة مطلوبين.");
      setIsSaving(false);
      return;
    }

    if (data.phone.trim() && data.phone.trim().length < 8) {
      setError("يرجى إدخال رقم هاتف صحيح.");
      setIsSaving(false);
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        setError("انتهت الجلسة، سجّل دخولك مرة أخرى.");
        setIsSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append("FirstName", data.firstName.trim());
      formData.append("LastName", data.lastName.trim());
      formData.append("Phone", data.phone.trim());

      if (selectedPhoto) {
        formData.append("ProfilePhoto", selectedPhoto);
      }

      const res = await fetch(`${BASE_URL}/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setError(json?.message || "حدث خطأ أثناء الحفظ، حاول مرة أخرى.");
        return;
      }

      Swal.fire({
        icon: "success",
        title: "تم التحديث!",
        text: "تم حفظ بياناتك الشخصية بنجاح.",
        timer: 2000,
        showConfirmButton: false,
        background: isDark ? "#0d1629" : "#fff",
        color: isDark ? "#fff" : "#000",
      });

      setIsEditing(false);
      setSelectedPhoto(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);

      await fetchData();
    } catch {
      setError("تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedPhoto(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setError("");
    fetchData();
  };

  const update = (field: keyof PersonalData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const inputClass = `w-full text-right font-semibold py-3 px-4 rounded-2xl transition-all duration-200 border outline-none ${
    !isDark
      ? "bg-white border-blue-400 ring-2 ring-blue-100 text-gray-900 shadow-sm"
      : "bg-gray-800 border-blue-400 ring-2 ring-blue-900/40 text-white"
  }`;

  const readOnlyClass = `w-full text-right font-semibold py-3 px-4 rounded-2xl transition-all duration-200 border outline-none ${
    !isDark
      ? "bg-gray-50 border-gray-200 text-gray-700"
      : "bg-[#131c2f] border-gray-700 text-gray-300"
  } cursor-not-allowed select-none`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="animate-spin text-3xl text-blue-600" />
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className={`rounded-[32px] p-4 sm:p-6 md:p-8 shadow-xl overflow-hidden border ${
        !isDark
          ? "bg-white border-gray-100"
          : "bg-[#0d1629] border-gray-700"
      }`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6 pb-6 border-b dark:border-gray-800">
        
        {/* Photo & Info Section */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
          <div className="relative shrink-0">
            <img
              src={
                previewUrl ||
                data.profilePhotoUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  `${data.firstName} ${data.lastName}`.trim() || "User"
                )}&background=2563eb&color=fff`
              }
              alt="Profile"
              // تم تصغير الحجم هنا: w-20 sm:w-24
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-[#137FEC] object-cover shadow-sm"
            />

            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 left-0 w-8 h-8 bg-[#137FEC] hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition shadow-lg border-2 border-white dark:border-[#0d1629]"
              >
                <FaCamera className="text-xs" />
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          <div className="text-center md:text-right">
            <h3 className="text-xl font-black mb-1 text-gray-800 dark:text-white">
              {data.firstName} {data.lastName}
            </h3>
            <p className="text-sm font-bold text-gray-400">الحساب الشخصي</p>
            {selectedPhoto && (
              <p className="text-xs text-blue-500 mt-1 truncate max-w-[220px]">
                📷 {selectedPhoto.name}
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={isSaving}
          className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
            isSaving ? "bg-gray-400 cursor-wait" : "bg-[#137FEC] hover:bg-blue-600 text-white"
          }`}
        >
          {isSaving ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>جاري الحفظ...</span>
            </>
          ) : isEditing ? (
            <>
              <FaSave />
              <span>حفظ التغييرات</span>
            </>
          ) : (
            <>
              <FaEdit />
              <span>تعديل البيانات</span>
            </>
          )}
        </button>
      </div>

      <div>
        <h4 className="text-lg font-black mb-6 text-gray-800 dark:text-white">البيانات الشخصية الأساسية</h4>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[
            {
              label: "الاسم الأول",
              field: "firstName" as keyof PersonalData,
              type: "text",
            },
            {
              label: "الاسم الأخير",
              field: "lastName" as keyof PersonalData,
              type: "text",
            },
            {
              label: "رقم الهاتف",
              field: "phone" as keyof PersonalData,
              type: "tel",
            },
          ].map(({ label, field, type }) => (
            <div key={field} className="space-y-2">
              <label
                className="text-xs sm:text-sm font-extrabold text-[#137FEC] block"
              >
                {label}
              </label>

              <input
                type={type}
                value={data[field] ?? ""}
                onChange={(e) => update(field, e.target.value)}
                readOnly={!isEditing}
                className={isEditing ? inputClass : readOnlyClass}
              />
            </div>
          ))}

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-extrabold text-[#137FEC] block">
              البريد الإلكتروني
            </label>

            <input
              type="email"
              value={data.email}
              readOnly
              className={readOnlyClass}
            />
          </div>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={handleCancel}
            className="mt-8 w-full md:w-auto px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm transition-all hover:bg-gray-200"
          >
            إلغاء
          </button>
        )}
      </div>
    </div>
  );
};