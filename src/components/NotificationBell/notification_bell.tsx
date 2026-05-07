
import { useState, useEffect, useCallback } from "react";
import { FaBell, FaTimes, FaStar, FaRegStar, FaPaperPlane, FaRegEye } from "react-icons/fa";
// import { GiCarWheel } from "react-icons/gi";
// import { MdDirectionsCar } from "react-icons/md";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import * as signalR from "@microsoft/signalr";
import axios from "axios";
import toast from "react-hot-toast";

type NotificationItem = {
  title?: string;
  message?: string;
  description?: string;
  time?: string;
  reminderId?: number | string;
  carId?: string;
  carName?: string;
  plateNumber?: string;
  isRequest?: boolean;
  isBooking?: boolean;
  isSelected?: boolean;
  requestId?: string;
  hasTracking?: boolean;
  requestDetail?: string;
  scheduledDateTime?: string;
  status?: string;
  location?: {
    lat: number;
    lng: number;
  } | null;
  problemPhotoUrl?: string | null;
  serviceCategory?: string | null;
  bookingId?: string;
  customerName?: string;
  mechanicName?: string;
  date?: string;
  slotStart?: string;
  slotEnd?: string;
};

type NotificationBellProps = {
  size?: number;
};

const BOOKING_TITLE_MAP: Record<string, string> = {
  "New Booking Request": "طلب حجز جديد 📋",
  "Booking Accepted": "تم قبول الحجز ✅",
  "Booking Rejected": "تم رفض الحجز ❌",
  "Booking Cancelled": "تم إلغاء الحجز 🚫",
  "Booking Rescheduled": "تم تغيير موعد الحجز 📅",
  "Booking Completed": "تم إكمال الحجز 🎉",
  "Booking Status Updated": "تم تحديث حالة الحجز 🔄",
  "طلب حجز جديد": "طلب حجز جديد 📋",
  "تم قبول الحجز": "تم قبول الحجز ✅",
  "تم رفض الحجز": "تم رفض الحجز ❌",
  "تم إلغاء الحجز": "تم إلغاء الحجز 🚫",
  "تم تغيير موعد الحجز": "تم تغيير موعد الحجز 📅",
  "تم إكمال الحجز": "تم إكمال الحجز 🎉",
  "تم تحديث حالة الحجز": "تم تحديث حالة الحجز 🔄",
};

const BOOKING_TITLES = Object.keys(BOOKING_TITLE_MAP);

const getStorageKeyByToken = (token: string | null) => {
  if (!token) return "guest_notifications";
  return `notifications_${token.slice(-10)}`;
};

const getCurrentTime = () =>
  new Date().toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

const normalizeBookingTitle = (title?: string) => {
  const safeTitle = title || "";
  const directMatch = BOOKING_TITLE_MAP[safeTitle];
  if (directMatch) return directMatch;
  const partialMatch = Object.entries(BOOKING_TITLE_MAP).find(([key]) =>
    safeTitle.includes(key)
  );
  return partialMatch ? partialMatch[1] : safeTitle;
};

const isBookingNotification = (n: NotificationItem) => {
  const title = n.title || "";
  return Boolean(
    n.isBooking ||
      n.bookingId ||
      BOOKING_TITLES.some((bookingTitle) => title.includes(bookingTitle))
  );
};

const isRequestNotification = (n: NotificationItem) => {
  return Boolean(n.isRequest && !isBookingNotification(n));
};

const isReminderNotification = (n: NotificationItem) => {
  return Boolean(
    !isBookingNotification(n) &&
      !isRequestNotification(n) &&
      n.reminderId
  );
};

const migrateNotifications = (notifications: NotificationItem[]) => {
  return notifications.map((n) => {
    const isBooking = isBookingNotification(n);
    if (isBooking) {
      return {
        ...n,
        title: normalizeBookingTitle(n.title),
        isBooking: true,
        isRequest: false,
        reminderId: undefined,
        carId: undefined,
        carName: undefined,
        plateNumber: undefined,
      };
    }
    return n;
  });
};

const readNotificationsFromStorage = (storageKey: string): NotificationItem[] => {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    const migrated = migrateNotifications(parsed);
    localStorage.setItem(storageKey, JSON.stringify(migrated));
    return migrated;
  } catch (error) {
    console.error("Failed to parse notifications:", error);
    localStorage.removeItem(storageKey);
    return [];
  }
};

const NotificationBell = ({ size = 25 }: NotificationBellProps) => {
  const { dark } = useTheme();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("userToken");

  const [role, setRole] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [cars, setCars] = useState<any[]>([]);
  const [activeSnoozeIndex, setActiveSnoozeIndex] = useState<number | null>(null);

  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    notification: NotificationItem | null;
  }>({
    isOpen: false,
    notification: null,
  });

  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    requestId: string | null;
    notificationIndex: number | null;
    stars: number;
    comment: string;
    loading: boolean;
  }>({
    isOpen: false,
    requestId: null,
    notificationIndex: null,
    stars: 5,
    comment: "",
    loading: false,
  });

  const [priceModal, setPriceModal] = useState<{
    isOpen: boolean;
    requestId: string | null;
    notificationIndex: number | null;
    price: string;
    loading: boolean;
  }>({
    isOpen: false,
    requestId: null,
    notificationIndex: null,
    price: "",
    loading: false,
  });

  const getStorageKey = useCallback(() => {
    return getStorageKeyByToken(token);
  }, [token]);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const initialToken = sessionStorage.getItem("userToken");
    const storageKey = getStorageKeyByToken(initialToken);
    return readNotificationsFromStorage(storageKey);
  });

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 2500);
  };

  const saveNotifications = useCallback(
    (items: NotificationItem[]) => {
      const migrated = migrateNotifications(items);
      localStorage.setItem(getStorageKey(), JSON.stringify(migrated));
      return migrated;
    },
    [getStorageKey]
  );

  const prependNotification = useCallback(
    (notification: NotificationItem) => {
      setNotifications((prev) => {
        const updated = saveNotifications([notification, ...prev]);
        return updated;
      });
      triggerShake();
    },
    [saveNotifications]
  );

  const removeNotificationFromList = (indexToRemove: number) => {
    setNotifications((prev) => {
      const updated = prev.filter((_, i) => i !== indexToRemove);
      return saveNotifications(updated);
    });
    setActiveSnoozeIndex(null);
  };

  const convertArabicNumbersToEnglish = (value: string) => {
    return value
      .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString())
      .replace(/[^\d.]/g, "");
  };

  const handleRatingSubmit = async () => {
    if (!ratingModal.requestId) return;
    setRatingModal((prev) => ({ ...prev, loading: true }));
    try {
      await axios.post(
        `https://gearupapp.runasp.net/api/requests/${ratingModal.requestId}/rate`,
        { stars: ratingModal.stars, comment: ratingModal.comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("شكراً لك! تم إرسال تقييمك بنجاح ⭐");
      if (ratingModal.notificationIndex !== null) removeNotificationFromList(ratingModal.notificationIndex);
      setRatingModal({ isOpen: false, requestId: null, notificationIndex: null, stars: 5, comment: "", loading: false });
    } catch (error) {
      console.error("Rating Error:", error);
      toast.error("فشل إرسال التقييم، حاول مرة أخرى.");
      setRatingModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handlePriceSubmit = async () => {
    if (!priceModal.requestId) return;
    const numericPrice = Number(priceModal.price);
    if (!priceModal.price || numericPrice <= 0) {
      toast.error("يرجى إدخال سعر صحيح");
      return;
    }
    setPriceModal((prev) => ({ ...prev, loading: true }));
    try {
      await axios.post(
        `https://gearupapp.runasp.net/api/mechanic/requests/${priceModal.requestId}/accept`,
        { price: numericPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("تم قبول الطلب بنجاح ✅");
      if (priceModal.notificationIndex !== null) removeNotificationFromList(priceModal.notificationIndex);
      setPriceModal({ isOpen: false, requestId: null, notificationIndex: null, price: "", loading: false });
    } catch (error) {
      console.error("Accept with Price Error:", error);
      toast.error("فشل قبول الطلب، حاول مرة أخرى.");
      setPriceModal((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    try {
      if (!token) return;
      const parts = token.split(".");
      if (parts.length !== 3) return;
      const payload = JSON.parse(atob(parts[1]));
      const userRole = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      setRole(userRole);
    } catch (error) {
      console.error("Role parse error:", error);
    }
  }, [token]);

  useEffect(() => {
    const storageKey = getStorageKey();
    setNotifications(readNotificationsFromStorage(storageKey));
  }, [getStorageKey]);

  useEffect(() => {
    const handleStorageChange = () => {
      const storageKey = getStorageKey();
      setNotifications(readNotificationsFromStorage(storageKey));
      triggerShake();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [getStorageKey]);

  const completeReminder = async (reminderId: number | string, index: number) => {
    try {
      await axios.post(`https://gearupapp.runasp.net/api/Reminder/${reminderId}/complete`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("تم تسجيل الإتمام بنجاح");
      removeNotificationFromList(index);
      window.dispatchEvent(new Event("reminderCompleted"));
    } catch (error) {
      console.error("Complete Reminder Error:", error);
      toast.error("فشل تسجيل الإتمام");
    }
  };

  const snoozeReminder = async (reminderId: number | string, snoozeType: number, index: number) => {
    try {
      await axios.post(`https://gearupapp.runasp.net/api/Reminder/${reminderId}/snooze`, { snoozeType }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("تم تأجيل التذكير");
      removeNotificationFromList(index);
      window.dispatchEvent(new Event("reminderSnoozed"));
    } catch (error) {
      console.error("Snooze Error:", error);
      toast.error("فشل تأجيل التذكير");
    }
  };

  const handleReject = async (requestId: string, index: number) => {
    try {
      await axios.post(`https://gearupapp.runasp.net/api/mechanic/requests/${requestId}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("تم رفض الطلب ❌");
      removeNotificationFromList(index);
    } catch (error) {
      console.error("Reject Error:", error);
      toast.error("فشل رفض الطلب ❌");
    }
  };

  useEffect(() => {
    if (!token) return;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://gearupapp.runasp.net/hubs/notifications", { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    connection.serverTimeoutInMilliseconds = 60000;
    connection.keepAliveIntervalInMilliseconds = 15000;

    const addBookingNotification = (eventName: string, data: any) => {
      const newNotification: NotificationItem = {
        title: normalizeBookingTitle(eventName),
        message: buildBookingMessage(eventName, data),
        isBooking: true,
        isRequest: false,
        reminderId: undefined,
        carId: undefined,
        carName: undefined,
        plateNumber: undefined,
        bookingId: data?.bookingId || data?.id,
        customerName: data?.customerName || data?.customerFullName || data?.userName || "",
        mechanicName: data?.mechanicName || "",
        date: data?.date || data?.newDate || data?.bookingDate || "",
        slotStart: data?.slotStart || data?.newSlotStart || data?.startTime || "",
        slotEnd: data?.slotEnd || data?.newSlotEnd || data?.endTime || "",
        time: getCurrentTime(),
      };
      prependNotification(newNotification);
    };

    connection.on("ReceiveReminderNotification", (data: any) => {
      setNotifications((oldNotifications) => {
        const filtered = oldNotifications.filter((n) => n.reminderId !== data?.reminderId);
        const newNotification: NotificationItem = {
          title: data?.title || "تنبيه صيانة",
          message: data?.message || "لديك تنبيه جديد",
          reminderId: data?.reminderId,
          isBooking: false,
          isRequest: false,
          carId: data?.carId,
          time: getCurrentTime(),
        };
        return saveNotifications([newNotification, ...filtered]);
      });
      triggerShake();
    });

    connection.on("ReceiveServiceRequest", (data: any) => {
      console.log("🔥 NEW REQUEST:", data);
      const idToNameMap: Record<number, string> = { 1: "تشخيص", 2: "إطارات", 3: "جسم", 4: "زيت" };
      const engToArMap: Record<string, string> = { "Diagnosis": "تشخيص", "Tires": "إطارات", "BodyRepair": "جسم", "OilChange": "زيت" };

      let categoryName: string | null = null;
      const serviceTypeId = data?.serviceType || data?.ServiceType;
      if (typeof serviceTypeId === 'number' && idToNameMap[serviceTypeId]) {
        categoryName = idToNameMap[serviceTypeId];
      }
      if (!categoryName && data?.serviceType && typeof data?.serviceType === 'string') {
        categoryName = engToArMap[data.serviceType] || null;
      }
      const photoUrl = data?.problemPhotoUrl || data?.ProblemPhotoUrl || null;

      const newNotification: NotificationItem = {
        title: "طلب صيانة جديد 🛠️",
        isRequest: true,
        isBooking: false,
        requestId: data?.requestId || data?.serviceRequestId,
        scheduledDateTime: data?.scheduledDateTime,
        carName: data?.car?.brand && data?.car?.model && data?.car?.year ? `${data.car.brand} ${data.car.model} ${data.car.year}` : "سيارة غير محددة",
        plateNumber: data?.car?.plateNumber || "غير متوفر",
        location: data?.location ? { lat: data.location.latitude, lng: data.location.longitude } : null,
        requestDetail: data?.requestType === "Emergency" ? "طلب طارئ 🚨" : data?.requestType === "Scheduled" ? "طلب مجدول 📅" : "طلب صيانة",
        description: data?.issueDescription,
        serviceCategory: categoryName,
        problemPhotoUrl: photoUrl,
        time: getCurrentTime(),
      };
      prependNotification(newNotification);
    });

    connection.on("MechanicAccepted", async (data: any) => {
      let mechanicName = "ميكانيكي";
      try {
        const res = await axios.get(`https://gearupapp.runasp.net/api/requests/${data.serviceRequestId}/accepted-mechanics`, { headers: { Authorization: `Bearer ${token}` } });
        const mechanic = res.data?.mechanics?.find((m: any) => m.mechanicUserId === data.mechanicUserId);
        if (mechanic) mechanicName = `${mechanic.firstName} ${mechanic.lastName}`;
      } catch (error) { console.error("Error fetching mechanic:", error); }

      localStorage.setItem("accepted_mechanic", JSON.stringify({ requestId: data?.serviceRequestId, name: mechanicName }));
      window.dispatchEvent(new Event("mechanicAccepted"));

      const newNotification: NotificationItem = {
        title: "تم قبول طلبك 🎉",
        message: `تم قبول الطلب بواسطة الميكانيكي ${mechanicName} 🛠️`,
        isRequest: false,
        isBooking: false,
        mechanicName,
        requestId: data?.requestId || data?.serviceRequestId,
        time: getCurrentTime(),
      };
      prependNotification(newNotification);
    });

    connection.on("YouAreSelected", (data: any) => {
      const newNotification: NotificationItem = {
        title: "تم اختيارك 🎉",
        message: "تم اختيارك من قبل العميل.",
        requestId: data?.serviceRequestId,
        hasTracking: true,
        isRequest: true,
        isBooking: false,
        isSelected: true,
        time: getCurrentTime(),
      };
      prependNotification(newNotification);
    });

    const statusMap: Record<string, string> = { Accepted: "تم القبول", OnTheWay: "في الطريق", Arrived: "وصل الميكانيكي", InProgress: "جاري الإصلاح", Completed: "تم الانتهاء", Cancelled: "تم الإلغاء", SearchingFarther: "جاري البحث عن ميكانيكيين " };

    connection.on("RequestStatusChanged", async (data: any) => {
      const id = data?.requestId || data?.serviceRequestId;
      if (!id) return;
      let issue = "طلب صيانة";
      let mechanicName = "الميكانيكي";
      try {
        const res = await axios.get(`https://gearupapp.runasp.net/api/requests/${id}/status`, { headers: { Authorization: `Bearer ${token}` } });
        const fullData = res.data;
        issue = fullData?.issueDescription || issue;
        if (fullData?.mechanic) mechanicName = `${fullData.mechanic.firstName} ${fullData.mechanic.lastName}`;
      } catch (error) { console.error("Status fetch error:", error); }

      const newNotification: NotificationItem = {
        title: "🔄 تم تحديث حالة الطلب",
        description: `المشكلة: ${issue}\nتم تحديث الحالة إلى: ${statusMap[data?.newStatus] || data?.newStatus}\nبواسطة الميكانيكي: ${mechanicName}`,
        requestId: id,
        status: data?.newStatus,
        isRequest: true,
        isBooking: false,
        hasTracking: true,
        time: getCurrentTime(),
      };
      prependNotification(newNotification);
    });

    connection.on("New Booking Request", (data: any) => addBookingNotification("New Booking Request", data));
    connection.on("Booking Accepted", (data: any) => addBookingNotification("Booking Accepted", data));
    connection.on("Booking Rejected", (data: any) => addBookingNotification("Booking Rejected", data));
    connection.on("Booking Cancelled", (data: any) => addBookingNotification("Booking Cancelled", data));
    connection.on("Booking Rescheduled", (data: any) => addBookingNotification("Booking Rescheduled", data));
    connection.on("Booking Completed", (data: any) => addBookingNotification("Booking Completed", data));
    connection.on("Booking Status Updated", (data: any) => addBookingNotification("Booking Status Updated", data));

    const buildBookingMessage = (eventName: string, data: any) => {
      if (eventName === "New Booking Request") return `لديك طلب حجز جديد بتاريخ ${data?.date || data?.bookingDate || ""}`;
      if (eventName === "Booking Rescheduled") return `تم تغيير موعد الحجز إلى ${data?.newDate || data?.date || ""}`;
      if (eventName === "Booking Accepted") return "تم قبول الحجز بنجاح";
      if (eventName === "Booking Rejected") return "تم رفض الحجز";
      if (eventName === "Booking Cancelled") return "تم إلغاء الحجز";
      if (eventName === "Booking Completed") return "تم إكمال الحجز";
      return "تم تحديث الحجز";
    };

    const startConnection = async () => {
      try {
        if (connection.state === signalR.HubConnectionState.Disconnected) await connection.start();
        console.log("SignalR Connected ✅");
      } catch (error) { console.error("SignalR Connection Error ❌", error); }
    };
    startConnection();
    // return () => connection.stop();
    return () => {
      connection.stop();
    };
  }, [token, prependNotification, saveNotifications]);

  const fetchCars = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get("https://gearupapp.runasp.net/api/customers/cars", { headers: { Authorization: `Bearer ${token}` } });
      setCars(res.data?.cars || []);
    } catch (error) { console.error("Fetch Cars Error:", error); }
  }, [token]);

  useEffect(() => { fetchCars(); }, [fetchCars]);

  const getCarName = (carId?: string) => {
    if (!carId) return "";
    const car = cars.find((c) => c.id === carId);
    return car ? `${car.brand} ${car.model} ${car.year}` : "جاري التحميل...";
  };

  const snoozeOptions = [
    { label: "دقيقتين", value: 5 },
    { label: "ساعة واحدة", value: 0 },
    { label: "3 ساعات", value: 1 },
    { label: "يوم واحد", value: 2 },
    { label: "3 أيام", value: 3 },
    { label: "أسبوع", value: 4 },
  ];

  return (
    <div className="relative inline-block">
      <style>{`
        @keyframes gentle-shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
          75% { transform: rotate(-8deg); }
        }
        .animate-bell-shake { animation: gentle-shake 0.5s ease-in-out 5; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #137FEC33; border-radius: 10px; }
      `}</style>

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`p-2 rounded-full transition-colors relative ${dark ? "text-white hover:bg-white/10" : "text-[#137FEC] hover:bg-blue-50"} ${isShaking ? "animate-bell-shake" : ""}`}
      >
        <FaBell size={size} />
        {notifications.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />}
      </button>

      {isOpen && (
        <div dir="rtl" className={`absolute left-0 mt-3 w-80 rounded-2xl shadow-2xl z-[100] p-4 border backdrop-blur-md ${dark ? "bg-[#0f172a]/95 border-white/10 text-white" : "bg-white/95 border-gray-100"}`}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
            <h3 className="font-bold text-[13px] opacity-90">التنبيهات ({notifications.length})</h3>
            <button onClick={() => setIsOpen(false)} className={`transition-colors ${dark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-red-500"}`}>
              <FaTimes size={12} />
            </button>
          </div>

          <div className="relative max-h-80 overflow-y-auto space-y-3 custom-scrollbar px-1">
            {notifications.length > 0 ? (
              notifications.map((n, i) => {
                const isBooking = isBookingNotification(n);
                const isRequest = isRequestNotification(n);
                const isReminder = isReminderNotification(n);
                const displayTitle = isBooking ? normalizeBookingTitle(n.title) : n.title;

                return (
                  <div key={`${n.title}-${n.time}-${i}`} className={`relative p-3.5 rounded-xl border transition-all ${dark ? "bg-white/[0.03] border-white/[0.05]" : "bg-blue-50 border-blue-100"}`}>
                    <div className="flex-1 min-w-0 text-right">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        {/* تمت إزالة الـ Badge من هنا حسب طلبك */}
                        <h4 className="font-bold text-[12px] text-blue-400 leading-5">
                          {displayTitle}
                        </h4>

                        <button onClick={() => removeNotificationFromList(i)} className={`transition-colors ${dark ? "text-slate-400 hover:text-red-400" : "text-slate-600 hover:text-red-500"}`}>
                          <FaTimes size={10} />
                        </button>
                      </div>

                      {(n.carName || n.carId) && !isBooking && (
                        <div className="mb-1">
                          <div className="text-[11px] font-bold flex items-center gap-1 dark:text-slate-200">
                            {n.plateNumber && <span className="text-[10px] opacity-70">{n.plateNumber}</span>}
                            <span>{n.carName || getCarName(n.carId)}</span>
                          </div>
                          {isReminder && <div className="text-[10px] text-blue-500 font-bold mt-1">تنبيه صيانة</div>}
                        </div>
                      )}

                      {isRequest && (
                        <div className="space-y-2 mb-2">
                          {n.requestDetail && <span className="text-[10px] font-bold text-blue-500/80 block">{n.requestDetail}</span>}
                          {n.description && (
                            <div className={`text-[11px] leading-5 whitespace-pre-line bg-blue-500/10 p-2 rounded-lg border-r-2 border-blue-400 ${n.title?.includes("تم تحديث") ? 'line-clamp-none' : 'line-clamp-2'}`}>
                              {n.description}
                            </div>
                          )}
                          {role?.toLowerCase() === "mechanic" && !n.hasTracking && (
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => setDetailsModal({ isOpen: true, notification: n })} className={`flex-[2] text-[11px] py-1 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition font-bold flex items-center justify-center gap-1 ${!n.requestId ? "opacity-50 cursor-not-allowed" : ""}`} disabled={!n.requestId}>
                                <FaRegEye /> عرض التفاصيل
                              </button>
                              <button onClick={() => { if (!n.requestId) { toast.error("requestId غير موجود"); return; } setPriceModal({ isOpen: true, requestId: n.requestId, notificationIndex: i, price: "", loading: false }); }} className="flex-1 text-[11px] py-1 rounded bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition font-bold">قبول</button>
                              <button onClick={() => { if (!n.requestId) { toast.error("requestId غير موجود"); return; } handleReject(n.requestId, i); }} className="flex-1 text-[11px] py-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition font-bold">رفض</button>
                            </div>
                          )}
                          {n.requestId && n.title?.includes("تم اختيارك") && <div className="text-[11px] bg-green-500/10 border-r-2 border-green-500 p-2 rounded-lg text-green-500 font-bold">{n.message}</div>}
                          {n.hasTracking && role?.toLowerCase() === "mechanic" && <button onClick={() => navigate(`/mechanics/request/mrequest_tracking/${n.requestId}`)} className="mt-2 w-full bg-blue-500 text-white py-1 rounded text-xs">تتبع الطلب</button>}
                          {n.location && !n.hasTracking && <a href={`https://www.google.com/maps?q=${n.location.lat},${n.location.lng}`} target="_blank" rel="noopener noreferrer" className="text-[11px] opacity-80 text-blue-500 underline hover:text-blue-700 block mb-2">📍 عرض الموقع</a>}
                          {n.scheduledDateTime && <div className="text-[11px] opacity-80 mt-1">{new Date(n.scheduledDateTime).toLocaleString("ar-EG")}</div>}
                        </div>
                      )}

                      {isBooking && (
                        <div className="space-y-1 mb-2">
                          {n.customerName && <div className="text-[11px] font-bold dark:text-slate-200">👤 {n.customerName}</div>}
                          {n.mechanicName && <div className="text-[11px] dark:text-slate-300">🔧 {n.mechanicName}</div>}
                          {n.date && <div className="text-[11px] opacity-80">📅 {n.date} {n.slotStart && `${n.slotStart.slice(0, 5)} - ${n.slotEnd?.slice(0, 5)}`}</div>}
                          {n.message && <div className="text-[11px] bg-blue-500/10 p-2 rounded-lg border-r-2 border-blue-400 leading-5">{n.message}</div>}
                        </div>
                      )}

                      {!isRequest && !isBooking && !isReminder && n.message && <div className="text-[11px] bg-blue-500/10 p-2 rounded-lg border-r-2 border-blue-400 leading-5 mb-2">{n.message}</div>}

                      {isRequest && role?.toLowerCase() === "customer" && n.status === "Completed" && (
                        <button onClick={() => setRatingModal({ isOpen: true, requestId: n.requestId || null, notificationIndex: i, stars: 5, comment: "", loading: false })} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-1.5 rounded text-xs font-bold mt-2 transition flex items-center justify-center gap-1">
                          <FaStar /> تقييم الميكانيكي
                        </button>
                      )}

                      {isReminder && (
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => { if (!n.reminderId) return; completeReminder(n.reminderId, i); }} className="flex-1 text-[11px] py-1 rounded bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition font-bold">إتمام</button>
                          <button onClick={() => setActiveSnoozeIndex(activeSnoozeIndex === i ? null : i)} className="flex-1 text-[11px] py-1 rounded bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white transition font-bold">تأجيل</button>
                        </div>
                      )}

                      {isReminder && activeSnoozeIndex === i && (
                        <div className={`fixed z-[999999] w-32 rounded-lg shadow-2xl p-1.5 border ${dark ? "bg-slate-800 border-white/20 text-white" : "bg-white border-gray-200 text-gray-800"}`} style={{ right: "auto", transform: "translateY(-100%)" }}>
                          <div className="text-[9px] font-bold mb-1 pb-1 border-b border-gray-500/10 opacity-60 text-center">مدة التأجيل</div>
                          <div className="flex flex-col">
                            {snoozeOptions.map((opt, idx) => (
                              <div key={idx}>
                                <button onClick={(e) => { e.stopPropagation(); if (!n.reminderId) return; snoozeReminder(n.reminderId, opt.value, i); }} className="block w-full text-[11px] py-1.5 px-2 rounded-md text-right hover:bg-blue-600 hover:text-white transition-all font-medium">{opt.label}</button>
                                {idx < snoozeOptions.length - 1 && <div className={`h-[0.5px] mx-1 my-0 ${dark ? "bg-white/5" : "bg-gray-50"}`} />}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <span className="text-[8px] mt-2 opacity-30 block font-mono">{n.time}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 opacity-30 text-[11px]">لا توجد تنبيهات</div>
            )}
          </div>
        </div>
      )}

      {/* --- Request Details Modal --- */}
      {detailsModal.isOpen && detailsModal.notification && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${dark ? "bg-slate-800 text-white" : "bg-white text-slate-800"}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-blue-500/5">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  تفاصيل طلب الصيانة
                </h3>
                <p className="text-xs opacity-60 mt-1">
                  {detailsModal.notification.carName} • {detailsModal.notification.plateNumber}
                </p>
                {/* Display Category here clearly */}
                {detailsModal.notification.serviceCategory && (
                  <div className="mt-2 text-xs font-bold text-blue-500/90 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800">
                    تصنيف العطل : {detailsModal.notification.serviceCategory}
                  </div>
                )}
              </div>
              <button onClick={() => setDetailsModal({ isOpen: false, notification: null })} className="text-gray-400 hover:text-red-500 transition">
                <FaTimes size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Image Section */}
              {detailsModal.notification.problemPhotoUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 flex flex-col items-center">
                  <span className="text-xs font-bold opacity-50 py-2">صورة المشكلة</span>
                  <img src={detailsModal.notification.problemPhotoUrl} alt="Problem" className="w-full h-auto max-h-[300px] object-contain" />
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="text-sm font-bold opacity-70 mb-2">وصف المشكلة:</h4>
                <p className="text-sm leading-relaxed bg-gray-100 dark:bg-white/5 p-3 rounded-lg whitespace-pre-line">
                  {detailsModal.notification.description || "لا يوجد وصف"}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {detailsModal.notification.requestDetail && (
                  <div className="bg-gray-100 dark:bg-white/5 p-2 rounded-lg">
                    <span className="block opacity-50">نوع الطلب</span>
                    <span className="font-bold">{detailsModal.notification.requestDetail}</span>
                  </div>
                )}
                {detailsModal.notification.location && (
                  <a href={`https://www.google.com/maps?q=${detailsModal.notification.location.lat},${detailsModal.notification.location.lng}`} target="_blank" className="bg-blue-50 dark:bg-blue-900/20 text-blue-500 p-2 rounded-lg flex items-center justify-center gap-1 hover:underline cursor-pointer">
                    📍 فتح الموقع في الخرائط
                  </a>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            {role?.toLowerCase() === "mechanic" && !detailsModal.notification.hasTracking && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 flex gap-3">
                <button onClick={() => { if(!detailsModal.notification?.requestId) return; setPriceModal({ isOpen: true, requestId: detailsModal.notification.requestId!, notificationIndex: notifications.indexOf(detailsModal.notification!), price: "", loading: false }); setDetailsModal({ isOpen: false, notification: null }); }} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm transition">قبول وتحديد السعر</button>
                <button onClick={() => { if(!detailsModal.notification?.requestId) return; handleReject(detailsModal.notification.requestId!, notifications.indexOf(detailsModal.notification!)); setDetailsModal({ isOpen: false, notification: null }); }} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-bold text-sm transition">رفض</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Price Modal --- */}
      {priceModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm">
          <div className={`w-[90%] max-w-sm rounded-2xl p-6 shadow-2xl ${dark ? "bg-slate-800 text-white" : "bg-white text-slate-800"}`}>
            <h3 className="text-lg font-bold mb-4 text-center flex items-center justify-center gap-2">تحديد السعر</h3>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2 opacity-80">سعر التقدير (جنيه)</label>
              <input type="text" inputMode="decimal" value={priceModal.price} onChange={(e) => { const englishValue = convertArabicNumbersToEnglish(e.target.value); setPriceModal((prev) => ({ ...prev, price: englishValue })); }} placeholder="مثال: 150" className={`w-full rounded-lg p-3 text-sm mb-1 focus:outline-none focus:ring-2 focus:ring-green-500 ${dark ? "bg-slate-700 border-none text-white" : "bg-gray-50 border border-gray-200"}`} />
              <span className="text-[10px] opacity-60">سيتم عرض هذا السعر للعميل للموافقة</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPriceModal({ isOpen: false, requestId: null, notificationIndex: null, price: "", loading: false })} className="flex-1 py-2 rounded-lg text-sm font-bold bg-gray-200 hover:bg-gray-300 text-gray-800 transition">إلغاء</button>
              <button onClick={handlePriceSubmit} disabled={priceModal.loading} className="flex-1 py-2 rounded-lg text-sm font-bold bg-green-600 hover:bg-green-700 text-white transition flex items-center justify-center gap-2 disabled:opacity-50">{priceModal.loading ? "جاري الإرسال..." : <><FaPaperPlane /> إرسال</>}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Rating Modal --- */}
      {ratingModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm">
          <div className={`w-[90%] max-w-sm rounded-2xl p-6 shadow-2xl ${dark ? "bg-slate-800 text-white" : "bg-white text-slate-800"}`}>
            <h3 className="text-lg font-bold mb-4 text-center">تقييم الخدمة ⭐</h3>
            <div className="flex justify-center gap-2 mb-4 text-2xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRatingModal((prev) => ({ ...prev, stars: star }))} className="transition-transform hover:scale-110">
                  {star <= ratingModal.stars ? <FaStar className="text-yellow-400" /> : <FaRegStar className="text-gray-400" />}
                </button>
              ))}
            </div>
            <textarea value={ratingModal.comment} onChange={(e) => setRatingModal((prev) => ({ ...prev, comment: e.target.value }))} placeholder="اكتب تعليقك هنا (اختياري)..." className={`w-full rounded-lg p-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${dark ? "bg-slate-700 border-none text-white" : "bg-gray-50 border border-gray-200"}`} rows={3} />
            <div className="flex gap-3">
              <button onClick={() => setRatingModal({ isOpen: false, requestId: null, notificationIndex: null, stars: 5, comment: "", loading: false })} className="flex-1 py-2 rounded-lg text-sm font-bold bg-gray-200 hover:bg-gray-300 text-gray-800 transition">إلغاء</button>
              <button onClick={handleRatingSubmit} disabled={ratingModal.loading} className="flex-1 py-2 rounded-lg text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white transition flex items-center justify-center gap-2 disabled:opacity-50">{ratingModal.loading ? "جاري الإرسال..." : <><FaPaperPlane /> إرسال التقييم</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;