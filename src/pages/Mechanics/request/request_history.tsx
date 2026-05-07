
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Star } from "lucide-react";

// استيراد المكونات كما هي في كودك
import MachineSidebar from "../../../components/Machine/MachineSidebar";
import NotificationBell from "../../../components/NotificationBell/notification_bell";
import ThemeToggle from "../../../components/ThemeToggle/theme_toggle";
import { useTheme } from "../../../contexts/ThemeContext";

// تعريف أنواع البيانات بناءً على الـ JSON
type RequestItem = {
  requestId: string;
  status: string;
  requestType: string;
  serviceType: string;
  issueDescription: string;
  createdAt: string;
  car: {
    brand: string;
    model: string;
    plateNumber: string;
  };
  customer: {
    firstName: string;
    lastName: string;
    profilePhotoUrl?: string;
  };
  price?: number;
  rating?: {
    stars: number;
    comment: string;
  };
};

const Mrequest_history = () => {
  const { dark } = useTheme();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const navigate = useNavigate();

  // خريطة الحالات العربية
  const statusMap: Record<string, string> = {
    Submitted: "تم الإرسال",
    Dispatching: "جاري التوزيع",
    Accepted: "تم القبول",
    OnTheWay: "في الطريق",
    Arrived: "وصل",
    InProgress: "قيد التنفيذ",
    Completed: "مكتمل",
    Cancelled: "ملغي",
  };

  // خريطة الحالات الألوان
  const statusColorMap: Record<string, string> = {
    Submitted: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    Dispatching: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Accepted: "bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100",
    OnTheWay: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    Arrived: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    InProgress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  // خريطة أنواع الخدمة
  const serviceTypeMap: Record<string, string> = {
    Tires: "إطارات",
    Battery: "بطارية",
    Engine: "محرك",
    Maintenance: "صيانة",
    OilChange: "تغيير زيت",
    Electrical: "كهرباء",
  };

  // جلب البيانات
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = sessionStorage.getItem("userToken");
        
        if (!token) return;

        const res = await axios.get(
          "https://gearupapp.runasp.net/api/mechanic/requests",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRequests(res.data.requests || []);
      } catch (error) {
        console.error("Error fetching requests:", error);
        toast.error("فشل تحميل الطلبات");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = requests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  // دالة مساعدة لعرض النجوم
  const StarRatingDisplay = ({ stars }: { stars: number }) => {
    return (
      <div className="flex items-center gap-1 text-yellow-500">
        {[1, 2, 3, 4, 5].map((starValue) => (
          <Star
            key={starValue}
            size={14}
            fill={starValue <= Math.round(stars) ? "currentColor" : "none"}
            className={
              starValue <= Math.round(stars)
                ? "text-yellow-500"
                : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      <MachineSidebar />

      <div
        className={`flex-1 p-4 md:p-6 transition-colors ${
          dark ? "bg-[#0F172A] text-white" : "bg-gray-50 text-black"
        }`}
      >
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-12 md:mt-0 mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">طلبات الصيانة</h1>
            <p
              className={`text-sm mt-1 ${
                dark ? "text-gray-300" : "text-gray-500"
              }`}
            >
              عرض طلبات الصيانة والتقييمات
            </p>
          </div>

          <div className="flex gap-3">
            <ThemeToggle />
            <NotificationBell />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
              {/* تم إزالة whitespace-nowrap من هنا ليسمح للنصوص بالنزول لسطر جديد */}
              <table className="w-full text-right">
                {/* HEADER */}
                <thead
                  className={`${
                    dark ? "bg-[#1E293B] text-gray-200" : "bg-gray-100 text-gray-700"
                  } text-[10px] md:text-sm`}
                >
                  <tr>
                    <th className="p-2 md:p-4 font-semibold">المشكلة</th>
                    <th className="p-2 md:p-4 font-semibold">العميل</th>
                    <th className="p-2 md:p-4 font-semibold">السيارة</th>
                    <th className="p-2 md:p-4 font-semibold">الخدمة</th>
                    <th className="p-2 md:p-4 font-semibold">الحالة</th>
                    <th className="p-2 md:p-4 font-semibold">التقييم</th>
                    <th className="p-2 md:p-4 font-semibold">السعر</th>
                  </tr>
                </thead>

                {/* BODY */}
                <tbody
                  className={`divide-y ${
                    dark ? "divide-gray-700" : "divide-gray-200"
                  }`}
                >
                  {currentRequests.length > 0 ? (
                    currentRequests.map((req) => (
                      <tr
                        key={req.requestId}
                        onClick={() =>
                          navigate(`/mechanics/request/mrequest_tracking/${req.requestId}`)
                        }
                        className={`cursor-pointer transition ${
                          dark ? "hover:bg-[#1E293B]" : "hover:bg-gray-50"
                        }`}
                      >
                        {/* عمود المشكلة - تم التعديل هنا لجعل النص ينزل لتحت */}
                        <td
                          className={`p-2 md:p-4 text-[10px] md:text-sm break-words whitespace-normal max-w-[200px] md:max-w-[350px] ${
                            dark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          <div className="font-semibold mb-1 leading-relaxed">{req.issueDescription}</div>
                          <div
                            className={`text-[8px] md:text-[10px] opacity-70 ${
                              dark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                             {new Date(req.createdAt+ "Z").toLocaleString("en-GB")} 


                          </div>
                        </td>

                        {/* عمود العميل */}
                   
            <td className="p-2 md:p-4 relative group overflow-visible">
              <div className="flex items-center gap-1 md:gap-3">
                <img
                  src={req.customer.profilePhotoUrl || "/default-avatar.png"}
                  alt="customer"
                  className="w-6 h-6 md:w-9 md:h-9 rounded-full object-cover"
                />
                <div className="font-medium text-[10px] md:text-sm leading-tight">
                  {req.customer.firstName} {req.customer.lastName}
                </div>
              </div>

    {req.rating?.comment && (
  <div
    className="
      absolute bottom-full right-1/2 translate-x-1/2
      mb-1
      w-56 p-2 rounded-lg shadow-lg
      bg-white dark:bg-slate-700
      text-gray-800 dark:text-white
      text-xs text-center
      hidden group-hover:block
      z-[9999]
    "
  >
    {req.rating.comment}
  </div>
)}
    </td>

                        {/* عمود السيارة */}
                        <td className="p-2 md:p-4">
                          <div className="font-semibold text-[10px] md:text-sm leading-tight">
                            {req.car.brand} {req.car.model}
                          </div>
                          <div
                            className={`text-[9px] md:text-xs leading-tight ${
                              dark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {req.car.plateNumber}
                          </div>
                        </td>

                        {/* عمود الخدمة */}
                        <td className="p-2 md:p-4 text-[10px] md:text-sm whitespace-nowrap">
                          {serviceTypeMap[req.serviceType] || "—"}
                        </td>

                        {/* عمود الحالة */}
                        <td className="p-2 md:p-4 whitespace-nowrap">
                          <span
                            className={`px-1.5 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-xs font-medium block w-fit ${
                              statusColorMap[req.status] ||
                              "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {statusMap[req.status] || "—"}
                          </span>
                        </td>

                        {/* عمود التقييم */}
                        <td className="p-2 md:p-4 whitespace-nowrap">
                          {req.rating ? (
                            <div className="group relative">
                              <StarRatingDisplay stars={req.rating.stars} />
                              {req.rating.comment && (
                                <div
                                  className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-lg shadow-lg text-[10px] leading-tight z-10 hidden group-hover:block text-center border border-gray-200 dark:bg-slate-700 dark:text-white dark:border-gray-600 text-gray-800`}
                                >
                                  "{req.rating.comment}"
                                </div>
                              )}
                            </div>
                          ) : (
                            <span
                              className={`text-[10px] ${
                                dark ? "text-gray-600" : "text-gray-400"
                              }`}
                            >
                              غير مقيم
                            </span>
                          )}
                        </td>

                        {/* عمود السعر */}
                        <td className="p-2 md:p-4 whitespace-nowrap">
                          {req.price !== null && req.price !== undefined ? (
                            <span className="text-green-600 dark:text-green-400 font-semibold">
                              {req.price.toLocaleString()} ج.م
                            </span>
                          ) : (
                            <span
                              className={`text-[10px] ${
                                dark ? "text-gray-600" : "text-gray-400"
                              }`}
                            >
                              غير محدد
                            </span>
                          )}
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className={`h-[50vh] md:h-[70vh] text-center text-gray-500 ${
                          dark ? "bg-[#0F172A]" : "bg-white"
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center h-full gap-2">
                          <p className="text-lg">لا توجد طلبات حتى الآن</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {requests.length > itemsPerPage && (
              <div className="flex justify-center items-center gap-3 text-gray-700 dark:text-gray-200 mt-6">
                <button
                  className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  السابق
                </button>

                <span>
                  {currentPage} / {totalPages || 1}
                </span>

                <button
                  className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages || 1))}
                  disabled={currentPage === totalPages}
                >
                  التالي
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mrequest_history;