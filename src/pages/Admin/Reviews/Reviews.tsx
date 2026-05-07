import React, { useEffect, useState } from "react";
import AdminSidebar from "../../../components/AdminSidebar/AdminSidebar";
import NotificationBell from "../../../components/NotificationBell/notification_bell";
import ThemeToggle from "../../../components/ThemeToggle/theme_toggle";
import { FaSearch, FaStar, FaEllipsisH } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { useTheme } from "../../../contexts/ThemeContext";
import axios from "axios";
import Swal from "sweetalert2";

// Types
interface ApiReview {
  ratingId: string;
  bookingId: string;
  mechanicId: string;
  customerId: string;
  subSpecializationId: string;
  serviceName: string;
  stars: number;
  comment: string | null;
  customerName: string;
  createdAt: string;
}

interface MechanicBasic {
  id: string;
  firstName: string;
  lastName: string;
}

interface ReviewDisplay {
  id: string;
  customerName: string;
  mechanicName: string;
  serviceName: string;
  date: string;
  stars: number;
  comment: string | null;
  bookingId: string;
}

// Component: DeleteReviewModal
interface DeleteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId?: string;
  token?: string;
  onSuccess?: () => void;
}

const DeleteReviewModal: React.FC<DeleteReviewModalProps> = ({ isOpen, onClose, reviewId, token, onSuccess }) => {
  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!reviewId) {
      return;
    }

    try {
      await axios.delete(
        `https://gearupapp.runasp.net/api/admin/bookings/${reviewId}/review`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "تم حذف المراجعة",
        text: "تم حذف المراجعة بنجاح",
      });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Delete error:", error.response?.data || error);
      Swal.fire({
        icon: "error",
        title: "فشل حذف المراجعة",
        text: error.response?.data?.message || "فشل حذف المراجعة",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Body */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#0F172A] rounded-[40px] shadow-2xl overflow-hidden border border-gray-200 dark:border-blue-500/20">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-6 left-6 text-gray-400 dark:text-gray-600 hover:text-gray-800 dark:hover:text-white transition-colors z-10"
        >
          <MdClose size={28} />
        </button>

        <div className="p-8 md:p-10 text-right">
          {/* Title and Text */}
          <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-3">هل أنت متأكد؟</h2>
          <p className="text-gray-600 dark:text-white/60 text-sm mb-8">لن تتمكن من استعادة هذه المراجعة بعد الحذف!</p>

          <div className="flex gap-3" dir="rtl">
            {/* Cancel Button */}
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 dark:bg-[#0F1323] text-gray-700 dark:text-white py-3 rounded-2xl font-bold border border-gray-200 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-[#1e293b] transition-all"
            >
              تراجع
            </button>

            {/* Confirm Delete Button */}
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-50 dark:bg-[#EF444433] text-red-600 dark:text-[#EF4444] py-3 rounded-2xl font-bold border border-red-200 dark:border-[#EF444455] hover:bg-red-600 hover:text-white transition-all"
            >
              حذف المراجعة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Reviews: React.FC = () => {
  const { dark } = useTheme();

  const [allReviews, setAllReviews] = useState<ReviewDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State لقائمة الميكانيكيين
  const [mechanicsMap, setMechanicsMap] = useState<Record<string, string>>({});
  
  // State للقائمة المنسدلة (الإجراءات)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // State لعرض الـ Drawer (تفاصيل المراجعة)
  const [selectedReview, setSelectedReview] = useState<ReviewDisplay | null>(null);
  
  // State لفتح Modal الحذف
  const [reviewToDelete, setReviewToDelete] = useState<ReviewDisplay | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = sessionStorage.getItem("userToken");

  // 1. جلب أسماء الميكانيكيين
  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const response = await fetch("https://gearupapp.runasp.net/api/admin/mechanics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data: MechanicBasic[] = await response.json();
          const map: Record<string, string> = {};
          data.forEach(m => {
            map[m.id] = `${m.firstName} ${m.lastName}`;
          });
          setMechanicsMap(map);
        }
      } catch (error) {
        console.error("Error fetching mechanics map:", error);
      }
    };
    fetchMechanics();
  }, []);

  // 2. جلب قائمة المراجعات
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://gearupapp.runasp.net/api/admin/reviews", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data: ApiReview[] = await response.json();
          const formattedData: ReviewDisplay[] = data.map(item => ({
            id: item.ratingId,
            customerName: item.customerName,
            mechanicName: mechanicsMap[item.mechanicId] || "غير معروف",
            serviceName: item.serviceName,
            date: formatDate(item.createdAt),
            stars: item.stars,
            comment: item.comment,
            bookingId: item.bookingId,
          }));
          setAllReviews(formattedData);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    if (Object.keys(mechanicsMap).length > 0 || loading) {
        fetchReviews();
    }
  }, [mechanicsMap]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // إغلاق القائمة عند النقر في أي مكان
  useEffect(() => {
    const handler = () => setActiveMenuId(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  // التعامل مع القائمة
  const handleMenuClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  // البحث
  const filteredReviews = allReviews.filter((r) => {
    return r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           r.mechanicName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div dir="rtl" className={`flex min-h-screen ${!dark ? "bg-gray-50" : "bg-[#0B1220]"}`}>
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className={!dark ? "text-gray-600" : "text-gray-400"}>جاري تحميل المراجعات...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className={`flex min-h-screen transition-colors duration-500 ${
        !dark ? "bg-gray-50 text-[#1E3A5F]" : "bg-[#0B1220] text-white"
      }`}
    >
      <AdminSidebar />
      <main className="flex-1 p-3 md:p-6 lg:p-8 space-y-4 md:space-y-6 w-full overflow-x-hidden mt-12 lg:mt-0">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-6">
          <h1 className={`text-xl md:text-2xl lg:text-3xl font-bold ${!dark ? "text-black" : "text-white"}`}>
            آراء العملاء
          </h1>
          <div className="flex items-center gap-3 md:gap-4 self-end sm:self-auto">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>

        {/* SEARCH */}
        <div
          className={`flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl ${
            !dark
              ? "bg-white shadow-md border border-gray-200"
              : "bg-[#0d1629] border border-gray-800"
          }`}
        >
          <FaSearch className={`text-base md:text-lg ${!dark ? "text-gray-400" : "text-gray-500"}`} />
          <input
            type="text"
            placeholder="البحث حسب العميل أو الميكانيكي..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`flex-1 bg-transparent outline-none text-sm md:text-base ${!dark ? "text-gray-900" : "text-white"} placeholder-gray-500`}
          />
        </div>

        {/* EMPTY STATE */}
        {filteredReviews.length === 0 && (
          <div className={`text-center py-16 rounded-xl ${!dark ? "bg-white" : "bg-[#0d1629]"}`}>
            <p className={!dark ? "text-gray-500" : "text-gray-400"}>لا يوجد مراجعات</p>
          </div>
        )}

        {/* TABLE - Desktop */}
        {filteredReviews.length > 0 && (
          <div className={`hidden md:block rounded-xl overflow-hidden ${!dark ? "bg-white shadow-xl" : "bg-[#0d1629]"}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className={`text-right text-xs lg:text-sm ${!dark ? "bg-gray-50 text-gray-700" : "bg-[#131c2f] text-gray-300"}`}>
                    <th className="p-3 lg:p-4 font-semibold">العميل</th>
                    <th className="p-3 lg:p-4 font-semibold">الميكانيكي</th>
                    <th className="p-3 lg:p-4 font-semibold">الخدمة</th>
                    <th className="p-3 lg:p-4 font-semibold">التاريخ</th>
                    <th className="p-3 lg:p-4 font-semibold">التقييم</th>
                    <th className="p-3 lg:p-4 font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReviews.map((review) => (
                    <tr
                      key={review.id}
                      className={`border-b transition-colors ${!dark ? "border-gray-200 hover:bg-gray-50" : "border-gray-800 hover:bg-[#131c2f]"}`}
                    >
                      <td className="p-3 lg:p-4 font-medium text-xs lg:text-sm">{review.customerName}</td>
                      <td className={`p-3 lg:p-4 text-xs lg:text-sm ${!dark ? "text-gray-600" : "text-gray-400"}`}>{review.mechanicName}</td>
                      <td className={`p-3 lg:p-4 text-xs lg:text-sm ${!dark ? "text-gray-600" : "text-gray-400"}`}>{review.serviceName}</td>
                      <td className={`p-3 lg:p-4 text-xs lg:text-sm ${!dark ? "text-gray-600" : "text-gray-400"}`}>{review.date}</td>
                      <td className="p-3 lg:p-4">
                         <div className="flex gap-1 text-yellow-500">
                            {[...Array(review.stars)].map((_, i) => <FaStar key={i} size={12} />)}
                         </div>
                      </td>
                      <td className="p-3 lg:p-4">
                        <div className="relative inline-block text-left">
                          <button 
                            onClick={(e) => handleMenuClick(e, review.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                          >
                            <FaEllipsisH className={`${dark ? "text-gray-400" : "text-gray-600"}`} />
                          </button>
                          
                          {/* Dropdown Menu */}
                          {activeMenuId === review.id && (
                            <div className={`absolute top-0 left-full w-32 rounded-lg shadow-xl border z-50 overflow-hidden mt-1 ${
                                !dark ? "bg-white border-gray-200" : "bg-[#131c2f] border-gray-800"
                              }`}>
                              <button
                                onClick={() => { setSelectedReview(review); setActiveMenuId(null); }}
                                className={`w-full text-right px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${!dark ? "text-gray-700" : "text-gray-300"}`}
                              >
                                عرض
                              </button>
                              <button
                                onClick={() => { setReviewToDelete(review); setActiveMenuId(null); }}
                                className={`w-full text-right px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400`}
                              >
                                حذف
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t ${!dark ? "border-gray-200" : "border-gray-800"}`}>
              <span className={`text-xs md:text-sm ${!dark ? "text-gray-600" : "text-gray-400"}`}>
                عرض {(currentPage - 1) * itemsPerPage + 1} إلى {Math.min(currentPage * itemsPerPage, filteredReviews.length)} من {filteredReviews.length} مراجعة
              </span>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg text-xs md:text-sm font-medium transition ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : !dark
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-[#131c2f] text-gray-300 hover:bg-[#1a2332]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CARDS - Mobile */}
        {filteredReviews.length > 0 && (
          <div className="md:hidden space-y-3">
            {paginatedReviews.map((review) => (
              <div
                key={review.id}
                className={`p-4 rounded-xl ${!dark ? "bg-white shadow-md border border-gray-200" : "bg-[#0d1629] border border-gray-800"}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{review.customerName}</h3>
                    <p className={`text-xs ${!dark ? "text-gray-600" : "text-gray-400"}`}>قام بمراجعة: <span className="font-bold">{review.mechanicName}</span></p>
                    <p className={`text-xs ${!dark ? "text-gray-600" : "text-gray-400"}`}>الخدمة: {review.serviceName}</p>
                  </div>
                  <div className="relative">
                    <button onClick={(e) => handleMenuClick(e, review.id)} className="p-1">
                        <FaEllipsisH className="text-gray-400" />
                    </button>
                     {activeMenuId === review.id && (
                        <div className={`absolute top-0 left-full w-32 rounded-lg shadow-xl border z-50 overflow-hidden mt-1 ${
                            !dark ? "bg-white border-gray-200" : "bg-[#131c2f] border-gray-800"
                          }`}>
                            <button onClick={() => { setSelectedReview(review); setActiveMenuId(null); }} className="w-full text-right px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20">عرض</button>
                            <button onClick={() => { setReviewToDelete(review); setActiveMenuId(null); }} className="w-full text-right px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600">حذف</button>
                        </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                   <div className="flex gap-1 text-yellow-500">
                     {[...Array(review.stars)].map((_, i) => <FaStar key={i} size={10} />)}
                   </div>
                   <span className={`text-xs ${!dark ? "text-gray-400" : "text-gray-500"}`}>{review.date}</span>
                </div>
              </div>
            ))}

            {/* PAGINATION (MOBILE) */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : !dark
                        ? "bg-white text-gray-700 border border-gray-200"
                        : "bg-[#131c2f] text-gray-300 border border-gray-800"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* OVERLAY */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedReview(null)} />
      )}

    
    {/* DRAWER - DETAILS VIEW */}
<div
  dir="rtl"
  className={`fixed top-0 left-0 h-full w-full sm:w-[420px] z-50 shadow-2xl transition-transform duration-300 overflow-y-auto flex flex-col
    ${selectedReview ? "translate-x-0" : "-translate-x-full"}
    ${!dark ? "bg-white border-r border-gray-200" : "bg-[#0d1629] border-r border-gray-800"}
  `}
>
  {/* Header */}
  <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${!dark ? "border-gray-200" : "border-gray-800"}`}>
    <h2 className="text-base font-semibold">تفاصيل المراجعة</h2>
    <button
      onClick={() => setSelectedReview(null)}
      className={`w-8 h-8 flex items-center justify-center rounded-full border text-sm transition
        ${!dark ? "border-gray-200 text-gray-500 hover:bg-gray-100" : "border-gray-700 text-gray-400 hover:bg-gray-800"}`}
    >✕</button>
  </div>

  {/* Body */}
  {selectedReview && (
    <div className="flex flex-col gap-4 p-5 overflow-y-auto flex-1">

      {/* Hero */}
      <div className={`flex items-center gap-4 p-4 rounded-xl ${!dark ? "bg-gray-50" : "bg-[#131c2f]"}`}>
        <div className="w-13 h-13 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl font-semibold w-[52px] h-[52px] shrink-0">
          {selectedReview.customerName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold mb-0.5">{selectedReview.customerName}</h3>
          <p className={`text-xs truncate ${dark ? "text-gray-400" : "text-gray-500"}`}>قيّم الخدمة في {selectedReview.date}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} size={14} className={i < selectedReview.stars ? "text-amber-400" : "text-gray-300 dark:text-gray-700"} />
              ))}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${!dark ? "bg-amber-50 text-amber-800" : "bg-amber-900/30 text-amber-400"}`}>
              {selectedReview.stars} / 5
            </span>
          </div>
        </div>
      </div>

      {/* Booking Info */}
      <div className={`rounded-xl border overflow-hidden ${!dark ? "border-gray-200" : "border-gray-800"}`}>
        <div className={`text-[11px] font-semibold uppercase tracking-wider px-4 py-3 border-b ${!dark ? "text-gray-400 bg-white border-gray-200" : "text-gray-500 bg-[#131c2f] border-gray-800"}`}>
          بيانات الحجز
        </div>
        {[
          { label: "الميكانيكي", value: selectedReview.mechanicName },
          { label: "الخدمة", value: selectedReview.serviceName },
          { label: "تاريخ المراجعة", value: selectedReview.date },
          { label: "رقم الحجز", value: `#${selectedReview.bookingId.slice(0, 8).toUpperCase()}`, muted: true },
        ].map((row, i, arr) => (
          <div
            key={row.label}
            className={`flex items-center justify-between px-4 py-2.5 text-sm ${i < arr.length - 1 ? `border-b ${!dark ? "border-gray-100" : "border-gray-800/60"}` : ""}`}
          >
            <span className={dark ? "text-gray-400" : "text-gray-500"}>{row.label}</span>
            <span className={`font-medium text-right max-w-[55%] truncate ${row.muted ? (dark ? "text-gray-500 font-normal text-xs" : "text-gray-400 font-normal text-xs") : ""}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Comment */}
      <div className={`rounded-xl border overflow-hidden ${!dark ? "border-gray-200" : "border-gray-800"}`}>
        <div className={`text-[11px] font-semibold uppercase tracking-wider px-4 py-3 border-b ${!dark ? "text-gray-400 bg-white border-gray-200" : "text-gray-500 bg-[#131c2f] border-gray-800"}`}>
          تعليق العميل
        </div>
        <p className={`px-4 py-3 text-sm leading-relaxed ${!dark ? "text-gray-700" : "text-gray-300"}`}>
          {selectedReview.comment || <span className={dark ? "text-gray-600" : "text-gray-400"}>لا يوجد تعليق نصي لهذه المراجعة.</span>}
        </p>
      </div>

      {/* Delete */}
      <button
        onClick={() => { setReviewToDelete(selectedReview); setSelectedReview(null); }}
       className="w-full py-3 rounded-xl text-sm font-medium border border-red-600 bg-red-600 text-white hover:bg-red-700 transition"
      >
        حذف هذه المراجعة
      </button>

    </div>
  )}
</div>

      {/* DELETE REVIEW MODAL */}
      <DeleteReviewModal
        isOpen={!!reviewToDelete}
        onClose={() => setReviewToDelete(null)}
        reviewId={reviewToDelete?.bookingId}
        token={token ?? undefined}
        onSuccess={() => {
          setAllReviews(allReviews.filter(r => r.id !== reviewToDelete?.id));
          setReviewToDelete(null);
        }}
      />
    </div>
  );
};

export default Reviews;