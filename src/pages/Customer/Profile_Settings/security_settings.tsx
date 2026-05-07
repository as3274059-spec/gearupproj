import { useState } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { FaEdit, FaSave, FaSpinner, FaLock } from "react-icons/fa";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import Swal from "sweetalert2"; 

const PasswordField = ({
  label, name, value, show, onToggle, onChange,  isEditing,
}: {
  label: string;
  name: string;
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dark: boolean;
  isEditing: boolean;
}) => {
  const activeClass = `w-full px-4 pl-12 py-3 rounded-2xl border outline-none transition-all font-semibold text-right bg-white dark:bg-gray-800 border-blue-400 ring-2 ring-blue-100 dark:ring-blue-900/40 text-gray-900 dark:text-white focus:border-blue-500`;
  
  const inactiveClass = `w-full px-4 pl-12 py-3 rounded-2xl border outline-none transition-all font-semibold text-right bg-gray-50 dark:bg-[#131c2f] border-gray-200 text-gray-700 dark:text-gray-300 cursor-not-allowed select-none`;

  return (
    <div>
      <label className={`block text-xs sm:text-sm mb-1.5 font-extrabold text-[#137FEC]`}>
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          readOnly={!isEditing}
          required={isEditing}
          className={isEditing ? activeClass : inactiveClass}
        />
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
  const [isEditing, setIsEditing] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const token    = sessionStorage.getItem("userToken");
  const BASE_URL = "https://gearupapp.runasp.net/api/auth/change-password";

  const showAlert = (icon: 'success' | 'error' | 'warning', title: string, text?: string) => {
    Swal.fire({
      icon,
      title,
      text,
      confirmButtonColor: '#137FEC',
      background: dark ? '#1B1F2D' : '#fff',
      color: dark ? '#fff' : '#000',
      timer: icon === 'success' ? 2000 : undefined,
      showConfirmButton: icon !== 'success',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleChangePassword = async (e: React.FormEvent) => {
    if (!isEditing) {
      e.preventDefault();
      setIsEditing(true);
      return;
    }

    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      return showAlert('warning', 'خطأ في التأكيد', 'كلمة المرور الجديدة وغير متطابقة');
    }

    if (passwords.newPassword.length < 8) {
      return showAlert('warning', 'كلمة مرور ضعيفة', 'يجب أن تكون كلمة المرور 8 أحرف على الأقل');
    }

    setLoading(true);
    try {
      const res  = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword:     passwords.newPassword,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        showAlert('success', 'تم التغيير!', 'تم تحديث كلمة المرور بنجاح.');
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setIsEditing(false);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        showAlert('error', 'فشل التغيير', data.message || "تأكد من صحة كلمة المرور الحالية");
      }
    } catch {
      showAlert('error', 'خطأ في الاتصال', 'حدث خطأ أثناء الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`rounded-[32px] sm:rounded-[40px] border overflow-hidden shadow-xl ${
        !dark ? "bg-white border-gray-200" : "bg-[#0d1629] border-blue-900/30"
      }`}
      dir="rtl"
    >
      {/* Header */}
      <div className={`p-4 sm:p-6 border-b flex flex-wrap items-center justify-between gap-3 ${
        !dark ? "border-gray-200" : "border-gray-800"
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border-4 border-blue-500 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <FaLock className="text-blue-500 text-base sm:text-xl" />
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-bold">إعدادات الأمان</h3>
            <p className={`text-xs sm:text-sm ${!dark ? "text-gray-500" : "text-gray-400"}`}>تغيير كلمة المرور</p>
          </div>
        </div>

        <button
          type="submit"
          form="password-form"
          disabled={loading}
          className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#137FEC] hover:bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-bold transition disabled:opacity-50 active:scale-95"
        >
          {loading ? (
            <><FaSpinner className="animate-spin" /><span>جاري الحفظ...</span></>
          ) : isEditing ? (
            <><FaSave /><span>حفظ التغييرات</span></>
          ) : (
            <><FaEdit /><span>تعديل البيانات</span></>
          )}
        </button>
      </div>

      {/* Fields */}
      <div className="p-4 sm:p-6 md:p-8">
        <form id="password-form" onSubmit={handleChangePassword} className="space-y-4 sm:space-y-5">
          <PasswordField
            label="كلمة المرور الحالية"
            name="currentPassword"
            value={passwords.currentPassword}
            show={showCurrent}
            onToggle={() => setShowCurrent(!showCurrent)}
            onChange={handleInputChange}
            dark={dark}
            isEditing={isEditing}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <PasswordField
              label="كلمة المرور الجديدة"
              name="newPassword"
              value={passwords.newPassword}
              show={showNew}
              onToggle={() => setShowNew(!showNew)}
              onChange={handleInputChange}
              dark={dark}
              isEditing={isEditing}
            />
            <PasswordField
              label="تأكيد كلمة المرور"
              name="confirmPassword"
              value={passwords.confirmPassword}
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
              onChange={handleInputChange}
              dark={dark}
              isEditing={isEditing}
            />
          </div>

          <div className={`p-3 sm:p-4 rounded-2xl border text-xs sm:text-sm text-center font-medium ${
            !dark
              ? "bg-blue-50 border-blue-100 text-blue-600"
              : "bg-blue-900/20 border-blue-900/30 text-blue-400"
          }`}>
            يفضل أن تحتوي كلمة المرور على 8 أحرف على الأقل، بما في ذلك أرقام ورموز خاصة.
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecuritySettings;