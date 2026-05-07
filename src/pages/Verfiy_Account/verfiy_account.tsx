import { useState, useEffect, useRef } from "react";
import Footer from "../../components/Footer/footer";

const Verification = () => {
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 4) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const token = otp.join("");
    if (token.length < 5) {
      setError("يرجى إدخال الرمز كاملاً");
      return;
    }
    setError("");
    // حفظ التوكين بس — الـ API call هيتعمل في صفحة reset-password مع الباسورد
    sessionStorage.setItem("reset_token", token);
    window.location.href = "/reset-password";
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
        <div className="w-full max-w-xl bg-[#E8F3FF] dark:bg-[#137FEC0D] border border-[#137FEC40] p-10 rounded-[30px] shadow-sm">
          
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">التحقق من حسابك</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              لضمان سلامتك، يرجى إدخال الرمز المكون من 5 أرقام <br />
              الذي أرسلناه إلى عنوان بريدك الإلكتروني للمتابعة.
            </p>
          </div>

          {/* OTP INPUTS */}
          <div className="flex justify-center gap-2 my-8" dir="ltr">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  if (el) inputsRef.current[index] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="
                  w-10 h-12 md:w-12 md:h-14 
                  text-center text-xl font-bold
                  rounded-lg border-none
                  bg-white dark:bg-gray-500
                  focus:ring-2 focus:ring-[#137FEC] outline-none
                  shadow-sm dark:text-white
                "
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}

          {/* VERIFY BUTTON */}
          <button
            onClick={handleVerify}
            className="
              w-full h-12 
              bg-[#137FEC] hover:bg-blue-600 
              text-white font-semibold rounded-xl 
              transition-all duration-300
            "
          >
            التحقق من الحساب
          </button>

          {/* RESEND SECTION */}
          <div className="flex justify-between items-center mt-6 px-2">
            <p className="text-sm">
              لم تستلم الرمز؟
              <button
                disabled={timer > 0}
                onClick={() => setTimer(60)}
                className={`mr-1 font-bold text-[#137FEC] ${timer > 0 ? "opacity-50 cursor-not-allowed" : "hover:underline"}`}
              >
                أعد الإرسال
              </button>
            </p>
            <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
              {formatTime(timer)}
            </span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Verification;