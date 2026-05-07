import { useState } from "react";
import { useTheme } from "../../../../contexts/ThemeContext";
import { FaSave, FaSpinner, FaLock } from "react-icons/fa";
import { MdVisibility, MdVisibilityOff, MdCheckCircleOutline, MdErrorOutline } from "react-icons/md";

// ✅ برا الـ component الرئيسية
const PasswordField = ({
  label, name, value, show, onToggle, onChange, dark,
}: {
  label: string;
  name: string;
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dark: boolean;
}) => {
  // التعديل هنا: أضفنا pl-12 (فراغ لليسار) وحذفنا pr-12
  const inputClass = `w-full px-4 py-3 pl-12 rounded-lg border outline-none transition-all text-right ${!dark
      ? "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      : "bg-[#131c2f] border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
    }`;

  return (
    <div>
      <label className={`block text-sm mb-2 ${!dark ? "text-gray-600" : "text-gray-400"}`}>
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          required
          className={inputClass}
        />
        {/* التعديل هنا: قمنا بتغيير right-3 إلى left-3 ليكون في الجهة المطلوبة */}
        <button
          type="button"
          onClick={onToggle}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#137FEC] transition-colors z-10"
        >
          {show ? <MdVisibility size={20} /> : <MdVisibilityOff size={20} />}
        </button>
      </div>
    </div>
  );
};

const SecuritySettings = () => {
  const { dark } = useTheme();

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  const token = sessionStorage.getItem("userToken");
  const BASE_URL = "https://gearupapp.runasp.net/api/auth/change-password";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });

    if (passwords.newPassword !== passwords.confirmPassword) {
      return setStatus({ type: "error", message: "كلمة المرور الجديدة غير متطابقة" });
    }

    setLoading(true);
    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setStatus({ type: "success", message: data.message || "تم تغيير كلمة المرور بنجاح" });
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setStatus({ type: "error", message: data.message || "فشل التغيير، تأكد من كلمة المرور الحالية" });
      }
    } catch {
      setStatus({ type: "error", message: "حدث خطأ في الاتصال بالسيرفر" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`rounded-xl border overflow-hidden ${!dark ? "bg-white shadow-md border-gray-200" : "bg-[#0d1629] border-blue-900/30"}`}
      dir="rtl"
    >
      {/* Header */}
      <div className={`p-6 border-b ${!dark ? "border-gray-200" : "border-gray-800"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full border-4 border-blue-500 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FaLock className="text-blue-500 text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">إعدادات الأمان</h3>
              <p className={`text-sm ${!dark ? "text-gray-600" : "text-gray-400"}`}>
                تغيير كلمة المرور
              </p>
            </div>
          </div>

          <button
            type="submit"
            form="password-form"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? (
              <><FaSpinner className="animate-spin" /><span>جاري الحفظ...</span></>
            ) : (
              <><FaSave /><span>حفظ التغييرات</span></>
            )}
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="p-6">
        <h4 className="text-lg font-bold mb-6">بيانات كلمة المرور</h4>

        {status.type && (
          <div className={`mb-4 p-3 rounded-xl text-sm text-center flex items-center justify-center gap-2 ${status.type === "success"
              ? "bg-green-500/10 border border-green-500/30 text-green-500"
              : "bg-red-500/10 border border-red-500/30 text-red-500"
            }`}>
            {status.type === "success" ? <MdCheckCircleOutline size={18} /> : <MdErrorOutline size={18} />}
            {status.message}
          </div>
        )}

        <form id="password-form" onSubmit={handleChangePassword}>
  
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="md:col-span-2">
    <PasswordField
      label="كلمة المرور الحالية"
      name="currentPassword"
      value={passwords.currentPassword}
      show={showCurrent}
      onToggle={() => setShowCurrent(!showCurrent)}
      onChange={handleInputChange}
      dark={dark}
    />
  </div>
  <PasswordField
    label="كلمة المرور الجديدة"
    name="newPassword"
    value={passwords.newPassword}
    show={showNew}
    onToggle={() => setShowNew(!showNew)}
    onChange={handleInputChange}
    dark={dark}
  />
  <PasswordField
    label="تأكيد كلمة المرور الجديدة"
    name="confirmPassword"
    value={passwords.confirmPassword}
    show={showConfirm}
    onToggle={() => setShowConfirm(!showConfirm)}
    onChange={handleInputChange}
    dark={dark}
  />
</div>

          <div className={`mt-6 p-4 rounded-xl border ${!dark ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-blue-900/20 border-blue-900/30 text-blue-400"}`}>
            <p className="text-sm text-center font-medium">
              ملاحظة: يفضل أن تحتوي كلمة المرور على 8 أحرف على الأقل، بما في ذلك أرقام ورموز خاصة.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecuritySettings;