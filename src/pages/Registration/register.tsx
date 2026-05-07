
import { useState , useEffect } from "react";
import {
  FaUser, FaPhone, FaEnvelope, FaLock, FaUserTie, FaTools
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2"; // 1. استيراد المكتبة

/* ---- validation helpers ---- */
const validateStep1 = (fields: {
  firstName: string; lastName: string;
  phone: string; email: string; password: string;
}) => {
  const errs: Record<string, string> = {};
  if (!fields.firstName.trim())              errs.firstName = "الاسم الأول مطلوب";
  else if (/\d/.test(fields.firstName))      errs.firstName = "الاسم لا يجب أن يحتوي على أرقام";
  if (!fields.lastName.trim())               errs.lastName  = "اسم العائلة مطلوب";
  else if (/\d/.test(fields.lastName))       errs.lastName  = "الاسم لا يجب أن يحتوي على أرقام";
                                        //  errs.phone     = "رقم الهاتف غير صحيح";
  if (!fields.phone.trim()) {
    errs.phone = "رقم الهاتف مطلوب";
  } else if (!/^\d{11}$/.test(fields.phone)) {
    errs.phone = "رقم الهاتف يجب أن يكون 11 رقم";
  }
  if (!fields.email.trim())                  errs.email     = "البريد الإلكتروني مطلوب";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
                                             errs.email     = "البريد الإلكتروني غير صحيح";
  if (!fields.password)                      errs.password  = "كلمة المرور مطلوبة";
  else if (fields.password.length < 8)       errs.password  = "كلمة المرور 8 أحرف على الأقل";
  return errs;
};

const normalizePhone = (value: string) => {
  // تحويل الأرقام العربية → إنجليزية
  const arabicToEnglishMap: Record<string, string> = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  };

  let normalized = value
    .split("")
    .map((ch) => arabicToEnglishMap[ch] || ch)
    .join("");

  // حذف أي حاجة مش رقم
  normalized = normalized.replace(/\D/g, "");

  return normalized;
};
/* ---- FormInput Component ---- */
const FormInput = ({
  label, icon, placeholder, type = "text", value, onChange, error,
}: {
  label: string; icon: React.ReactNode; placeholder: string;
  type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) => {
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === "password";
  const inputType  = isPassword ? (showPass ? "text" : "password") : type;

  return (
    <div className="w-full text-right">
      <label className="block mb-1.5 font-bold dark:text-white text-xs">{label}</label>
      <div className="relative">
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full bg-white dark:bg-[#137FEC1A] border pr-11 py-3 rounded-xl outline-none text-sm text-gray-800 dark:text-gray-200 transition-all ${
            isPassword ? "pl-11" : ""
          } ${
            error
              ? "border-red-400 ring-2 ring-red-200 dark:ring-red-900/40"
              : "border-gray-200 dark:border-transparent focus:ring-2 focus:ring-blue-500"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#137FEC] transition-colors"
          >
            {showPass ? (
               <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
             </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.38-4.152M9.878 9.878a3 3 0 104.243 4.243M3 3l18 18" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500 font-semibold flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
};

/* ---- Register Component ---- */
const Register: React.FC = () => {
  const [role, setRole]       = useState<"client" | "mechanic">("client");
  const [step, setStep]       = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [, setApiError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [phone,     setPhone]     = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");

  // useEffect(() => {
  //   const fromOtp = localStorage.getItem("fromOtpBack");
  
  //   if (fromOtp) {
  //     localStorage.removeItem("fromOtpBack");
  //     localStorage.clear(); // 👈 تأكيد مسح كل حاجة
  //     return;
  //   }
  
  //   const savedFirstName = localStorage.getItem("pendingFirstName");
  //   const savedLastName = localStorage.getItem("pendingLastName");
  //   const savedPhone = localStorage.getItem("pendingPhone");
  
   
  //   const savedPassword = localStorage.getItem("pendingPassword");
  
  //   if (savedFirstName) setFirstName(savedFirstName);
  //   if (savedLastName) setLastName(savedLastName);
  //   if (savedPhone) setPhone(savedPhone);
  //   if (savedPassword) setPassword(savedPassword);
  
  // }, []);
  useEffect(() => {
    const fromOtp = localStorage.getItem("fromOtpBack");
  
    // لو راجع من صفحة الـ OTP
    if (fromOtp === "true") {
      const savedFirstName = localStorage.getItem("pendingFirstName");
      const savedLastName = localStorage.getItem("pendingLastName");
      const savedPhone = localStorage.getItem("pendingPhone");
      const savedEmail = localStorage.getItem("pendingEmail");
      const savedPassword = localStorage.getItem("pendingPassword");
  
      if (savedFirstName) setFirstName(savedFirstName);
      if (savedLastName) setLastName(savedLastName);
      if (savedPhone) setPhone(savedPhone);
      if (savedEmail) setEmail(savedEmail); // ضيفي الإيميل كمان
      if (savedPassword) setPassword(savedPassword);
  
      // بعد ما حملنا البيانات، نمسح العلامة عشان لو قفل الصفحة وفتحها تاني متبقاش موجودة
      localStorage.removeItem("fromOtpBack");
    } else {
      // لو داخل الصفحة عادي (مش رجوع)، نضف الـ Storage عشان ميبقاش فيه بيانات قديمة
      localStorage.removeItem("pendingFirstName");
      localStorage.removeItem("pendingLastName");
      localStorage.removeItem("pendingPhone");
      localStorage.removeItem("pendingEmail");
      localStorage.removeItem("pendingPassword");
    }
  }, []);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isDarkMode = () => document.documentElement.classList.contains('dark');

  const handleNext = () => {
    const errs = validateStep1({ firstName, lastName, phone, email, password });
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      // تنبيه بوب اب عند وجود أخطاء في الحقول
      Swal.fire({
        icon: "warning",
        title: "بيانات غير مكتملة",
        text: "يرجى التحقق من الحقول الموضحة باللون الأحمر",
        confirmButtonText: "موافق",
        confirmButtonColor: "#137FEC",
        background: isDarkMode() ? '#1B1F2D' : '#fff',
        color: isDarkMode() ? '#fff' : '#000',
      });
      return;
    }
    setFieldErrors({});
    setApiError(null);
    setStep(2);
  };

  const clearErr = (key: string) =>
    setFieldErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });

  const handleSubmit = async () => {
    setLoading(true);
    setApiError(null);
    const roleNumber = role === "client" ? 1 : 2;
    const body = {
      firstName, lastName, email, password, phone,
      role: roleNumber,
      customerLocation: { latitude: 0, longitude: 0 },
      mechanicLocation: { latitude: 0, longitude: 0 },
    };
    try {
      const res  = await fetch("https://gearupapp.runasp.net/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      
      if (!res.ok) {
        const msg = data?.errors
          ? Object.values(data.errors).flat().join(" | ")
          : data?.message || data?.title || `فشل التسجيل (${res.status})`;
        throw new Error(msg as string);
      }

  
      Swal.fire({
        icon: "info",
        title: "جاري إرسال كود التحقق",
        text: "تحقق من بريدك الإلكتروني",
        timer: 1500,
        showConfirmButton: false,
        background: isDarkMode() ? '#1B1F2D' : '#fff',
        color: isDarkMode() ? '#fff' : '#000',
      });

  
      setTimeout(() => {
        const userId = data?.userId || data?.id;
      
        // نخزن الداتا للـ OTP وبعده
        localStorage.setItem("pendingEmail", email);
        localStorage.setItem("pendingRole", roleNumber.toString());
      
        if (roleNumber === 2) {
          localStorage.setItem("pendingMechanicId", userId);
        }
      
        localStorage.setItem("pendingFirstName", firstName);
localStorage.setItem("pendingLastName", lastName);
localStorage.setItem("pendingPhone", phone);
localStorage.setItem("pendingPassword", password);
        // الكل يروح OTP الأول
        window.location.href = "/registration_otp";
      }, 2000);

    } catch (err: any) {
      setApiError(err.message || "حدث خطأ، حاول مجدداً");
      // تنبيه بوب اب للخطأ القادم من السيرفر
      Swal.fire({
        icon: "error",
        title: "خطأ في التسجيل",
        text: err.message,
        confirmButtonText: "حاول مرة أخرى",
        confirmButtonColor: "#137FEC",
        background: isDarkMode() ? '#1B1F2D' : '#fff',
        color: isDarkMode() ? '#fff' : '#000',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen py-10 flex items-center justify-center px-4 bg-gradient-to-br from-[#EAF4FF] to-white dark:from-[#0F1323] dark:to-[#101922] transition-colors duration-500"
      dir="rtl"
    >
      <div className="dark:bg-[#1B1F2D] max-w-xl w-full bg-[#EAF4FF] rounded-3xl p-8 sm:p-10 shadow-xl border border-white/20">

        <h1 className="text-3xl font-bold text-center mb-2 dark:text-white">إنشاء حسابك</h1>
        <p className="text-center text-gray-500 mb-8 text-sm">
          {step === 1 ? "بياناتك الأساسية" : "اختر نوع الحساب لإتمام العملية"}
        </p>

        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className={`h-2 rounded-full transition-all duration-300 ${
              s === step ? "w-8 bg-[#137FEC]" : "w-4 bg-gray-300 dark:bg-gray-600"
            }`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="الاسم الأول" icon={<FaUser />} placeholder="الاسم الأول"
                  value={firstName} error={fieldErrors.firstName}
                  onChange={(e) => { setFirstName(e.target.value); clearErr("firstName"); }}
                />
                <FormInput
                  label="اسم العائلة" icon={<FaUser />} placeholder="اسم العائلة"
                  value={lastName} error={fieldErrors.lastName}
                  onChange={(e) => { setLastName(e.target.value); clearErr("lastName"); }}
                />
              </div>
              <FormInput
                label="رقم الهاتف" icon={<FaPhone />} placeholder="+20xxxxxxxx"
                value={phone} error={fieldErrors.phone}
                // onChange={(e) => { setPhone(e.target.value); clearErr("phone"); }}
                onChange={(e) => {
                  const cleanValue = normalizePhone(e.target.value);
                  setPhone(cleanValue);
                  clearErr("phone");
                }}
              />
              <FormInput
                label="البريد الإلكتروني" icon={<FaEnvelope />} placeholder="example@mail.com"
                value={email} error={fieldErrors.email}
                onChange={(e) => { setEmail(e.target.value); clearErr("email"); }}
              />
              <FormInput
                label="كلمة المرور" icon={<FaLock />} placeholder="8 أحرف على الأقل"
                type="password" value={password} error={fieldErrors.password}
                onChange={(e) => { setPassword(e.target.value); clearErr("password"); }}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-6"
            >
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                <button
                  onClick={() => setRole("client")}
                  className={`flex flex-col items-center justify-center gap-4 p-7 sm:p-8 rounded-3xl border-2 transition-all duration-300 ${
                    role === "client"
                      ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black shadow-2xl scale-105"
                      : "border-gray-200 dark:border-gray-700 text-gray-400 bg-transparent"
                  }`}
                >
                  <FaUserTie size={36} />
                  <span className="font-bold text-base sm:text-lg">سجل كعميل</span>
                </button>
                <button
                  onClick={() => setRole("mechanic")}
                  className={`flex flex-col items-center justify-center gap-4 p-7 sm:p-8 rounded-3xl border-2 transition-all duration-300 ${
                    role === "mechanic"
                      ? "border-[#137FEC] bg-[#137FEC] text-white shadow-2xl scale-105"
                      : "border-gray-200 dark:border-gray-700 text-gray-400 bg-transparent"
                  }`}
                >
                  <FaTools size={36} />
                  <span className="font-bold text-base sm:text-lg">سجل كميكانيكي</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 mt-8">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
            >
              السابق
            </button>
          )}
          <button
            onClick={step === 1 ? handleNext : handleSubmit}
            disabled={loading}
            className="flex-[2] bg-[#137FEC] text-white py-4 rounded-xl text-base sm:text-lg font-bold hover:bg-blue-700 transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "جارٍ الإنشاء..." : step === 1 ? "متابعة" : "إنشاء الحساب الآن"}
          </button>
        </div>

        <p className="text-center mt-6 dark:text-white text-sm">
          لديك حساب؟{" "}
          <span
            onClick={() => (window.location.href = "/login")}
            className="text-[#137FEC] font-bold cursor-pointer hover:underline"
          >
            تسجيل الدخول
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;