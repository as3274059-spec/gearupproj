import { useState, useEffect } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import MachineSidebar from "../../../components/Machine/MachineSidebar";
import NotificationBell from "../../../components/NotificationBell/notification_bell";
import ThemeToggle from "../../../components/ThemeToggle/theme_toggle";
import { FaStar } from "react-icons/fa";

// تعريف الـ Types بناءً على الرد الفعلي للـ API
interface Review {
  id: number;
  userName: string; // من الـ API
  rating: number;
  comment: string;
  createdAt: string; // من الـ API
}

const Reviewing = () => {
  const { dark } = useTheme();
  const token = sessionStorage.getItem("userToken");

  // State for Data
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number | string>("--");
  
  // Loading States
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingRating, setLoadingRating] = useState(true);

const getMechanicId = () => {
  if (!token) {
    console.error("❌ No token found!");
    return null;
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log("🔍 JWT Payload كامل:", payload); // ← شوف الـ console
    return payload.sub ?? payload.id ?? payload.userId ?? payload.mechanicId;
  } catch {
    console.error("❌ Token parse failed!");
    return null;
  }
};

  const mechanicId = getMechanicId();

  // --- Fetch Average Rating ---
  const fetchAverageRating = async () => {
    try {
      setLoadingRating(true);
      const res = await fetch(`https://gearupapp.runasp.net/api/mechanics/mechanic/${mechanicId}/average-rating`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch rating");
      const data = await res.json();
      
      // استخراج القيمة مع التعامل مع احتمالات مختلفة (تم تأكيد avgRating من الـ Console)
      let ratingValue = "0";
      if (typeof data === 'number') {
        ratingValue = String(data);
      } else if (typeof data === 'object' && data !== null) {
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
useEffect(() => {
  if (!mechanicId) {
    console.error("❌ mechanicId = null, مش هيبعت request!");
    setLoadingReviews(false);
    setLoadingRating(false);
    return;
  }
  console.log("✅ mechanicId:", mechanicId); // ← شوف القيمة
  fetchAverageRating();
  fetchReviews();
}, []);
  // --- Fetch Reviews (Count = 100) ---
 const fetchReviews = async () => {
  try {
    setLoadingReviews(true);
    const res = await fetch(
      `https://gearupapp.runasp.net/api/mechanics/mechanic/${mechanicId}/latest?count=50`, // ← غيّر 100 لـ 10
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error("Failed to fetch reviews");
    const data = await res.json();
    setReviews(Array.isArray(data) ? data : data.reviews || []);
  } catch (err) {
    console.error(err);
    setReviews([]);
  } finally {
    setLoadingReviews(false);
  }
};

  useEffect(() => {
    fetchAverageRating();
    fetchReviews();
  }, []);

  // حساب نسب النجوم ديناميكياً للأعمدة الجانبية
  const getStarPercentages = () => {
    const total = reviews.length;
    if (total === 0) return [0, 0, 0, 0, 0];
    
    const counts = [5, 4, 3, 2, 1].map(star => 
      reviews.filter(r => r.rating === star).length
    );
    
    return counts.map(count => Math.round((count / total) * 100));
  };

  const starPercents = getStarPercentages();

  return (
    <div
      dir="rtl"
      className={`flex min-h-screen transition-colors duration-500
        ${dark ? "bg-[#0B1220] text-white" : "bg-gray-50 text-[#1E3A5F]"}
      `}
    >
      <MachineSidebar />

      <div className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-14 lg:mt-0">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">المراجعات</h1>
          <div className="flex items-center gap-3 self-end sm:self-auto bg-gray-50 dark:bg-white/5 p-2 rounded-2xl sm:bg-transparent sm:dark:bg-transparent">
            <NotificationBell size={25} />
            <ThemeToggle />
          </div>
        </div>

        {/* Title */}
        <div
          className={`rounded-xl px-4 md:px-6 py-4 md:py-5
            ${dark ? "bg-[#0d1629]" : "bg-white shadow border"}
          `}
        >
          <h2 className="text-lg font-bold">التقييمات والمراجعات</h2>
          <p className="text-sm text-gray-400">
            عرض تقييمات العملاء وتحليل الأداء
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Reviews List (Left Col - Wider) */}
          <div
            className={`lg:col-span-2 rounded-xl p-4 md:p-6
              ${dark ? "bg-[#0d1629]" : "bg-white shadow border"}
            `}
          >
            <h3 className="font-bold mb-4">
              جميع المراجعات {!loadingReviews && `(${reviews.length})`}
            </h3>

            {loadingReviews ? (
              <div className="text-center py-10 text-gray-400">جاري تحميل المراجعات...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-10 text-gray-400">لا توجد مراجعات حالياً</div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className={`p-4 rounded-xl border
                      ${
                        dark
                          ? "border-gray-800 bg-[#0f1a2f]"
                          : "border-gray-200 bg-gray-50"
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        {/* Avatar افتراضي لأن الـ API لا يعيد الصورة */}
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                                ${dark ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"}
                            `}
                        >
                            {review.userName ? review.userName.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-sm md:text-base">{review.userName}</p>
                          <span className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString("ar-EG")}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1 text-yellow-400">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <FaStar key={i} size={14} />
                        ))}
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-gray-300 md:text-gray-600">
                      {review.comment}
                    </p>

                    {/* تمت إزالة زر الرد والردود بالكامل كما طلبت */}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side (Stats) */}
          <div className="space-y-4 md:space-y-6">
            {/* Rating Summary */}
            <div
              className={`rounded-xl p-4 md:p-6 h-fit
                ${dark ? "bg-[#0d1629]" : "bg-white shadow border"}
              `}
            >
              <h3 className="font-bold mb-4">التقييم العام</h3>

              <div className="text-center mb-6">
                <p className="text-3xl md:text-4xl font-bold">
                  {loadingRating ? "..." : averageRating}
                </p>
                <div className="flex justify-center gap-1 text-yellow-400 my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar 
                        key={star} 
                        size={18}
                        className={(averageRating !== "0" && star <= Math.round(Number(averageRating))) ? "text-yellow-400" : "text-gray-600"}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-400">
                  بناءً على {reviews.length} مراجعة
                </p>
              </div>

              {[5, 4, 3, 2, 1].map((star, index) => (
                <div key={star} className="flex items-center gap-3 mb-3 text-sm">
                  <span className="w-4">{star}</span>
                  <FaStar className="text-yellow-400" size={14} />
                  <div
                    className={`flex-1 h-2 rounded overflow-hidden
                      ${dark ? "bg-gray-800" : "bg-gray-200"}
                    `}
                  >
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{
                        width: `${starPercents[index]}%`,
                      }}
                    />
                  </div>
                  <span className="w-10 text-xs text-gray-400">
                    {starPercents[index]}%
                  </span>
                </div>
              ))}
            </div>

            {/* Filters (Placeholder Only - Logic Removed) */}
            <div
              className={`rounded-xl p-4 md:p-6 space-y-4 md:space-y-6
                ${dark ? "bg-[#0d1629]" : "bg-white shadow border"}
              `}
            >
              <div>
                <p className="text-sm font-semibold mb-2">
                  عرض المراجعات
                </p>
                <div
                  className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-not-allowed transition
                    ${dark ? "bg-[#134b8a]" : "bg-blue-600"}
                  `}
                >
                  <span className="text-sm text-white">أحدث 100 مراجعة</span>
                </div>
              </div>

              {/* يمكن إضافة فلاتر مستقبلية هنا */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviewing;