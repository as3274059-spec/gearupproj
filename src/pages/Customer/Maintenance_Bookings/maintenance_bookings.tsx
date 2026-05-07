import { useLocation } from "react-router-dom";
import Sidebar from "../../../components/Customer/customer_sidebar";
import Header from "../../../components/Customer/customer_header";
import { MdAdd, MdMoreVert, MdClose, MdStar, MdCheckCircle } from "react-icons/md";
import AddBookingModal from "./add_booking_modal";
import { useState, useEffect, useRef } from "react";
import RescheduleModal from "./reschedule_modal";
import CancelBookingModal from "./cancel_booking_modal";
import Swal from "sweetalert2";

const API_URL = "https://gearupapp.runasp.net/api/bookings/my";

interface BookingResponse {
  id: string;
  customerId: string;
  mechanicId: string;
  carId: string;
  subSpecializationId: string;
  customerName: string;
  mechanicName: string;
  carInfo: string;
  subSpecializationName: string;
  date: string;
  slotStart: string;
  slotEnd: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  // ✅ إضافة حقل التقييم (تأكد من مطابقة الاسم مع رد الـ API)
  rating?: { stars: number; comment: string } | null; 
}

interface Booking extends BookingResponse {
  time: string;
  statusColor: string;
  actions: boolean;
}

interface PrefillData {
  mechanics?: { id: string }[];
  service?: string;
  carId?: string;
  autoOpen?: boolean;
}

const statusLabels: Record<string, string> = {
  Pending: "قيد الانتظار",
  Confirmed: "مؤكد",
  Accepted: "مقبول",
  Cancelled: "ملغي",
  Rejected: "مرفوض",
  Completed: "مكتمل",
};

// ✅ كومبوننت النجوم التفاعلية
const StarRating = ({ rating, onRate }: { rating: number; onRate: (val: number) => void }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1.5 dir-ltr" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onRate(star)}
          className="transition-transform hover:scale-125 active:scale-90"
        >
          <MdStar
            size={36}
            className={`transition-colors duration-200 ${star <= (hovered || rating)
              ? "text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"
              : "text-gray-300 dark:text-gray-600"
              }`}
          />
        </button>
      ))}
    </div>
  );
};

const ActionMenu = ({
  status,
  booking,
  isOpen,
  onToggle,
  onClose,
  onReschedule,
  onCancel,
  onRate,
}: any) => {
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={onToggle}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-white"
      >
        <MdMoreVert size={20} />
      </button>

      {isOpen && (
         <div className="absolute top-0 left-full ml-1 w-48 bg-white dark:bg-[#1E293B] border dark:border-gray-700 rounded-lg shadow-xl z-[9999] overflow-hidden">          {status === "Pending" ? (
            <>
              <button
                onClick={() => {
                  onReschedule(booking);
                  onClose();
                }}
                className="block w-full text-right px-4 py-2.5 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                تغيير الموعد
              </button>
              <button
                onClick={() => {
                  onCancel(booking);
                  onClose();
                }}
                className="block w-full text-right px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                إلغاء الحجز
              </button>
            </>
          ) : status === "Completed" ? (
            <>
              {/* ✅ التحقق: هل الحجز يحتوي على تقييم؟ */}
              {!booking.rating ? (
                <button
                  onClick={() => {
                    onRate(booking);
                    onClose();
                  }}
                  className="block w-full text-right px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors font-medium flex items-center gap-2"
                >
                  <MdStar size={16} />
                  تقييم الخدمة
                </button>
              ) : (
                <span className="block w-full text-right px-4 py-2.5 text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-2 cursor-default">
                  <MdCheckCircle size={16} />
                  تم التقييم
                </span>
              )}
            </>
          ) : (
            <span className="block w-full text-right px-4 py-2.5 text-sm text-gray-400">
              لا توجد إجراءات
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const MaintenanceBookings = () => {
  const location = useLocation() as { state?: { prefillData?: PrefillData } };
  const prefillData = location.state?.prefillData;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setSelectedMechanic] = useState("");
  const [, setSelectedService] = useState("");
  const [, setSelectedCar] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("الكل");
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("الكل");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ✅ حالة التقييم
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  const token = sessionStorage.getItem("userToken");

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const res = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: BookingResponse[] = await res.json();

      const mapped: Booking[] = data.map((b) => {
        let statusColor = "";

        switch (b.status) {
          case "Pending":
            statusColor =
              "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300";
            break;
          case "Confirmed":
          case "Accepted":
            statusColor =
              "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400";
            break;
          case "Cancelled":
          case "Rejected":
            statusColor =
              "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
            break;
          case "Completed":
            statusColor =
              "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";
            break;
          default:
            statusColor =
              "bg-gray-100 text-gray-700 dark:bg-gray-600/20 dark:text-gray-300";
        }

        return {
          ...b,
          time: `${b.slotStart.slice(0, 5)} - ${b.slotEnd.slice(0, 5)}`,
          statusColor,
          actions: b.status === "Pending",
        };
      });

      setBookings(mapped);
    } catch (err) {
      console.error("فشل تحميل الحجوزات:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!prefillData) return;

    setSelectedMechanic(prefillData.mechanics?.[0]?.id ?? "");
    setSelectedService(prefillData.service ?? "");
    setSelectedCar(prefillData.carId ?? "");
  }, [prefillData]);
  useEffect(() => {
    fetchBookings();
  }, []);
  useEffect(() => {
  const data = location.state?.prefillData;
  if (!data) return;

  if (data.mechanics?.[0]?.id) {
    setSelectedMechanic(data.mechanics[0].id);
  }

  if (data.service) {
    setSelectedService(data.service);
  }

  if (data.carId) {
    setSelectedCar(data.carId);
  }

  if (data.autoOpen) {
    setIsModalOpen(true);
  }
}, [location.state]);
  
  // ✅ فتح سلايد التقييم
  const openRatingDrawer = (booking: Booking) => {
    console.log("booking from row:", booking);
    console.log("selected booking id:", booking.id);

    setRatingBooking(booking);
    setStars(0);
    setComment("");
    setRatingSuccess(false);
    setIsRatingOpen(true);
  };

  // ✅ إرسال التقييم
  const handleSubmitRating = async () => {
    if (!ratingBooking || stars === 0) {
      Swal.fire({
        icon: "warning",
        title: "تنبيه",
        text: "من فضلك اختاري تقييم أولًا.",
        confirmButtonColor: "#f59e0b",
        confirmButtonText: "حسنًا",
      });
      return;
    }

    try {
      setRatingLoading(true);

      const res = await fetch(
        `https://gearupapp.runasp.net/api/bookings/${ratingBooking.id}/rating`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ stars, comment }),
        }
      );

      const responseText = await res.text();

      if (!res.ok) {
        let message = "فشل إرسال التقييم، حاول مرة تانية لاحقًا.";

        if (responseText?.includes("already")) {
          message = "تم إرسال تقييم لهذا الحجز من قبل.";
        } else if (responseText?.includes("Unauthorized")) {
          message = "انتهت الجلسة، سجلي دخول مرة تانية.";
        } else if (responseText?.includes("BookingRatings")) {
          message = "حصلت مشكلة من السيرفر أثناء حفظ التقييم.";
        }

        throw new Error(message);
      }

      // ✅ إعادة تحميل البيانات لتحديث حالة "تم التقييم"
      await fetchBookings();

      setRatingSuccess(true);

      Swal.fire({
        icon: "success",
        title: "تم بنجاح",
        text: "تم إرسال التقييم بنجاح.",
        confirmButtonColor: "#22c55e",
        confirmButtonText: "حسنًا",
      });

      setTimeout(() => {
        setIsRatingOpen(false);
        setRatingBooking(null);
      }, 1500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "حدث خطأ أثناء إرسال التقييم";

      Swal.fire({
        icon: "error",
        title: "فشل الإرسال",
        text: message,
        confirmButtonColor: "#ef4444",
        confirmButtonText: "حسنًا",
      });
    } finally {
      setRatingLoading(false);
    }
  };

  const filteredBookings = bookings
    .filter((booking) => {
      const statusMatch =
        selectedStatus === "الكل" ||
        statusLabels[booking.status] === selectedStatus;

      const bookingDate = new Date(`${booking.date.split("T")[0]}T${booking.slotStart.slice(0, 5)}`);
      const now = new Date();

      let timeMatch = true;

      if (selectedTimeFilter === "اليوم") {
        timeMatch = bookingDate.toDateString() === now.toDateString();
      }
      if (selectedTimeFilter === "هذا الأسبوع") {
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);
        timeMatch = bookingDate >= now && bookingDate <= nextWeek;
      }
      if (selectedTimeFilter === "هذا الشهر") {
        timeMatch =
          bookingDate.getMonth() === now.getMonth() &&
          bookingDate.getFullYear() === now.getFullYear();
      }

      return statusMatch && timeMatch;
    })
    .sort((a, b) => {
      const dateAString = a.date.split("T")[0];
      const dateBString = b.date.split("T")[0];
      const fullDateA = new Date(`${dateAString}T${a.slotStart.slice(0, 5)}`).getTime();
      const fullDateB = new Date(`${dateBString}T${b.slotStart.slice(0, 5)}`).getTime();
      return fullDateB - fullDateA;
    });

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      className="flex h-screen overflow-hidden dark:bg-primary_BGD bg-gray-50"
      dir="rtl"
    >
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-right">
              <h2 className="text-2xl font-bold dark:text-white text-gray-800">
                حجوزات الصيانة
              </h2>
              <p className="text-[#94A3B8] text-sm mt-1">
                تتبع أعمال الصيانة والإصلاحات الخاصة بسيارتك
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#137FEC] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-blue-600 transition-all flex items-center gap-2"
            >
              <MdAdd size={22} /> حجز جديد
            </button>
          </div>

          {/* Filters Section */}
          <div className="bg-white dark:bg-[#0F172A] border dark:border-white/10 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 block">
                  التوقيت
                </label>
                <select
                  value={selectedTimeFilter}
                  onChange={(e) => {
                    setSelectedTimeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-gray-50 dark:bg-[#1E293B] text-gray-800 dark:text-white border border-gray-200 dark:border-[#334155] rounded-xl py-2.5 px-4 outline-none cursor-pointer text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="الكل">كل الوقت</option>
                  <option value="اليوم">اليوم</option>
                  <option value="هذا الأسبوع">هذا الأسبوع</option>
                  <option value="هذا الشهر">هذا الشهر</option>
                </select>
              </div>

              <div className="flex-1 w-full">
                <label className="text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 block">
                  الحالة
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-gray-50 dark:bg-[#1E293B] text-gray-800 dark:text-white border border-gray-200 dark:border-[#334155] rounded-xl py-2.5 px-4 outline-none cursor-pointer text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="الكل">الكل</option>
                  <option value="قيد الانتظار">قيد الانتظار</option>
                  <option value="مقبول">مقبول</option>
                  <option value="ملغي">ملغي</option>
                  <option value="مرفوض">مرفوض</option>
                  <option value="مكتمل">مكتمل</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-[#0F172A] rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">
                لا توجد حجوزات بهذه المعايير
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
<div className="hidden md:block bg-white dark:bg-[#0F172A] rounded-xl shadow-sm border dark:border-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-[#131c2f] text-gray-600 dark:text-gray-300 text-sm">
                        <th className="p-4 text-right font-semibold">الميكانيكي</th>
                        <th className="p-4 text-right font-semibold">الخدمة</th>
                        <th className="p-4 text-right font-semibold">التاريخ</th>
                        <th className="p-4 text-right font-semibold">التوقيت</th>
                        <th className="p-4 text-right font-semibold">الحالة</th>
                        <th className="p-4 text-right font-semibold">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedBookings.map((booking) => (
                        <tr
                          key={booking.id}
                          className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#131c2f] transition-colors"
                        >
                          <td className="p-4 font-medium text-gray-800 dark:text-white text-sm">
                            {booking.mechanicName}
                          </td>
                          <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">
                            {booking.subSpecializationName}
                          </td>
                          <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">
                            {formatDisplayDate(booking.date)}
                          </td>
                          <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">
                            {booking.time}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-.5 rounded-md text-xs font-normal ${booking.statusColor}`}
                            >
                              {statusLabels[booking.status] || booking.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <ActionMenu
                              status={booking.status}
                              booking={booking}
                              isOpen={openMenuId === booking.id}
                              onToggle={() =>
                                setOpenMenuId(
                                  openMenuId === booking.id ? null : booking.id
                                )
                              }
                              onClose={() => setOpenMenuId(null)}
                              onReschedule={(b: Booking) => {
                                setSelectedBooking(b);
                                setIsRescheduleOpen(true);
                              }}
                              onCancel={(b: Booking) => {
                                setSelectedBooking(b);
                                setIsCancelModalOpen(true);
                              }}
                              onRate={(b: Booking) => openRatingDrawer(b)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination - Desktop */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t dark:border-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    عرض {(currentPage - 1) * itemsPerPage + 1} إلى{" "}
                    {Math.min(currentPage * itemsPerPage, filteredBookings.length)} من{" "}
                    {filteredBookings.length} حجز
                  </p>
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition ${currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#1E293B] dark:text-gray-300 dark:hover:bg-[#334155]"
                            }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {paginatedBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white dark:bg-[#0F172A] rounded-xl p-4 shadow-sm border dark:border-white/5 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">
                          {booking.mechanicName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {booking.subSpecializationName}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-normal ${booking.statusColor}`}
                      >
                        {statusLabels[booking.status] || booking.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 border-t dark:border-gray-800 pt-3">
                      <div>
                        <span className="font-semibold ml-1">التاريخ:</span>
                        {formatDisplayDate(booking.date)}
                      </div>
                      <div>
                        <span className="font-semibold ml-1">الوقت:</span>
                        {booking.time}
                      </div>
                    </div>

                    {/* أزرار الموبايل - Pending */}
                    {booking.status === "Pending" && (
                      <div className="flex gap-2 pt-3 border-t dark:border-gray-800">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsRescheduleOpen(true);
                          }}
                          className="flex-1 bg-slate-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
                        >
                          تغيير الموعد
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsCancelModalOpen(true);
                          }}
                          className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                        >
                          إلغاء الحجز
                        </button>
                      </div>
                    )}

                    {/* ✅ زر التقييم في الموبايل - Completed Logic Updated */}
                    {booking.status === "Completed" && (
                      <div className="pt-3 border-t dark:border-gray-800">
                        {!booking.rating ? (
                          <button
                            onClick={() => openRatingDrawer(booking)}
                            className="w-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 py-2.5 rounded-lg text-sm font-bold hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                          >
                            <MdStar size={18} />
                            تقييم الخدمة
                          </button>
                        ) : (
                          <div className="w-full bg-green-50 dark:bg-green-900/20 text-green-600 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                            <MdCheckCircle size={18} />
                            تم التقييم
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Pagination - Mobile */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition ${currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 border border-gray-200 dark:bg-[#1E293B] dark:text-gray-300 dark:border-gray-700"
                            }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Overlay التقييم */}
      {isRatingOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => !ratingLoading && setIsRatingOpen(false)}
        />
      )}

      {/* سلايد التقييم من اليسار */}
      <div
        dir="rtl"
        className={`fixed top-0 left-0 h-full w-full sm:w-[440px] z-50 shadow-2xl transition-transform duration-300 ease-out overflow-y-auto
          ${isRatingOpen ? "translate-x-0" : "-translate-x-full"}
          bg-white dark:bg-[#0d1629]
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
          <h2 className="text-xl font-bold dark:text-white text-gray-800">
            تقييم الخدمة
          </h2>
          <button
            onClick={() => !ratingLoading && setIsRatingOpen(false)}
            disabled={ratingLoading}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors dark:text-gray-400 text-gray-600 disabled:opacity-50"
          >
            <MdClose size={22} />
          </button>
        </div>

        {ratingBooking && (
          <div className="p-6 space-y-6">

            {/* حالة النجاح */}
            {ratingSuccess ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold dark:text-white text-gray-800">
                  شكراً لتقييمك!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  تم إرسال تقييمك بنجاح، نقدر رأيك كثيراً
                </p>
              </div>
            ) : (
              <>
                {/* أيقونة التقييم */}
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <MdStar size={32} className="text-amber-400" />
                  </div>
                </div>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  كيف كانت تجربتك مع الخدمة؟
                </p>

                {/* تفاصيل الحجز */}
                <div className="rounded-xl p-5 space-y-4 bg-gray-50 dark:bg-[#131c2f] border dark:border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {ratingBooking.mechanicName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 dark:text-white text-sm truncate">
                        {ratingBooking.mechanicName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        ميكانيكي
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">🔧 الخدمة</span>
                      <span className="text-sm font-medium dark:text-white text-gray-800">
                        {ratingBooking.subSpecializationName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">📅 التاريخ</span>
                      <span className="text-sm font-medium dark:text-white text-gray-800">
                        {formatDisplayDate(ratingBooking.date)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">⏰ التوقيت</span>
                      <span className="text-sm font-medium dark:text-white text-gray-800">
                        {ratingBooking.time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* النجوم */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block">
                    التقييم <span className="text-red-500">*</span>
                  </label>
                  <StarRating rating={stars} onRate={setStars} />
                  {stars > 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      {stars === 1 && "سيء"}
                      {stars === 2 && "مقبول"}
                      {stars === 3 && "جيد"}
                      {stars === 4 && "جيد جداً"}
                      {stars === 5 && "ممتاز"}
                    </p>
                  )}
                </div>

                {/* التعليق */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block">
                    التعليق
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="اكتب تعليقك هنا (اختياري)..."
                    rows={4}
                    className="w-full bg-gray-50 dark:bg-[#131c2f] text-gray-800 dark:text-white border dark:border-gray-700 rounded-xl py-3 px-4 outline-none text-sm resize-none focus:ring-2 focus:ring-amber-400 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>

                {/* زر الإرسال */}
                <button
                  onClick={handleSubmitRating}
                  disabled={stars === 0 || ratingLoading}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl text-sm font-bold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 disabled:shadow-none"
                >
                  {ratingLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <MdStar size={18} />
                      إرسال التقييم
                    </>
                  )}
                </button>

                {stars === 0 && (
                  <p className="text-xs text-red-500 text-center -mt-3">
                    يجب اختيار تقييم واحد على الأقل
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchBookings()}
      />

      <RescheduleModal
        isOpen={isRescheduleOpen}
        booking={selectedBooking}
        onClose={() => setIsRescheduleOpen(false)}
        onSuccess={() => fetchBookings()}
      />

      <CancelBookingModal
        isOpen={isCancelModalOpen}
        booking={selectedBooking}
        token={token ?? undefined}
        onSuccess={() => fetchBookings()}
        onClose={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
};

export default MaintenanceBookings;