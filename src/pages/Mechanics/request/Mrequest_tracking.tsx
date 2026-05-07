
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import MachineSidebar from "../../../components/Machine/MachineSidebar";
import NotificationBell from "../../../components/NotificationBell/notification_bell";
import ThemeToggle from "../../../components/ThemeToggle/theme_toggle";
import { useTheme } from "../../../contexts/ThemeContext";
// تم إضافة Wrench للاستخدام كبديل للإيموجي
import { Car, ClipboardCheck, ClipboardList, AlertTriangle, Settings, Wrench } from "lucide-react";


     const statusOptions = [
         { value: "Accepted", label: "تم القبول" },
         { value: "OnTheWay", label: "في الطريق" },
         { value: "Arrived", label: "وصل" },
         { value: "InProgress", label: "قيد الإصلاح" },
         { value: "Completed", label: "تم الانتهاء" },
         { value: "Cancelled", label: "تم الإلغاء" }
       ];

       const statusMap: any = {
        Accepted: 3,
        OnTheWay: 4,
        Arrived: 5,
        InProgress: 6,
        Completed: 7,
        Cancelled: 8
      };

      const statusOrder = [
        "Accepted",
        "OnTheWay",
        "Arrived",
        "InProgress",
        "Completed",
        // "Cancelled",
      ];
     
      const serviceTypeMap: any = {
        Diagnosis: "تشخيص",
        Tires: "إطارات",
        BodyRepair: "إصلاح هيكل",
        OilChange: "تغيير زيت",
      };

      const requestTypeMap: any = {
        Emergency: "طارئ",
        Scheduled: "مجدول",
      };

      const serviceModeMap: any = {
        MechanicComesToCustomer: "الميكانيكي يذهب للعميل",
        CustomerGoesToMechanic: "العميل يأتي للميكانيكي",
      };


const MRequestTracking = () => {
  const { requestId } = useParams();
  console.log("requestId:", requestId);

  const { dark } = useTheme();

  const [request, setRequest] = useState<any>(null);
const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const token = sessionStorage.getItem("userToken");
  const [openImg, setOpenImg] = useState(false);
const [selectedImg, setSelectedImg] = useState<string | null>(null);

const fetchRequest = async () => {
    try {
      const resStatus = await axios.get(
        `https://gearupapp.runasp.net/api/mechanic/requests/${requestId}/status`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      console.log("DATA:", resStatus.data);
  
      setRequest(resStatus.data);   
      setStatus(resStatus.data.status);
  
    } catch (err: any) {
      console.error("ERROR:", err.response?.data);
      toast.error("فشل تحميل بيانات الطلب");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (requestId) fetchRequest();
  }, [requestId]);


const updateStatus = async (newStatus: string) => {
    try {
      await axios.put(
        `https://gearupapp.runasp.net/api/mechanic/requests/${requestId}/status`,
        { newStatus: statusMap[newStatus] }, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      toast.success("تم تحديث الحالة");
  
      setStatus(newStatus);
  
      fetchRequest();
  
    } catch (err: any) {
      console.error("UPDATE ERROR:", err.response?.data);
      toast.error("فشل تحديث الحالة");
    }
  };


    const getStatusLabel = (value: string | null) => {
    const found = statusOptions.find(s => s.value === value);
    return found ? found.label : "غير معروف";
  };

  if (loading) return <p className="p-10 text-center">جاري التحميل...</p>;

  return (
    <div
      dir="rtl"
      className={`flex min-h-screen transition-colors duration-500 ${
        !dark ? "bg-gray-50 text-[#1E3A5F]" : "bg-[#0B1220] text-white"
      }`}
    >
      {/* Sidebar */}
      <MachineSidebar />

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-3 sm:p-5 md:p-8 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between mt-14 lg:mt-0">
          <h1 className="text-2xl md:text-3xl font-bold">
            حالة الطلب
          </h1>

          <div className="flex items-center gap-3">
            <NotificationBell size={28} />
            <ThemeToggle />
          </div>
        </div>

       
        <div
  className={`w-full max-w-4xl mx-auto p-4 rounded-xl shadow ${
    !dark ? "bg-white" : "bg-[#0d1629]"
  }`}
>

              {request && (
  <>

    <div className="flex items-center gap-3">
  {request.car?.carPhotoUrl && (
    <img
      src={request.car.carPhotoUrl}
      className="w-20 h-20 rounded-lg object-cover"
      alt="car"
    />
  )}

  <div>
    <p className="flex flex-wrap items-center gap-2">
      <strong>السيارة:</strong>
      <span>
        {request.car?.brand} {request.car?.model} - {request.car?.year} - {request.car?.plateNumber}
      </span>
    </p>
  </div>
</div>

    <hr className="my-3" />

    {/* 🧑 customer */}
    <div className="flex items-center gap-3">
      <img
        src={request.customer?.profilePhotoUrl}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div>
        <p><strong>👤 العميل:</strong> {request.customer?.firstName} {request.customer?.lastName}</p>
        <p>📞 {request.customer?.phoneNumber}</p>
      </div>
    </div>

    <hr className="my-3" />

   
    <p>
  <ClipboardList className="w-4 h-4 text-sky-500 inline-block ml-1" />
  <strong>المشكلة:</strong> {request.issueDescription}
</p>

    {request.problemPhotoUrl && (
  <img
    src={request.problemPhotoUrl}
    onClick={() => {
      setSelectedImg(request.problemPhotoUrl);
      setOpenImg(true);
    }}
    className="w-full h-64 object-cover rounded-lg mt-2 cursor-pointer hover:opacity-90 transition"
  />
)}
{openImg && selectedImg && (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    onClick={() => setOpenImg(false)}
  >
    <img
      src={selectedImg}
      className="max-w-[95%] max-h-[95%] object-contain rounded-lg"
    />
  </div>
)}

    <hr className="my-3" />

    {/* 📌 request info */}
<p>
  <AlertTriangle className="w-4 h-4 text-sky-500 inline-block ml-1" />
  <strong> نوع الطلب:</strong>{" "}
  {requestTypeMap[request.requestType] || request.requestType}
</p>

<p>
  <Settings className="w-4 h-4 text-sky-500 inline-block ml-1" />
  <strong> طريقة تلقي الخدمة:</strong>{" "}
  {serviceModeMap[request?.serviceMode] || request?.serviceMode}
</p>
 
{request?.serviceType && (
  <p>
    <Wrench className="w-4 h-4 text-sky-500 inline-block ml-1" />
    <strong>الخدمة:</strong>{" "}
    {serviceTypeMap[request.serviceType] || request.serviceType}
  </p>
)}
            </>
          )}

      
          <p>
          <ClipboardCheck className="w-4 h-4 text-sky-500 inline-block ml-1" />
  <strong> حالة الطلب:</strong>{" "}
{getStatusLabel(status)}
</p>

        </div>

<h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
<Car className="w-5 h-5 drive-animation" />
  تحديث حالة الطلب
</h2>


<div className="flex items-center justify-between mt-6">
  {statusOrder.map((step, index) => {
    const currentIndex = statusOrder.indexOf(status || "");
    const isCompleted = index < currentIndex;
    const isActive = index === currentIndex;

    return (
      <div key={step} className="flex-1 flex flex-col items-center relative">

        {/* الخط */}
        {index !== statusOrder.length - 1 && (
          <div
            className={`absolute top-4 right-1/2 w-full h-1 z-0 ${
              index < currentIndex ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        )}

        {/* الدائرة */}
        <button
          onClick={() => updateStatus(step)}
          className={`z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
            ${
              isCompleted
                ? "bg-green-500 text-white"
                : isActive
                ? "bg-blue-500 text-white"
                : "bg-gray-300 text-black"
            }`}
        >
          {index + 1}
        </button>

        {/* اللابل */}
        <span className="text-xs mt-2 text-center">
          {statusOptions.find(s => s.value === step)?.label}
        </span>
      </div>
    );
  })}
</div>


      </main>
    </div>
  );
};

export default MRequestTracking;
