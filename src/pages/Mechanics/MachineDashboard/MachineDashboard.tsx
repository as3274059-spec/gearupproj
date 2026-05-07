import { useState, useEffect } from "react";
import NotificationBell from "../../../components/NotificationBell/notification_bell";
import ThemeToggle from "../../../components/ThemeToggle/theme_toggle";
import { useTheme } from "../../../contexts/ThemeContext";
import MachineSidebar from "../../../components/Machine/MachineSidebar";
import { FaStar } from "react-icons/fa";

interface Booking {
  id: string;
  customerName: string;
  carInfo: string;
  subSpecializationName: string;
  date: string;
  slotStart: string;
  slotEnd: string;
  status: string;
}

// واجهة بيانات المراجعة (تأكد من تطابقها مع رد الـ API الفعلي)
interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string; // createdAt من الـ API
}

const MachineDashboard = () => {
  const { dark } = useTheme();
  
  // State for Data
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Booking[]>([]);
  
  // State for Average Rating
  const [averageRating, setAverageRating] = useState<number | string>("--");
  const [loadingRating, setLoadingRating] = useState(true);

  // State for Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingToday, setLoadingToday] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // --- Fetch Data ---
  const token = sessionStorage.getItem("userToken");

 

  // Fetch Pending Requests
  const fetchPendingRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await fetch("https://gearupapp.runasp.net/api/bookings/mechanic/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch requests");
      const data: Booking[] = await res.json();
      const pending = data.filter(b => b.status === "Pending");
      setPendingBookings(pending);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Fetch Today's Appointments
  const fetchTodayAppointments = async () => {
    try {
      setLoadingToday(true);
      const res = await fetch("https://gearupapp.runasp.net/api/bookings/mechanic/my/today", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch today's appointments");
      const data: Booking[] = await res.json();
      data.sort((a, b) => a.slotStart.localeCompare(b.slotStart));
      setTodayAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingToday(false);
    }
  };

   
   // Fetch Average Rating
  const fetchAverageRating = async () => {
    try {
      setLoadingRating(true);
      const res = await fetch(`https://gearupapp.runasp.net/api/mechanics/mechanic/${mechanicId}/average-rating`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch rating");
      const data = await res.json();

      console.log("Rating Data:", data); 

      // --- التعديل هنا: نبحث عن avgRating أولاً ---
      let ratingValue = "0";

      if (typeof data === 'number') {
        ratingValue = String(data);
      } else if (typeof data === 'object' && data !== null) {
        // تم وضع avgRating في البداية لأن هذا هو ما يظهر في الصورة
        ratingValue = data.avgRating ?? data.averageRating ?? data.rating ?? "0";
      }
      
      setAverageRating(ratingValue);
      
    } catch (err) {
      console.error(err);
      setAverageRating("0");
    } finally {
      setLoadingRating(false);
    }
  };


// استخرج الـ ID من الـ JWT token
const getMechanicId = () => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log("Token payload:", payload); // شوف الحقل الصح
    return payload.sub ?? payload.id ?? payload.userId ?? payload.mechanicId;
  } catch {
    return null;
  }
};

const mechanicId = getMechanicId();
const fetchLatestReviews = async () => {
  try {
    setLoadingReviews(true);
    const res = await fetch(
      `https://gearupapp.runasp.net/api/mechanics/mechanic/${mechanicId}/latest?count=5`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    // الـ API بيرجع { reviews: [...], totalCount: n }
    const mapped = data.reviews.map((r: any) => ({
      id: r.id,
      clientName: r.userName,   // ✅ userName مش clientName
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt,        // ✅ createdAt مش date
    }));

    setReviews(mapped);
  } catch (err) {
    console.error("Reviews error:", err);
    setReviews([]);
  } finally {
    setLoadingReviews(false);
  }
};

  useEffect(() => {
    fetchPendingRequests();
    fetchTodayAppointments();
    fetchAverageRating();
    fetchLatestReviews(); // جلب المراجعات
  }, []);

  // --- Actions ---
  const handleAccept = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      const res = await fetch(`https://gearupapp.runasp.net/api/bookings/${bookingId}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error("Failed to accept");
      await Promise.all([fetchPendingRequests(), fetchTodayAppointments()]);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      const res = await fetch(`https://gearupapp.runasp.net/api/bookings/${bookingId}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error("Failed to reject");
      await fetchPendingRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Dynamic Stats
  const stats = [
    { title: "طلبات الحجز الجديدة", value: loadingRequests ? "..." : pendingBookings.length.toString(), change: "طلبات قيد الانتظار", positive: true },
    { title: "مواعيد اليوم", value: loadingToday ? "..." : todayAppointments.length.toString(), change: "موعد مجدول", positive: true },
    { title: "متوسط التقييم", value: loadingRating ? "..." : averageRating.toString(), change: "0+ هذا الشهر", positive: true },
  ];

  const cardBase = `rounded-xl transition-all ${
    !dark ? "bg-white shadow-md" : "bg-[#0d1629]"
  }`;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed":
      case "Accepted":
        return "bg-green-600/20 text-green-400";
      case "Pending":
        return "bg-yellow-600/20 text-yellow-400";
      case "In-Progress":
        return "bg-blue-600/20 text-blue-400";
      default:
        return "bg-gray-600/20 text-gray-400";
    }
  };
  
  const getStatusText = (status: string) => {
    switch(status) {
      case "Confirmed": return "مؤكد";
      case "Accepted": return "مقبول";
      case "Pending": return "قيد الانتظار";
      case "In-Progress": return "قيد التنفيذ";
      default: return status;
    }
  };

  return (
    <div
      dir="rtl"
      className={`flex min-h-screen transition-colors duration-500 ${
        !dark ? "bg-gray-50 text-[#1E3A5F]" : "bg-[#0B1220] text-white"
      }`}
    >
      <MachineSidebar />

      <main className="flex-1 min-w-0 p-3 sm:p-5 md:p-8 space-y-5 md:space-y-8 overflow-x-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between mt-14 lg:mt-0 gap-3">
          <h1 className={`text-2xl md:text-3xl font-bold ${!dark ? "text-black" : "text-white"}`}>
            لوحة التحكم
          </h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationBell size={25} />
            <ThemeToggle />
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
          {stats.map((stat, i) => (
            <div key={i} className={`p-4 sm:p-6 rounded-xl transition-all ${
              !dark
                ? "bg-white shadow-md hover:shadow-lg"
                : "bg-gradient-to-br from-[#1a2332] to-[#0d1629] hover:from-[#1e2840] hover:to-[#0f1a2d]"
            }`}>
              <p className={`text-xs sm:text-sm mb-2 ${!dark ? "text-gray-600" : "text-gray-400"}`}>{stat.title}</p>
              <h3 className="text-2xl sm:text-3xl font-bold mb-1">{stat.value}</h3>
              <p className={`text-xs ${stat.positive ? "text-green-500" : "text-red-500"}`}>{stat.change}</p>
            </div>
          ))}
        </div>

        {/* BOOKINGS TABLE (Pending Requests) */}
        <div className={cardBase}>
          <div className={`p-4 sm:p-6 border-b ${!dark ? "border-gray-200" : "border-gray-700"}`}>
            <h2 className="text-lg sm:text-xl font-bold">طلبات الحجز الجديدة</h2>
          </div>

          {loadingRequests ? (
            <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
          ) : pendingBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-400">لا توجد طلبات جديدة</div>
          ) : (
            <>
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`text-right text-sm ${!dark ? "bg-gray-50" : "bg-[#131c2f]"}`}>
                      <th className="p-4 font-medium">عميل</th>
                      <th className="p-4 font-medium">عربة</th>
                      <th className="p-4 font-medium">خدمة</th>
                      <th className="p-4 font-medium">التاريخ والوقت</th>
                      <th className="p-4 font-medium">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingBookings.map((b) => (
                      <tr key={b.id} className={`border-b ${!dark ? "border-gray-200" : "border-gray-800"}`}>
                        <td className="p-4 font-medium">{b.customerName}</td>
                        <td className="p-4 text-gray-400">{b.carInfo}</td>
                        <td className="p-4 text-gray-400">{b.subSpecializationName}</td>
                        <td className="p-4 text-gray-400">{new Date(b.date).toLocaleDateString()} - {b.slotStart.slice(0,5)}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleAccept(b.id)}
                              disabled={actionLoading === b.id}
                              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm transition disabled:opacity-50">
                              {actionLoading === b.id ? "..." : "موافقة"}
                            </button>
                            <button 
                              onClick={() => handleReject(b.id)}
                              disabled={actionLoading === b.id}
                              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm transition disabled:opacity-50">
                              رفض
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden p-3 space-y-3">
                {pendingBookings.map((b) => (
                  <div key={b.id} className={`p-4 rounded-xl border ${!dark ? "bg-gray-50 border-gray-200" : "bg-[#131c2f] border-gray-800"}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-sm">{b.customerName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{b.carInfo} · {b.subSpecializationName}</p>
                      </div>
                      <p className="text-xs text-gray-400 text-left">{new Date(b.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAccept(b.id)}
                        disabled={actionLoading === b.id}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50">
                        موافقة
                      </button>
                      <button 
                        onClick={() => handleReject(b.id)}
                        disabled={actionLoading === b.id}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50">
                        رفض
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* APPOINTMENTS & REVIEWS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

          {/* المواعيد */}
          <div className={cardBase}>
            <div className={`p-4 sm:p-6 border-b ${!dark ? "border-gray-200" : "border-gray-700"}`}>
              <h2 className="text-lg sm:text-xl font-bold">مواعيد اليوم</h2>
            </div>
            <div className="p-3 sm:p-6 space-y-3">
              {loadingToday ? (
                 <div className="text-center py-6 text-gray-400">جاري التحميل...</div>
              ) : todayAppointments.length === 0 ? (
                 <div className="text-center py-6 text-gray-400">لا توجد مواعيد لليوم</div>
              ) : (
                todayAppointments.map((apt) => (
                  <div key={apt.id} className={`p-3 sm:p-4 rounded-xl border ${
                    !dark ? "bg-gray-50 border-gray-200" : "bg-[#131c2f] border-gray-800"
                  }`}>
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm">{apt.customerName}</h4>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{apt.subSpecializationName}</p>
                      </div>
                      <span className="text-blue-400 font-semibold text-xs sm:text-sm flex-shrink-0">
                        {apt.slotStart.slice(0, 5)} - {apt.slotEnd.slice(0, 5)}
                      </span>
                    </div>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(apt.status)}`}>
                      {getStatusText(apt.status)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* المراجعات (Dynamic) */}
          <div className={cardBase}>
            <div className={`p-4 sm:p-6 border-b ${!dark ? "border-gray-200" : "border-gray-700"}`}>
              <h2 className="text-lg sm:text-xl font-bold">المراجعات الأخيرة</h2>
            </div>
            <div className="p-3 sm:p-6 space-y-3">
              {loadingReviews ? (
                <div className="text-center py-6 text-gray-400">جاري تحميل المراجعات...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-6 text-gray-400">لا توجد مراجعات حتى الآن</div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className={`p-3 sm:p-4 rounded-xl border ${
                    !dark ? "bg-gray-50 border-gray-200" : "bg-[#131c2f] border-gray-800"
                  }`}>
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <h4 className="font-semibold text-sm">{review.clientName}</h4>
                      <div className="flex gap-0.5 flex-shrink-0">
                        {[...Array(review.rating)].map((_, i) => (
                          <FaStar key={i} className="text-yellow-500 text-xs sm:text-sm" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400 mb-2 line-clamp-2">{review.comment}</p>
                    {/* ملاحظة: هنا نستعرض التاريخ كما جاء من الـ API أو نقوم بتنسيقه */}
                    <span className="text-xs text-gray-500">
                        {review.date ? new Date(review.date).toLocaleDateString('ar-EG') : ""}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default MachineDashboard;