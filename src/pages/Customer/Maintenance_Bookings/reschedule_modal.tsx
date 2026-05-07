import { useEffect, useState } from "react";
import axios from "axios";
import { MdCalendarMonth, MdAccessTime, MdClose } from "react-icons/md";
import Swal from "sweetalert2";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  booking?: {
    id: string;
    date: string;
    slotStart?: string;
    slotEnd?: string;
    time?: string;
  } | null;
}

const RescheduleModal = ({
  isOpen,
  onClose,
  onSuccess,
  booking,
}: RescheduleModalProps) => {
  const [newDate, setNewDate] = useState("");
  const [newSlotStart, setNewSlotStart] = useState("");
  const [newSlotEnd, setNewSlotEnd] = useState("");
  const [loading, setLoading] = useState(false);

  // تم تعديل الاستايل ليدعم الوضع الفاتح والداكن
  const inputStyle =
    "w-full bg-gray-100 dark:bg-[#0F172A] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-800 dark:text-blue-400 font-bold outline-none cursor-pointer hover:bg-gray-200 dark:hover:bg-[#1e293b] transition-all focus:border-blue-500/50";
    
  const labelStyle = "text-right font-bold text-gray-700 dark:text-white mb-2 block text-sm pr-1";

  useEffect(() => {
    if (booking && isOpen) {
      setNewDate(formatDateForInput(booking.date));

      const startTime = normalizeTimeForInput(
        booking.slotStart || booking.time || ""
      );
      const endTime = normalizeTimeForInput(booking.slotEnd || "");

      setNewSlotStart(startTime);
      setNewSlotEnd(endTime);
    }
  }, [booking, isOpen]);

  if (!isOpen) return null;

  function formatDateForInput(date: string) {
    if (!date) return "";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return date.split("T")[0] || "";
    }
    return parsed.toISOString().split("T")[0];
  }

  function normalizeTimeForInput(time: string) {
    if (!time) return "";

    const pureTime = time.includes("T") ? time.split("T")[1] : time;
    const cleaned = pureTime.split(".")[0];

    if (/^\d{2}:\d{2}:\d{2}$/.test(cleaned)) {
      return cleaned.slice(0, 5);
    }

    if (/^\d{2}:\d{2}$/.test(cleaned)) {
      return cleaned;
    }

    return "";
  }

  function toApiTimeFormat(time: string) {
    if (!time) return "";
    return time.length === 5 ? `${time}:00` : time;
  }

  const handleReschedule = async () => {
    if (!booking?.id) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "معرف الحجز غير موجود.",
        confirmButtonColor: "#EF4444",
      });
      return;
    }

    if (!newDate || !newSlotStart || !newSlotEnd) {
      Swal.fire({
        icon: "warning",
        title: "تنبيه",
        text: "من فضلك املي التاريخ ووقت البداية ووقت النهاية.",
        confirmButtonColor: "#F59E0B",
      });
      return;
    }

    if (newSlotEnd <= newSlotStart) {
      Swal.fire({
        icon: "warning",
        title: "تنبيه",
        text: "وقت النهاية لازم يكون بعد وقت البداية.",
        confirmButtonColor: "#F59E0B",
      });
      return;
    }

    try {
      setLoading(true);

      const token = sessionStorage.getItem("userToken");

      await axios.put(
        `https://gearupapp.runasp.net/api/bookings/${booking.id}/reschedule`,
        {
          newDate,
          newSlotStart: toApiTimeFormat(newSlotStart),
          newSlotEnd: toApiTimeFormat(newSlotEnd),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "تم تغيير الموعد",
        text: "تم تغيير موعد الحجز بنجاح.",
        confirmButtonColor: "#10B981",
      });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Reschedule error:", error);

      const message =
        error?.response?.data?.title ||
        error?.response?.data?.message ||
        error?.response?.data?.errors?.newSlotStart?.[0] ||
        error?.response?.data?.errors?.newSlotEnd?.[0] ||
        error?.response?.data?.errors?.newDate?.[0] ||
        "حدث خطأ أثناء تغيير الموعد.";

      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: message,
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* تعديل الخلفية والحدود للوضع الفاتح والداكن */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-[40px] shadow-2xl overflow-hidden border border-gray-200 dark:border-blue-500/20 animate-in fade-in zoom-in duration-300">
        
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors z-10"
        >
          <MdClose size={30} />
        </button>

        <div className="p-8 md:p-12">
          {/* العنوان */}
          <h2 className="text-2xl font-black text-gray-800 dark:text-white text-right mb-10">
            تغيير موعد
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* حقل التاريخ */}
              <div className="text-right">
                <label className={labelStyle}>التاريخ الجديد</label>
                <div className="relative">
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className={`${inputStyle} custom-date-input pl-12`}
                    dir="rtl"
                  />
                  <MdCalendarMonth className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white text-xl pointer-events-none" />
                </div>
              </div>

              {/* حقل وقت البداية */}
              <div className="text-right">
                <label className={labelStyle}>وقت البداية</label>
                <div className="relative">
                  <input
                    type="time"
                    value={newSlotStart}
                    onChange={(e) => setNewSlotStart(e.target.value)}
                    className={`${inputStyle} custom-time-input pl-12`}
                    dir="rtl"
                  />
                  <MdAccessTime className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white text-xl pointer-events-none" />
                </div>
              </div>

              {/* حقل وقت النهاية */}
              <div className="text-right">
                <label className={labelStyle}>وقت النهاية</label>
                <div className="relative">
                  <input
                    type="time"
                    value={newSlotEnd}
                    onChange={(e) => setNewSlotEnd(e.target.value)}
                    className={`${inputStyle} custom-time-input pl-12`}
                    dir="rtl"
                  />
                  <MdAccessTime className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white text-xl pointer-events-none" />
                </div>
              </div>
            </div>

            {/* الأزرار */}
            <div className="flex gap-4 pt-6" dir="rtl">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-100 text-gray-700 dark:bg-[#0F1323] dark:text-white py-4 rounded-2xl font-black text-lg border border-gray-200 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-[#1e293b] transition-all disabled:opacity-60"
              >
                الغاء
              </button>

              <button
                type="button"
                disabled={loading}
                className="flex-1 bg-[#137FEC] text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:hover:scale-100"
                onClick={handleReschedule}
              >
                {loading ? "جاري تغيير الموعد..." : "تغيير الموعد"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS مخصص لإخفاء الأيقونة الأصلية للمتصفح لتناسب الوضعين */}
      <style>{`
        .custom-date-input::-webkit-calendar-picker-indicator,
        .custom-time-input::-webkit-calendar-picker-indicator {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: transparent;
          cursor: pointer;
          opacity: 0; /* إخفاء الأيقونة الأصلية تماماً */
        }
      `}</style>
    </div>
  );
};

export default RescheduleModal;