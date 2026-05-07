import { MdClose } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: { id: string; date: string; time: string } | null;
  token?: string;
  onSuccess?: () => void;
}

const CancelBookingModal = ({ isOpen, onClose, booking, token, onSuccess }: CancelBookingModalProps) => {
  if (!isOpen) return null;

  const handleCancel = async () => {
    console.log("Booking ID:", booking?.id);
    console.log("Token:", token);

    if (!booking?.id) {
      toast.error("معرف الحجز غير موجود");
      return;
    }

    try {
      await axios.post(
        `https://gearupapp.runasp.net/api/bookings/${booking.id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "تم إلغاء الحجز",
        text: "تم إلغاء الحجز بنجاح",
      });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Cancel error:", error.response?.data || error);
      Swal.fire({
        icon: "error",
        title: "فشل إلغاء الحجز",
        text: error.response?.data?.message || "فشل إلغاء الحجز",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

      {/* تعديل الخلفية والحدود للوضع الفاتح والداكن */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#0F172A] rounded-[40px] shadow-2xl overflow-hidden border border-gray-200 dark:border-blue-500/20">
        
        {/* زر الإغلاق */}
        <button 
          onClick={onClose} 
          className="absolute top-6 left-6 text-gray-400 dark:text-gray-600 hover:text-gray-800 dark:hover:text-white transition-colors z-10"
        >
          <MdClose size={28} />
        </button>

        <div className="p-8 md:p-10 text-right">
          {/* العنوان والنص */}
          <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-3">هل أنت متأكد؟</h2>
          <p className="text-gray-600 dark:text-white/60 text-sm mb-8">لن تتمكن من استعادة هذا الحجز بعد الإلغاء!</p>

          <div className="flex gap-3" dir="rtl">
            {/* زر التراجع */}
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 dark:bg-[#0F1323] text-gray-700 dark:text-white py-3 rounded-2xl font-bold border border-gray-200 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-[#1e293b] transition-all"
            >
              تراجع
            </button>

            {/* زر إلغاء الحجز */}
            <button
              onClick={handleCancel}
              className="flex-1 bg-red-50 dark:bg-[#EF444433] text-red-600 dark:text-[#EF4444] py-3 rounded-2xl font-bold border border-red-200 dark:border-[#EF444455] hover:bg-red-600 hover:text-white transition-all"
            >
              إلغاء الحجز
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;