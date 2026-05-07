
import Sidebar from "../../../components/Customer/customer_sidebar";
import Header from "../../../components/Customer/customer_header";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCar } from "react-icons/fa"; // استيراد الأيقونة
import { BsChevronDown } from "react-icons/bs"; // استيراد سهم القائمة

// تحديث الـ Type ليشمل id السيارة (لضمان دقة الفلترة)
type ServiceRequest = {
  requestId: string;
  issueDescription: string;
  createdAt: string;
  status: string;
  serviceType: string;
  price?: number;
  rating?: {
    stars: number;
    comment?: string;
    createdAt?: string;
  } | null;
  car?: {
    id?: string; // أضفنا ID للسيارة هنا
    brand?: string;
    model?: string;
  };
  assignedMechanic?: {
    mechanicUserId?: string;
    firstName?: string;
    lastName?: string;
    profilePhotoUrl?: string;
    phoneNumber?: string;
  };
};

const ServiceHistory = () => {
  const [historyData, setHistoryData] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // State للسيارات والسيارة المختارة
  const [cars, setCars] = useState<any[]>([]);
  const [selectedCar, setSelectedCar] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = sessionStorage.getItem("userToken");

  const statusMap = {
    Submitted: "تم الإرسال",
    Dispatching: "جاري التوزيع",
    Accepted: "تم القبول",
    OnTheWay: "في الطريق",
    Arrived: "وصل",
    InProgress: "قيد التنفيذ",
    Completed: "مكتمل",
    Cancelled: "ملغي",
  };

  const statusColorMap = {
    Submitted: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    Dispatching: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Accepted: "bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100",
    OnTheWay: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    Arrived: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    InProgress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const allowedStatuses = [
    "Accepted",
    "OnTheWay",
    "Arrived",
    "InProgress",
    "Completed",
  ];

  // --- منطق الفلترة المحدث ---
  const filteredHistory = historyData.filter((item) => {
    const statusMatch = allowedStatuses.includes(item.status);

    // إيجاد كائن السيارة المطابق للاسم المختار
    const activeCar = cars.find((c) => `${c.year} ${c.brand} ${c.model}`.trim() === selectedCar.trim());
    
    // إذا لم يتم اختيار سيارة بعد (أثناء التحميل)، نعرض النتائج بناءً على الحالة فقط أو ننتظر
    if (!activeCar) return statusMatch;

    // محاولة المطابقة عبر الـ ID أولاً (الأدق)
    // أو عبر الماركة والموديل كخيار بديل إذا لم يكن الـ ID موجوداً في البيانات القادمة
    const carMatch = item.car?.id 
      ? item.car.id === activeCar.id 
      : (item.car?.brand && item.car?.model && 
         `${item.car.brand} ${item.car.model}` === `${activeCar.brand} ${activeCar.model}`);

    return statusMatch && carMatch;
  });

  const serviceTypeMap = {
    Diagnosis: "تشخيص",
    Tires: "إطارات",
    BodyRepair: "إصلاح هيكل",
    OilChange: "تغيير زيت",
  };

  const navigate = useNavigate();

  // --- جلب بيانات السيارات ---
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await axios.get("https://gearupapp.runasp.net/api/customers/cars", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const carsData = Array.isArray(res.data) ? res.data : (res.data.cars || []);
        setCars(carsData);

        // تعيين السيارة الافتراضية (أول سيارة أو المحفوظة في الذاكرة)
        if (carsData.length > 0) {
          const savedCar = localStorage.getItem("selectedCar");
          if (savedCar && carsData.some((c: any) => `${c.year} ${c.brand} ${c.model}` === savedCar)) {
            setSelectedCar(savedCar);
          } else {
            const firstCarString = `${carsData[0].year} ${carsData[0].brand} ${carsData[0].model}`;
            setSelectedCar(firstCarString);
          }
        }
      } catch (error) {
        console.error("فشل جلب السيارات", error);
      }
    };
    
    if (token) fetchCars();
  }, [token]);

  // --- جلب سجل الطلبات ---
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          "https://gearupapp.runasp.net/api/requests/history",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setHistoryData(res.data?.requests || []);
        setCurrentPage(1);
      } catch {
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchHistory();
  }, [token]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  // const renderStars = (ratingStars?: number) => {
  //   if (ratingStars === null || ratingStars === undefined) {
  //     return <span className="text-gray-400">-</span>;
  //   }
  //   return (
  //     <div className="flex text-yellow-400 gap-0.5 text-sm">
  //       {[...Array(5)].map((_, i) => (
  //         <span key={i}>{i < ratingStars ? "★" : "☆"}</span>
  //       ))}
  //       <span className="text-gray-600 dark:text-gray-300 text-xs mr-1">({ratingStars})</span>
  //     </div>
  //   );
  // };

  return (
    <div className="flex min-h-screen bg-white dark:bg-primary_BGD" dir="rtl">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-white dark:bg-primary_BGD">
          {/* Title Section & Car Selector */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-right w-full md:w-auto">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                عرض طلبات الصيانة
              </h2>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                متابعة جميع طلبات الصيانة الخاصة بسيارتك
              </p>
            </div>
            
            {/* Car Filter Component */}
            {cars.length > 0 && (
              <div className="relative group w-full md:w-64">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                  <FaCar size={14} />
                </div>
                <select 
                  value={selectedCar} 
                  onChange={(e) => { 
                    setSelectedCar(e.target.value); 
                    localStorage.setItem("selectedCar", e.target.value); 
                  }} 
                  className="w-full appearance-none bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-sm py-2.5 pr-9 pl-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all shadow-sm"
                >
                  {cars.map((car, idx) => (
                    <option key={idx} value={`${car.year} ${car.brand} ${car.model}`}>
                      {car.year} {car.brand} {car.model}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <BsChevronDown size={10} />
                </div>
              </div>
            )}
          </div>

          {/* TABLE CARD */}
          <div className="rounded-xl overflow-hidden shadow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            {loading ? (
              <div className="flex items-center justify-center p-12 min-h-[300px]">
                <span className="text-gray-500 dark:text-gray-300 text-lg">جاري التحميل...</span>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 md:p-12 min-h-[400px] text-center space-y-4">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                    <svg 
                        className="w-12 h-12 text-gray-400 dark:text-gray-500" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01M9 16h.01"></path>
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  لا يوجد طلبات صيانة
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  لم تقم بإرسال أي طلبات صيانة حالياً. عند إرسال طلب، ستظهر تفاصيله وسجله هنا.
                </p>
                <button 
                  onClick={() => navigate('/customer/maintenancerequest')} 
                  className="mt-4 px-6 py-2 bg-[#137FEC] hover:bg-blue-600 text-white rounded-lg transition duration-200 shadow-sm"
                >
                  طلب صيانة
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="bg-[#137FEC1A] dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                      <th className="p-3"> المشكلة </th>
                      <th className="p-3">السيارة</th>
                      <th className="p-3">الخدمة</th>
                      <th className="p-3">الحالة</th>
                      <th className="p-3">الميكانيكي</th>
                      <th className="p-3">التقييم</th>
                      <th className="p-3">السعر</th>
                    </tr>
                  </thead>

                  <tbody className="text-gray-700 dark:text-gray-200">
                    {currentItems.map((row) => (
                      <tr
                        key={row.requestId}
                        onClick={() =>
                          navigate(
                            `/customer/maintenance_request/request_tracking/${row.requestId}`
                          )
                        }
                        className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                      >
                        <td className="p-3 align-top">
                          <div className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                            {row.issueDescription}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                             {row.createdAt
                              ? new Date(row.createdAt).toLocaleDateString("ar-EG")
                              : "-"}
                          </div>
                        </td>

                        <td className="p-3">
                          {row.car?.brand} {row.car?.model}
                        </td>

                        <td className="p-3">
                          {serviceTypeMap[row.serviceType as keyof typeof serviceTypeMap] ||
                            "—"}
                        </td>

                        <td className="p-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              statusColorMap[
                                row.status as keyof typeof statusColorMap
                              ] ||
                              "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {statusMap[row.status as keyof typeof statusMap] || "—"}
                          </span>
                        </td>

                        <td className="p-3 flex items-center gap-2">
                          <img
                            src={
                              row.assignedMechanic?.profilePhotoUrl ||
                              "https://via.placeholder.com/32" 
                            }
                            className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                            alt="mechanic"
                          />
                          <span>
                            {row.assignedMechanic?.firstName}{" "}
                            {row.assignedMechanic?.lastName}
                          </span>
                        </td>

                        {/* <td className="p-3">
                         
                            {row.rating ? renderStars(row.rating.stars) : <span className="text-gray-400">-</span>}
                        </td> */}
                        <td className="p-3">
  {row.rating ? (
    <div className="relative group inline-block">
      
      {/* Stars */}
      <div className="flex text-yellow-400 gap-0.5 text-sm cursor-pointer">
        {[...Array(5)].map((_, i) => (
          <span key={i}>{i < row.rating!.stars ? "★" : "☆"}</span>
        ))}
      </div>

      {/* Tooltip */}
      {row.rating.comment && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                        hidden group-hover:block 
                        bg-black text-white text-xs px-2 py-1 rounded-md 
                        whitespace-nowrap z-50">
          {row.rating.comment}
        </div>
      )}

    </div>
  ) : (
    <span className="text-gray-400">-</span>
  )}
</td>

                        <td className="p-3 font-bold text-gray-800 dark:text-white">
                          {row.price !== null && row.price !== undefined ? (
                            <span className="text-green-600 dark:text-green-400">
                              {row.price.toLocaleString()} ج.م
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PAGINATION */}
          {filteredHistory.length > itemsPerPage && (
            <div className="flex justify-center items-center gap-3 text-gray-700 dark:text-gray-200">
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages || 1))
                }
                disabled={currentPage === totalPages}
              >
                التالي
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ServiceHistory;