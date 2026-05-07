import { useState, useEffect } from "react";
import NotificationBell from "../../../components/NotificationBell/notification_bell";
import ThemeToggle from "../../../components/ThemeToggle/theme_toggle";
import { useTheme } from "../../../contexts/ThemeContext";
import MachineSidebar from "../../../components/Machine/MachineSidebar";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdClose } from "react-icons/md";

interface Booking {
  id: string;
  customerName: string;
  mechanicName: string;
  carInfo: string;
  subSpecializationName: string;
  date: string;
  slotStart: string;
  slotEnd: string;
  status: string;
  createdAt?: string;
  updatedAt?: string | null;
}

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const Schedule = () => {
  const { dark } = useTheme();
  const [selectedView, setSelectedView] = useState("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const [scheduleBookings, setScheduleBookings] = useState<Booking[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ======= Fetch Schedule (month range) =======
  const fetchSchedule = async (from: string, to: string) => {
    try {
      setLoadingSchedule(true);
      const token = sessionStorage.getItem("userToken");
      const res = await fetch(
        `https://gearupapp.runasp.net/api/bookings/mechanic/my/schedule?from=${from}&to=${to}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      const data: Booking[] = await res.json();
      setScheduleBookings(data);
    } catch {
      setScheduleBookings([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  // إعادة الجلب لما يتغير الشهر
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const from = formatDate(new Date(year, month, 1));
    const to = formatDate(new Date(year, month + 1, 0));
    fetchSchedule(from, to);
  }, [currentDate]);

  // ======= View Logic =======

  // اليوم الحالي
  const today = new Date();

  // المواعيد حسب الـ view
  const displayedAppointments = (() => {
    if (selectedView === "day") {
      // يعرض مواعيد اليوم المختار فقط
      const targetDay = selectedDay ?? today.getDate();
      return scheduleBookings
        .filter((b) => {
          const d = new Date(b.date);
          return (
            d.getDate() === targetDay &&
            d.getMonth() === currentDate.getMonth() &&
            d.getFullYear() === currentDate.getFullYear()
          );
        })
        .sort((a, b) => a.slotStart.localeCompare(b.slotStart));
    }

    if (selectedView === "week") {
      // يعرض مواعيد الأسبوع اللي فيه اليوم المختار
      const targetDay = selectedDay ?? today.getDate();
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), targetDay);
      const dayOfWeek = targetDate.getDay();
      const startOfWeek = new Date(targetDate);
      startOfWeek.setDate(targetDate.getDate() - dayOfWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return scheduleBookings
        .filter((b) => {
          const d = new Date(b.date);
          return d >= startOfWeek && d <= endOfWeek;
        })
        .sort((a, b) => {
          const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
          return dateCompare !== 0 ? dateCompare : a.slotStart.localeCompare(b.slotStart);
        });
    }

    // month — كل مواعيد الشهر
    return scheduleBookings.sort((a, b) => {
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
      return dateCompare !== 0 ? dateCompare : a.slotStart.localeCompare(b.slotStart);
    });
  })();

  // ======= Calendar Rendering حسب الـ view =======

  // أيام فيها حجوزات
  const daysWithBookings = new Set(
    scheduleBookings.map((b) => new Date(b.date).getDate())
  );

  // أيام الأسبوع اللي فيه اليوم المختار (للـ week view)
  const weekDaysHighlighted = (() => {
    if (selectedView !== "week") return new Set<number>();
    const targetDay = selectedDay ?? today.getDate();
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), targetDay);
    const dayOfWeek = targetDate.getDay();
    const days = new Set<number>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(targetDate);
      d.setDate(targetDate.getDate() - dayOfWeek + i);
      if (d.getMonth() === currentDate.getMonth()) {
        days.add(d.getDate());
      }
    }
    return days;
  })();

  const weekDayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const monthDays = getDaysInMonth(currentDate);

  const getMonthName = (date: Date) => {
    const months = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
    return months[date.getMonth()];
  };

  const handlePrevMonth = () => {
    setSelectedDay(null);
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDay(null);
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isCurrentMonth =
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  // عنوان panel المواعيد
  const appointmentsPanelTitle = (() => {
    if (selectedView === "day") {
      return selectedDay
        ? `مواعيد ${selectedDay} ${getMonthName(currentDate)}`
        : "مواعيد اليوم";
    }
    if (selectedView === "week") {
      return selectedDay
        ? `أسبوع ${selectedDay} ${getMonthName(currentDate)}`
        : "مواعيد الأسبوع";
    }
    return `مواعيد ${getMonthName(currentDate)}`;
  })();

  // ======= Helpers =======
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed": return "bg-green-100 text-green-700 dark:bg-green-600/20 dark:text-green-400";
      case "Accepted":  return "bg-green-100 text-green-700 dark:bg-green-600/20 dark:text-green-400";
      case "Pending":   return "bg-amber-100 text-amber-700 dark:bg-amber-600/20 dark:text-amber-400";
      case "Cancelled": return "bg-red-100 text-red-700 dark:bg-red-600/20 dark:text-red-400";
      case "Rejected":  return "bg-red-100 text-red-700 dark:bg-red-600/20 dark:text-red-400";
      case "Completed": return "bg-blue-100 text-blue-700 dark:bg-blue-600/20 dark:text-blue-400";
      default:          return "bg-gray-100 text-gray-700 dark:bg-gray-600/20 dark:text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Accepted":  return "مقبول";
      case "Pending":   return "في انتظار";
      case "Cancelled": return "ملغي";
      case "Rejected":  return "مرفوض";
      case "Completed": return "مكتمل";
      default:          return status;
    }
  };

  // ======= Action Handlers =======
  const updateBookingStatus = (bookingId: string, newStatus: string) => {
    setScheduleBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
    );
  };

  const handleAccept = async (bookingId: string) => {
    try {
      setActionLoading(true);
      const token = sessionStorage.getItem("userToken");
      const response = await fetch(
        `https://gearupapp.runasp.net/api/bookings/${bookingId}/accept`,
        { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (!response.ok) throw new Error();
      updateBookingStatus(bookingId, "Accepted");
      setSelectedBooking(prev => prev?.id === bookingId ? { ...prev, status: "Accepted" } : prev);
    } catch (err) {
      console.error("خطأ في قبول الحجز:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      setActionLoading(true);
      const token = sessionStorage.getItem("userToken");
      const response = await fetch(
        `https://gearupapp.runasp.net/api/bookings/${bookingId}/reject`,
        { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (!response.ok) throw new Error();
      updateBookingStatus(bookingId, "Cancelled");
      setSelectedBooking(null);
    } catch (err) {
      console.error("خطأ في رفض الحجز:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (bookingId: string) => {
    try {
      setActionLoading(true);
      const token = sessionStorage.getItem("userToken");
      const response = await fetch(
        `https://gearupapp.runasp.net/api/bookings/${bookingId}/complete`,
        { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (!response.ok) throw new Error();
      updateBookingStatus(bookingId, "Completed");
      setSelectedBooking(prev => prev?.id === bookingId ? { ...prev, status: "Completed" } : prev);
    } catch (err) {
      console.error("خطأ في إكمال الحجز:", err);
    } finally {
      setActionLoading(false);
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
      <main className="flex-1 p-3 md:p-6 lg:p-8 space-y-4 md:space-y-6 w-full overflow-x-hidden">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-6 mt-14 lg:mt-0">
          <div>
            <h1 className={`text-xl md:text-2xl lg:text-3xl font-bold ${!dark ? "text-black" : "text-white"}`}>
              جدول المواعيد
            </h1>
            <p className={`text-sm mt-1 ${!dark ? "text-gray-600" : "text-gray-400"}`}>عرض جدول المواعيد</p>
          </div>
          <div className="flex items-center gap-3 md:gap-4 self-end sm:self-auto">
            <NotificationBell size={25} />
            <ThemeToggle />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* Calendar Section */}
          <div className="lg:col-span-2 space-y-4">

            {/* View Switcher + Navigation */}
            <div className={`rounded-xl p-4 ${!dark ? "bg-white shadow-lg" : "bg-[#0d1629] shadow-2xl shadow-blue-900/20"}`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex gap-2">
                  {["day", "week", "month"].map((view) => (
                    <button
                      key={view}
                      onClick={() => {
                        setSelectedView(view);
                        // لما تغير لـ day أو week، رجّع اليوم الحالي
                        if (view === "day" || view === "week") {
                          setSelectedDay(today.getDate());
                          setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        selectedView === view
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40"
                          : !dark ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-[#131c2f] text-gray-300 hover:bg-[#1a2332]"
                      }`}
                    >
                      {view === "day" ? "اليوم" : view === "week" ? "الأسبوع" : "الشهر"}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={handlePrevMonth} className={`p-2 rounded-lg transition ${!dark ? "bg-gray-100 hover:bg-gray-200" : "bg-[#131c2f] hover:bg-[#1a2332]"}`}>
                    <FaChevronLeft size={16} />
                  </button>
                  <span className="font-semibold text-lg min-w-[150px] text-center">
                    {getMonthName(currentDate)} {currentDate.getFullYear()}
                  </span>
                  <button onClick={handleNextMonth} className={`p-2 rounded-lg transition ${!dark ? "bg-gray-100 hover:bg-gray-200" : "bg-[#131c2f] hover:bg-[#1a2332]"}`}>
                    <FaChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className={`rounded-xl p-6 relative ${!dark ? "bg-white shadow-xl border border-gray-100" : "bg-gradient-to-br from-[#0d1629] to-[#0a1120] shadow-2xl shadow-blue-900/30 border border-blue-900/20"}`}>

              {loadingSchedule && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl z-10">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              <div className="grid grid-cols-7 gap-2 mb-4">
                {weekDayNames.map((day) => (
                  <div key={day} className={`text-center text-sm font-semibold py-2 ${!dark ? "text-gray-600" : "text-gray-400"}`}>
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {monthDays.map((day, index) => {
                  const isSelected = selectedView === "day" && day === selectedDay;
                  const isInWeek = selectedView === "week" && day !== null && weekDaysHighlighted.has(day);
                  const isSelectedWeekDay = selectedView === "week" && day === selectedDay;
                  const isToday = isCurrentMonth && day === today.getDate();

                  return (
                    <div
                      key={index}
                      onClick={() => day && setSelectedDay(day)}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition cursor-pointer relative
                        ${day === null ? "invisible" :
                          isSelected || isSelectedWeekDay
                            ? "bg-blue-600 text-white shadow-xl shadow-blue-600/50 scale-105"
                            : isInWeek
                            ? !dark ? "bg-blue-100 text-blue-700" : "bg-blue-900/30 text-blue-300"
                            : isToday
                            ? "ring-2 ring-blue-500 " + (!dark ? "bg-blue-50 text-blue-600" : "bg-blue-900/20 text-blue-400")
                            : !dark
                            ? "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md"
                            : "bg-[#1a2332] text-gray-300 hover:bg-[#243044]"
                        }`}
                    >
                      {day}
                      {day && daysWithBookings.has(day) && !isSelected && !isSelectedWeekDay && (
                        <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Appointments Panel */}
          <div className={`rounded-xl overflow-hidden ${!dark ? "bg-white shadow-xl border border-gray-100" : "bg-gradient-to-br from-[#0d1629] to-[#0a1120] shadow-2xl shadow-blue-900/30 border border-blue-900/20"}`}>
            <div className={`p-6 border-b ${!dark ? "border-gray-200" : "border-gray-700"}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{appointmentsPanelTitle}</h2>
                {!loadingSchedule && (
                  <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-400 rounded-lg font-medium">
                    {displayedAppointments.length} موعد
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {loadingSchedule && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!loadingSchedule && displayedAppointments.length === 0 && (
                <div className="text-center py-12">
                  <p className={`text-sm ${!dark ? "text-gray-500" : "text-gray-400"}`}>لا توجد مواعيد</p>
                </div>
              )}

              {!loadingSchedule && displayedAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  onClick={() => setSelectedBooking(appointment)}
                  className={`p-4 rounded-lg border transition hover:scale-[1.02] cursor-pointer ${
                    !dark
                      ? "bg-gray-50 border-gray-200 hover:shadow-lg"
                      : "bg-[#131c2f] border-gray-800 hover:shadow-xl hover:shadow-blue-900/20"
                  }`}
                >
                  {/* لو week أو month اعرض التاريخ فوق */}
                  {selectedView !== "day" && (
                    <p className={`text-xs font-semibold mb-2 ${!dark ? "text-blue-600" : "text-blue-400"}`}>
                      {new Date(appointment.date).toLocaleDateString("ar-EG", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{appointment.customerName}</h4>
                      <p className={`text-xs mb-1 ${!dark ? "text-gray-600" : "text-gray-400"}`}>🚗 {appointment.carInfo}</p>
                      <p className={`text-xs ${!dark ? "text-gray-600" : "text-gray-400"}`}>🔧 {appointment.subSpecializationName}</p>
                    </div>
                    <div className="text-left shrink-0">
                      <p className="text-xs font-bold">{appointment.slotStart.slice(0, 5)}</p>
                      <p className={`text-xs ${!dark ? "text-gray-500" : "text-gray-500"}`}>{appointment.slotEnd.slice(0, 5)}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* OVERLAY */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedBooking(null)} />
      )}

      {/* DRAWER */}
      <div
        dir="rtl"
        className={`fixed top-0 left-0 h-full w-full sm:w-[420px] z-50 shadow-2xl transition-transform duration-300 overflow-y-auto
          ${selectedBooking ? "translate-x-0" : "-translate-x-full"}
          ${!dark ? "bg-white" : "bg-[#0d1629]"}
        `}
      >
        <div className={`flex items-center justify-between p-5 border-b ${!dark ? "border-gray-200" : "border-gray-800"}`}>
          <h2 className="text-lg font-bold">تفاصيل الموعد</h2>
          <button
            onClick={() => setSelectedBooking(null)}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition ${!dark ? "hover:bg-gray-100 text-gray-600" : "hover:bg-gray-800 text-gray-400"}`}
          >
            <MdClose size={20} />
          </button>
        </div>

        {selectedBooking && (
          <div className="p-5 space-y-5">
            <div className="flex justify-center">
              <span className={`px-4 py-1.5 rounded-lg text-sm font-bold ${getStatusColor(selectedBooking.status)}`}>
                {getStatusText(selectedBooking.status)}
              </span>
            </div>

            <div className={`rounded-xl p-4 space-y-3 ${!dark ? "bg-gray-50 border border-gray-200" : "bg-[#131c2f] border border-gray-800"}`}>
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${!dark ? "text-gray-500" : "text-gray-400"}`}>بيانات العميل</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {selectedBooking.customerName.charAt(0).toUpperCase()}
                </div>
                <p className="font-semibold text-sm">{selectedBooking.customerName}</p>
              </div>
            </div>

            <div className={`rounded-xl p-4 space-y-1 ${!dark ? "bg-gray-50 border border-gray-200" : "bg-[#131c2f] border border-gray-800"}`}>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${!dark ? "text-gray-500" : "text-gray-400"}`}>تفاصيل الحجز</h3>
              {[
                { label: "السيارة", value: selectedBooking.carInfo, icon: "🚗" },
                { label: "الخدمة", value: selectedBooking.subSpecializationName, icon: "🔧" },
                { label: "التاريخ", value: new Date(selectedBooking.date).toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" }), icon: "📅" },
                { label: "الوقت", value: `${selectedBooking.slotStart.slice(0, 5)} - ${selectedBooking.slotEnd.slice(0, 5)}`, icon: "⏰" },
                { label: "الميكانيكي", value: selectedBooking.mechanicName, icon: "👨‍🔧" },
              ].map(({ label, value, icon }) => (
                <div key={label} className={`flex items-center justify-between py-2 border-b last:border-0 ${!dark ? "border-gray-200" : "border-gray-700"}`}>
                  <span className={`text-sm ${!dark ? "text-gray-500" : "text-gray-400"}`}>{icon} {label}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>

            <div className={`rounded-xl p-4 space-y-1 ${!dark ? "bg-gray-50 border border-gray-200" : "bg-[#131c2f] border border-gray-800"}`}>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${!dark ? "text-gray-500" : "text-gray-400"}`}>سجل الوقت</h3>
              {[
                { label: "تاريخ الإنشاء", value: selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString("ar-EG") : "غير متوفر" },
                { label: "آخر تحديث", value: selectedBooking.updatedAt ? new Date(selectedBooking.updatedAt).toLocaleString("ar-EG") : "—" },
              ].map(({ label, value }) => (
                <div key={label} className={`flex items-center justify-between py-2 border-b last:border-0 ${!dark ? "border-gray-200" : "border-gray-700"}`}>
                  <span className={`text-sm ${!dark ? "text-gray-500" : "text-gray-400"}`}>{label}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>

            {selectedBooking.status === "Pending" && (
              <div className="flex gap-3 pt-2">
                <button onClick={() => handleAccept(selectedBooking.id)} disabled={actionLoading}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50">
                  {actionLoading ? "جاري..." : "✓ موافقة"}
                </button>
                <button onClick={() => handleReject(selectedBooking.id)} disabled={actionLoading}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50">
                  {actionLoading ? "جاري..." : "✕ رفض"}
                </button>
              </div>
            )}

            {selectedBooking.status === "Accepted" && (
              <div className="pt-2">
                <button onClick={() => handleComplete(selectedBooking.id)} disabled={actionLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-50">
                  {actionLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>إكمال الحجز</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;