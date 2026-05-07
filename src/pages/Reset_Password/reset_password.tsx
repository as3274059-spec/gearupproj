import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Footer from "../../components/Footer/footer";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      setError("يرجى ملء جميع الحقول");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (password.length < 8) {
      setError("يجب أن تكون كلمة المرور 8 أحرف على الأقل");
      return;
    }

    const token = sessionStorage.getItem("reset_token");
    if (!token) {
      setError("انتهت صلاحية الجلسة، يرجى البدء من جديد");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://gearupapp.runasp.net/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword: password }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "حدث خطأ، يرجى المحاولة مرة أخرى");
      }

      sessionStorage.removeItem("reset_token");
      setSuccess(true);
      setTimeout(() => (window.location.href = "/login"), 2000);
    } catch (err: any) {
      setError(err.message || "حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen flex flex-col
        bg-white dark:bg-primary_BGD
        text-gray-900 dark:text-white
        transition-colors duration-500
      "
      dir="rtl"
    >
      <div className="flex-1 flex items-center justify-center px-6">
        <div
          className="
            w-full max-w-xl 
            bg-[#E8F3FF] dark:bg-[#137FEC0D] 
            border border-[#137FEC40] 
            p-10 rounded-[30px] shadow-sm
          "
        >
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-3xl font-bold">إعادة تعيين كلمة المرور</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              أدخل كلمة المرور الجديدة لتأمين حسابك
            </p>
          </div>

          <div className="space-y-6">
            {/* NEW PASSWORD */}
            <div className="space-y-2">
              <label className="block font-medium text-right px-1">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                  className="
                    w-full h-12 rounded-xl px-4 pl-12
                    bg-white dark:bg-[#137FEC1A]
                    border-none outline-none
                    focus:ring-2 focus:ring-[#137FEC]
                    placeholder-gray-400 text-sm
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#137FEC] transition-colors"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="space-y-2">
              <label className="block font-medium text-right px-1">
                تأكيد كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
                  className="
                    w-full h-12 rounded-xl px-4 pl-12
                    bg-white dark:bg-[#137FEC1A]
                    border-none outline-none
                    focus:ring-2 focus:ring-[#137FEC]
                    placeholder-gray-400 text-sm
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#137FEC] transition-colors"
                >
                  {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            {success && (
              <p className="text-green-500 text-sm text-center">
                تم تغيير كلمة المرور بنجاح! جارٍ التحويل...
              </p>
            )}

            {/* SUBMIT */}
            <button
              onClick={handleSubmit}
              disabled={loading || success}
              className="
                w-full h-12 mt-4
                bg-[#137FEC] hover:bg-blue-600 
                disabled:opacity-60 disabled:cursor-not-allowed
                text-white font-bold rounded-xl 
                transition-all duration-300
                shadow-md
              "
            >
              {loading ? "جارٍ الإرسال..." : "إرسال"}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ResetPassword;