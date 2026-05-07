
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../../../components/Customer/customer_sidebar";
import Header from "../../../components/Customer/customer_header";
import { useTheme } from "../../../contexts/ThemeContext";
import {  Wrench,ClipboardCheck, Phone, ClipboardList,  AlertTriangle } from "lucide-react";

 const statusMap: any = {
   Accepted: "تم القبول",
   OnTheWay: "في الطريق",
   Arrived: "وصل",
   InProgress: "قيد الإصلاح",
   Completed: "تم الانتهاء",
   Cancelled: "تم الإلغاء"
 };
const statusOptions = [
  { value: "Accepted", label: "تم القبول" },
  { value: "OnTheWay", label: "في الطريق" },
  { value: "Arrived", label: "وصل" },
  { value: "InProgress", label: "قيد الإصلاح" },
  { value: "Completed", label: "تم الانتهاء" },
  { value: "Cancelled", label: "تم الإلغاء" }
];

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

const RequestTracking = () => {
  const { requestId } = useParams();

  const { dark } = useTheme();

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const token = sessionStorage.getItem("userToken");
  const currentIndex = statusOrder.indexOf(request?.status);
  const [openImg, setOpenImg] = useState(false);

  useEffect(() => {
    if (!requestId) return;
  
    let lastStatus: null = null;
  
    const load = async () => {
      try {
        const res = await axios.get(
          `https://gearupapp.runasp.net/api/requests/${requestId}/status`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
  
        const newData = res.data;
  
    
        if (newData.status !== lastStatus) {
          lastStatus = newData.status;
          setRequest(newData);
        }
      } catch  {
        toast.error("فشل تحميل بيانات الطلب");
      } finally {
        setLoading(false);
      }
    };
  
    load(); // أول مرة بس
  
    const interval = setInterval(load, 5000);
  
    return () => clearInterval(interval);
  }, [requestId]);


  if (loading && !request) {
    return <p className="p-10 text-center">جاري التحميل...</p>;
  }

  return (
  
    <div className={`flex min-h-screen ${dark ? "bg-primary_BGD text-white" : "bg-[#F8FAFC] text-slate-800"}`}>

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Header />

        <div className="p-6">
    
 
<div className="w-full text-right mb-4 pr-6">
  <h1 className="text-xl font-bold">
    تتبع حالة الطلب
  </h1>
</div>

<div className="w-full max-w-3xl mx-auto text-right">
  <div className="bg-white dark:bg-gray-800 shadow p-4 rounded-xl space-y-2 text-gray-900 dark:text-gray-100">



{/* 🚗 CAR CARD */}
{/* <div className="flex gap-3 items-center"> */}
<div className="flex gap-4 items-center border-b pb-4">

  {request?.car?.carPhotoUrl && (
    <img
      src={request.car.carPhotoUrl}
      alt="car"
      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
    />
  )}

  <div className="flex-1">
    <p className="font-bold">
      {/* <Car className="w-4 h-4 inline-block mr-1 text-blue-500" /> */}

{request?.car?.brand} {request?.car?.model}

<span className="text-sm font-normal opacity-70">
  ({request?.car?.year}) - {request?.car?.plateNumber}
</span>
    </p>
  </div>

</div>


{request?.serviceType && (
  <p>
    
    <Wrench className="w-4 h-4 inline-block mr-1" />
    {serviceTypeMap[request.serviceType] || request.serviceType}
  </p>
)}

{/* 📌 نوع الطلب */}

<p className="flex items-center gap-2">
  {/* <AlertTriangle className="w-4 h-4 text-red-500" /> */}
  <AlertTriangle className="w-4 h-4 text-sky-500" />
  <strong>نوع الطلب:</strong>{" "}
  {request?.requestType === "Emergency" ? "طارئ" : "مجدول"}
</p>



<p className="flex items-center gap-2">
  <Wrench className="w-4 h-4 text-sky-500" />
  <strong>نوع الخدمة:</strong>{" "}
  {request?.serviceMode === "MechanicComesToCustomer"
    ? "ميكانيكي متنقل"
    : request?.serviceMode === "CustomerGoesToMechanic"
    ? "الذهاب إلى الورشة"
    : "غير محدد"}
</p>

<p className="flex items-start gap-2">
  <ClipboardList className="w-4 h-4 text-sky-500 mt-1" />
  <strong>المشكلة:</strong> {request?.issueDescription}
</p>


{/* 🖼️ صورة المشكلة */}
{request?.problemPhotoUrl && (
  <img
    src={request.problemPhotoUrl}
    className="w-full h-40 object-cover rounded-lg mt-2 cursor-pointer"
    onClick={() => {
      console.log("IMAGE CLICKED");
      setOpenImg(true);
    }}
  />
)}

{/* Modal */}
{openImg && request?.problemPhotoUrl && (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]"
    onClick={() => setOpenImg(false)}
  >
    <img
      src={request.problemPhotoUrl}
      className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
)}

{/* 📌 الحالة */}
<p className="flex items-center gap-2 text-sky-500 font-medium">
  <ClipboardCheck className="w-4 h-4 text-sky-500" />
  <strong className="text-sky-500">الحالة:</strong>{" "}
  <span className="text-sky-500">
    {statusMap[request?.status] || request?.status}
  </span>
</p>

<div className="flex items-center justify-between mt-6">
  {statusOrder.map((step, index) => {
    const isCompleted = index < currentIndex;
    const isActive = index === currentIndex;

    return (
      <div key={step} className="flex-1 flex flex-col items-center relative">

        {/* line */}
        {index !== statusOrder.length - 1 && (
          <div
            className={`absolute top-4 right-1/2 w-full h-1 z-0 ${
              index < currentIndex ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        )}

        {/* circle */}
        <div
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
        </div>

        {/* label */}
        <span className="text-xs mt-2 text-center">
          {statusOptions.find(s => s.value === step)?.label}
        </span>
      </div>
    );
  })}
</div>

{/* 🔧 الميكانيكي */}
{request?.mechanic && (
  <div className="flex items-center gap-3 pt-3 border-t">

    <img
      src={request.mechanic.profilePhotoUrl}
      className="w-12 h-12 rounded-full object-cover"
    />

    <div>
      <p className="font-bold flex items-center gap-1">
        <Wrench className="w-4 h-4" />
        الميكانيكي:
        <span className="mr-1">
          {request.mechanic.firstName} {request.mechanic.lastName}
        </span>
      </p>

      <p className="text-sm opacity-70 flex items-center gap-1">
        <Phone className="w-4 h-4" />
        {request.mechanic.phoneNumber}
      </p>
    </div>

  </div>
)}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default RequestTracking;