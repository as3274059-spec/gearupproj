import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaStar,
  FaPhone,
  FaEnvelope,
  FaWrench,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { MdArrowForward } from "react-icons/md";
import Sidebar from "../../../components/Customer/customer_sidebar";
import Header from "../../../components/Customer/customer_header";

interface Review {
  customerName: string;
  stars: number;
  comment: string;
  createdAt: string;
}

interface Service {
  id: string;
  subSpecializationName: string;
  price: number;
}

interface MechanicProfileData {
  name: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl: string;
  averageRating: number;
  supportsFieldVisit: boolean;
  workStartTime: string;
  workEndTime: string;
  latitude: number;
  longitude: number;
  reviews: Review[];
  services: Service[];
}

interface LocationInfo {
  country?: string;
  governorate?: string;
  address?: string;
}

const AiMechanicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [mechanic, setMechanic] = useState<MechanicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      setLoading(true);
      const token = sessionStorage.getItem("userToken");

      try {
        const response = await axios.get(
          `https://gearupapp.runasp.net/api/mechanics/${id}/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "*/*",
            },
          }
        );

        setMechanic(response.data);
      } catch (err: any) {
        setError("فشل في تحميل بيانات الميكانيكي.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const fetchAddressFromCoordinates = async (
    latitude: number,
    longitude: number
  ) => {
    if (!latitude || !longitude) {
      setLocationInfo(null);
      return;
    }

    setLoadingLocation(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=ar`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location");
      }

      const data = await response.json();
      const address = data?.address || {};

      const location: LocationInfo = {
        country: address.country || undefined,
        governorate:
          address.state ||
          address.governorate ||
          address.province ||
          undefined,
        address: data.display_name || undefined,
      };

      setLocationInfo(location);
    } catch (err) {
      console.error("Error fetching address:", err);
      setLocationInfo(null);
    } finally {
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    if (
      mechanic &&
      typeof mechanic.latitude === "number" &&
      typeof mechanic.longitude === "number"
    ) {
      fetchAddressFromCoordinates(mechanic.latitude, mechanic.longitude);
    }
  }, [mechanic]);

  const formatTime = (t: string) => (t ? t.substring(0, 5) : "--:--");

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getLocationText = () => {
    if (loadingLocation) return "جاري تحديد الموقع...";
    if (!locationInfo) return "لم يتم التحديد";

    const parts = [
      locationInfo.country,
      locationInfo.governorate,
      locationInfo.address,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(" - ") : "لم يتم التحديد";
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-primary_BGD items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#137FEC] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm font-medium">
            جاري تحميل البيانات...
          </p>
        </div>
      </div>
    );
  }

  if (error || !mechanic) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-primary_BGD flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 text-lg font-bold mb-4">{error}</p>

          <button
            onClick={() => navigate(-1)}
            className="bg-white dark:bg-[#0d1629] text-[#137FEC] border border-[#137FEC] hover:bg-[#137FEC] hover:text-white px-6 py-2 rounded-xl font-bold transition-all shadow-sm"
          >
            رجوع
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen bg-gray-50 dark:bg-primary_BGD overflow-hidden"
      dir="rtl"
    >
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col h-full bg-white dark:bg-[#0d1629] border-l border-gray-200 dark:border-gray-800 shrink-0 z-20">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <div className="bg-white dark:bg-[#0d1629] shadow-sm z-10 border-b border-gray-100 dark:border-gray-800">
          <Header />
        </div>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 scroll-smooth">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#137FEC] dark:hover:text-[#137FEC] transition-colors font-medium bg-white dark:bg-[#0d1629] px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#137FEC] dark:hover:border-[#137FEC] shadow-sm"
              >
                <MdArrowForward size={20} />
                <span>عودة</span>
              </button>

              <h1 className="text-xl font-bold text-gray-800 dark:text-white hidden md:block">
                تفاصيل الميكانيكي
              </h1>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-[#0d1629] rounded-3xl pt-16 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden relative">
              <div className="h-24 bg-gradient-to-l from-[#137FEC] to-blue-300"></div>

              <div className="px-6 pb-6 md:px-8 md:pb-8">
                <div className="flex flex-col md:flex-row gap-6 -mt-12">
                  {/* Avatar */}
                  <div className="relative shrink-0 mx-auto md:mx-0">
                    <div className="w-28 h-28 rounded-3xl border-4 border-white dark:border-[#0d1629] shadow-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {mechanic.profilePictureUrl ? (
                        <img
                          src={mechanic.profilePictureUrl}
                          alt={mechanic.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#137FEC] flex items-center justify-center text-white text-4xl font-bold">
                          {mechanic.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {mechanic.supportsFieldVisit && (
                      <div
                        className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg border-4 border-white dark:border-[#0d1629]"
                        title="خدمة ميدانية"
                      >
                        <FaWrench size={12} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 pt-2 md:pt-14 text-center md:text-right">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start mb-2">
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        {mechanic.name}
                      </h2>

                      <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-[#137FEC] text-xs font-bold px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800/50">
                        معتمد
                      </div>
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-2 mb-5">
                      <div className="flex text-amber-400 text-sm gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={
                              i < Math.floor(mechanic.averageRating)
                                ? "fill-current"
                                : "text-gray-200 dark:text-gray-700"
                            }
                          />
                        ))}
                      </div>

                      <span className="font-bold text-gray-700 dark:text-gray-200">
                        {mechanic.averageRating.toFixed(1)}
                      </span>

                      <span className="text-gray-400 text-sm">
                        ({mechanic.reviews.length} تقييم)
                      </span>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <a
                        href={`tel:${mechanic.phoneNumber}`}
                        className="flex items-center gap-2 text-sm font-semibold text-[#137FEC] bg-blue-50 dark:bg-[#137FEC10] hover:bg-[#137FEC] hover:text-white px-4 py-2.5 rounded-xl transition-all"
                      >
                        <FaPhone /> {mechanic.phoneNumber}
                      </a>

                      <a
                        href={`mailto:${mechanic.email}`}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                      >
                        <FaEnvelope /> مراسلة
                      </a>
                    </div>
                  </div>

                  {/* Book Button */}
                  <div className="hidden md:flex flex-col justify-center pt-14">
                    <button
                      onClick={() =>
                        navigate(`/customer/add-booking?mechanicId=${id}`)
                      }
                      className="bg-[#137FEC] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <FaCheckCircle /> احجز الآن
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid: Hours & Services */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Hours Card */}
              <div className="bg-white dark:bg-[#0d1629] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center text-xl">
                    <FaClock />
                  </div>

                  <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                    ساعات العمل
                  </h3>
                </div>

                <div className="flex-1 bg-gray-50 dark:bg-[#0d1629]/50 rounded-2xl p-5 border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-3 mb-4">
                  <div className="flex items-center gap-4 w-full justify-between px-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">من</p>
                      <p className="text-2xl font-black text-gray-800 dark:text-white font-mono">
                        {formatTime(mechanic.workStartTime)}
                      </p>
                    </div>

                    <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>

                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">إلى</p>
                      <p className="text-2xl font-black text-gray-800 dark:text-white font-mono">
                        {formatTime(mechanic.workEndTime)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location */}
<a
  href={
    mechanic.latitude && mechanic.longitude
      ? `https://www.google.com/maps?q=${mechanic.latitude},${mechanic.longitude}`
      : undefined
  }
  target="_blank"
  rel="noopener noreferrer"
  onClick={(e) => {
    if (!mechanic.latitude || !mechanic.longitude) {
      e.preventDefault();
    }
  }}
  className={`flex items-start gap-2 text-xs bg-gray-50 dark:bg-white/5 p-3 rounded-xl transition-all ${
    mechanic.latitude && mechanic.longitude
      ? "text-gray-500 dark:text-gray-400 hover:text-[#137FEC] hover:bg-blue-50 dark:hover:bg-[#137FEC10] cursor-pointer"
      : "text-gray-400 dark:text-gray-500 cursor-default"
  }`}
>
  <FaMapMarkerAlt className="text-[#137FEC] shrink-0 mt-0.5" />

  <span className="leading-5 break-words">
    {getLocationText()}
  </span>
</a>
              </div>

              {/* Services Card */}
              <div className="bg-white dark:bg-[#0d1629] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 lg:col-span-2 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-[#137FEC] flex items-center justify-center text-lg">
                    <FaWrench />
                  </div>

                  <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                    الخدمات والأسعار
                  </h3>

                  <span className="mr-auto bg-gray-100 dark:bg-white/5 text-gray-500 text-xs font-bold px-2 py-1 rounded-md">
                    {mechanic.services.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-64 custom-scrollbar space-y-2 pr-1">
                  {mechanic.services.length > 0 ? (
                    mechanic.services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#0d1629] hover:bg-[#137FEC5] dark:hover:bg-[#137FEC10] rounded-xl border border-transparent hover:border-[#137FEC20] transition-all group cursor-default"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:bg-[#137FEC] group-hover:text-white group-hover:border-[#137FEC] transition-colors shrink-0 shadow-sm">
                            <FaWrench size={12} />
                          </div>

                          <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-[#137FEC] transition-colors">
                            {service.subSpecializationName}
                          </span>
                        </div>

                        <span className="text-sm font-black text-[#137FEC] bg-blue-50 dark:bg-[#137FEC20] px-3 py-1 rounded-lg">
                          {service.price} ج.م
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
                      <FaWrench className="text-3xl opacity-20 mb-2" />
                      <span className="text-sm">لا توجد خدمات مسجلة</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews Card */}
            <div className="bg-white dark:bg-[#0d1629] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center text-lg">
                  <FaStar />
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                    آراء العملاء
                  </h3>
                  <p className="text-xs text-gray-400">
                    تعرف على تجارب السابقين
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mechanic.reviews.length > 0 ? (
                  mechanic.reviews.map((review, index) => (
                    <div
                      key={index}
                      className="p-5 bg-gray-50 dark:bg-[#0d1629] rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-gray-600 dark:text-white font-bold text-sm shadow-sm">
                            {review.customerName.charAt(0)}
                          </div>

                          <div>
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                              {review.customerName}
                            </h4>

                            <div className="flex text-xs text-gray-400 mt-0.5">
                              {formatDate(review.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="flex text-amber-400 text-xs gap-0.5 bg-white dark:bg-black/20 px-2 py-1 rounded-full border border-amber-100 dark:border-amber-800/30">
                          <FaStar size={10} /> {review.stars}.0
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-300 dark:text-gray-600 mb-3">
                      <FaStar size={24} />
                    </div>

                    <p className="text-gray-400 font-medium">
                      لا توجد تقييمات حتى الآن
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Floating Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-50 w-[90%]">
        <button
          onClick={() => navigate(`/customer/add-booking?mechanicId=${id}`)}
          className="w-full bg-[#137FEC] hover:bg-blue-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-2 transition-all active:scale-95 border border-blue-400"
        >
          <FaCheckCircle size={16} />
          احجز الآن
        </button>
      </div>
    </div>
  );
};

export default AiMechanicProfile;