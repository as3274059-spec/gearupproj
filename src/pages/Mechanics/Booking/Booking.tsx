import { useState, useEffect, useRef } from "react";
import NotificationBell from "../../../components/NotificationBell/notification_bell";
import ThemeToggle from "../../../components/ThemeToggle/theme_toggle";
import { useTheme } from "../../../contexts/ThemeContext";
import MachineSidebar from "../../../components/Machine/MachineSidebar";
import { FaSearch } from "react-icons/fa";
import { MdMoreVert } from "react-icons/md";

// Types
interface Booking {
  id: string;
  customerId: string;
  mechanicId: string;
  carId: string;
  subSpecializationId: string;
  customerName: string;
  mechanicName: string;
  carInfo: string;
  subSpecializationName: string;
  date: string;
  slotStart: string;
  slotEnd: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

const Booking = () => {
  const { dark } = useTheme();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Fetch all bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = sessionStorage.getItem("userToken");
        const response = await fetch(
          "https://gearupapp.runasp.net/api/bookings/mechanic/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok)
          throw new Error(`فشل في تحميل البيانات (${response.status})`);
        const data: Booking[] = await response.json();
        setAllBookings(data);
      } catch (err: any) {
        setError(err.message || "حدث خطأ أثناء تحميل الحجوزات");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const statusMap: Record<string, { label: string; tabLabel: string }> = {
    Pending: { label: "انتظار", tabLabel: "انتظار" },
    Confirmed: { label: "موافقة", tabLabel: "موافقة" },
    Accepted: { label: "موافقة", tabLabel: "موافقة" },
    Cancelled: { label: "ملغي", tabLabel: "ملغي" },
    Rejected: { label: "مرفوض", tabLabel: "مرفوض" },
    Completed: { label: "مكتمل", tabLabel: "مكتمل" },
  };

  const uniqueStatuses = [...new Set(allBookings.map((b) => b.status))];

  const getCount = (status: string) => {
    if (status === "all") return allBookings.length;
    return allBookings.filter((b) => b.status === status).length;
  };

  const tabs = [
    { id: "all", label: "الجميع", count: getCount("all") },
    ...uniqueStatuses.map((s) => ({
      id: s,
      label: statusMap[s]?.tabLabel || s,
      count: getCount(s),
    })),
  ];

  const formatDateTime = (
    date: string,
    slotStart: string,
    slotEnd: string
  ) => {
    const d = new Date(date);
    const formattedDate = d.toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "short",
    });
    return `${formattedDate}، ${slotStart.slice(0, 5)} - ${slotEnd.slice(0, 5)}`;
  };

  const filteredBookings = allBookings
    .filter((booking) => {
      const matchesTab = activeTab === "all" || booking.status === activeTab;
      const matchesSearch =
        booking.customerName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.carInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.subSpecializationName.includes(searchTerm);
      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.slotStart}`).getTime();
      const dateB = new Date(`${b.date}T${b.slotStart}`).getTime();
      return dateB - dateA;
    });

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // View Details
  const handleViewDetails = async (bookingId: string) => {
    setDrawerLoading(true);
    setSelectedBooking(null);
    try {
      const token = sessionStorage.getItem("userToken");
      const response = await fetch(
        `https://gearupapp.runasp.net/api/bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("فشل في جلب التفاصيل");
      const data = await response.json();
      setSelectedBooking(data);
    } catch (err) {
      console.error("خطأ:", err);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleAccept = async (bookingId: string) => {
    try {
      const token = sessionStorage.getItem("userToken");
      const response = await fetch(
        `https://gearupapp.runasp.net/api/bookings/${bookingId}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("فشل في قبول الحجز");
      setAllBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "Confirmed" } : b
        )
      );
    } catch (err) {
      console.error("خطأ في قبول الحجز:", err);
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      const token = sessionStorage.getItem("userToken");
      const response = await fetch(
        `https://gearupapp.runasp.net/api/bookings/${bookingId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("فشل في رفض الحجز");
      setAllBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "Cancelled" } : b
        )
      );
    } catch (err) {
      console.error("خطأ في رفض الحجز:", err);
    }
  };

  // ✅ دالة إكمال الحجز - الجديدة
  const handleComplete = async (bookingId: string) => {
    try {
      const token = sessionStorage.getItem("userToken");
      const response = await fetch(
        `https://gearupapp.runasp.net/api/bookings/${bookingId}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("فشل في إكمال الحجز");
      setAllBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "Completed" } : b
        )
      );
      // تحديث الـ selectedBooking لو مفتوح
      setSelectedBooking((prev) =>
        prev && prev.id === bookingId ? { ...prev, status: "Completed" } : prev
      );
    } catch (err) {
      console.error("خطأ في إكمال الحجز:", err);
    }
  };

  const getStatusBadge = (status: string) => {
    const colorMap: Record<string, string> = {
      Pending:
        "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
      Confirmed:
        "bg-green-100 text-green-700 dark:bg-green-600/20 dark:text-green-400",
      Accepted:
        "bg-green-100 text-green-700 dark:bg-green-600/20 dark:text-green-400",
      Cancelled:
        "bg-rose-100 text-rose-800 dark:bg-red-600/20 dark:text-red-400",
      Rejected:
        "bg-red-100 text-red-700 dark:bg-red-600/20 dark:text-red-400",
      Completed:
        "bg-sky-100 text-sky-800 dark:bg-blue-600/20 dark:text-blue-400",
    };

    const displayLabel = statusMap[status]?.label || status;

    return (
      <span
        className={`inline-block px-2.5 md:px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
          colorMap[status] || "bg-gray-600/20 text-gray-400"
        }`}
      >
        {displayLabel}
      </span>
    );
  };

  const getStatusButton = (status: string, bookingId: string) => {
    return (
      <ActionMenu
        status={status}
        bookingId={bookingId}
        isOpen={openMenuId === bookingId}
        onToggle={() =>
          setOpenMenuId(openMenuId === bookingId ? null : bookingId)
        }
        onClose={() => setOpenMenuId(null)}
        onView={handleViewDetails}
        onAccept={handleAccept}
        onReject={handleReject}
        onComplete={handleComplete} // ✅ تمرير الدالة الجديدة
      />
    );
  };

  if (loading) {
    return (
      <div
        dir="rtl"
        className={`flex min-h-screen ${!dark ? "bg-gray-50" : "bg-[#0B1220]"}`}
      >
        <MachineSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className={!dark ? "text-gray-600" : "text-gray-400"}>
              جاري تحميل الحجوزات...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div
        dir="rtl"
        className={`flex min-h-screen ${!dark ? "bg-gray-50" : "bg-[#0B1220]"}`}
      >
        <MachineSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-red-500 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              إعادة المحاولة
            </button>
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
      <MachineSidebar />
      <main className="flex-1 p-3 md:p-6 lg:p-8 space-y-4 md:space-y-6 w-full overflow-x-hidden">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-6 mt-14 lg:mt-0">
          <h1
            className={`text-xl md:text-2xl lg:text-3xl font-bold ${
              !dark ? "text-black" : "text-white"
            }`}
          >
            الحجوزات
          </h1>
          <div className="flex items-center gap-3 md:gap-4 self-end sm:self-auto">
            <NotificationBell size={25} />
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
          <FaSearch
            className={`text-base md:text-lg ${
              !dark ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <input
            type="text"
            placeholder="البحث حسب العميل أو السيارة أو الخدمة..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className={`flex-1 bg-transparent outline-none text-sm md:text-base ${
              !dark ? "text-gray-900" : "text-white"
            } placeholder-gray-500`}
          />
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-2 md:gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : !dark
                  ? "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  : "bg-[#0d1629] text-gray-300 hover:bg-[#131c2f] border border-gray-800"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* EMPTY */}
        {filteredBookings.length === 0 && (
          <div
            className={`text-center py-16 rounded-xl ${
              !dark ? "bg-white" : "bg-[#0d1629]"
            }`}
          >
            <p className={!dark ? "text-gray-500" : "text-gray-400"}>
              لا توجد حجوزات
            </p>
          </div>
        )}

        {/* TABLE - Desktop */}
        {filteredBookings.length > 0 && (
          <div
            className={`hidden md:block rounded-xl overflow-hidden ${
              !dark ? "bg-white shadow-xl" : "bg-[#0d1629]"
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr
                    className={`text-right text-xs lg:text-sm ${
                      !dark
                        ? "bg-gray-50 text-gray-700"
                        : "bg-[#131c2f] text-gray-300"
                    }`}
                  >
                    <th className="p-3 lg:p-4 font-semibold">عميل</th>
                    <th className="p-3 lg:p-4 font-semibold">السيارة</th>
                    <th className="p-3 lg:p-4 font-semibold">الحالة</th>
                    <th className="p-3 lg:p-4 font-semibold">خدمة</th>
                    <th className="p-3 lg:p-4 font-semibold">التاريخ والوقت</th>
                    <th className="p-3 lg:p-4 font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className={`border-b transition-colors ${
                        !dark
                          ? "border-gray-200 hover:bg-gray-50"
                          : "border-gray-800 hover:bg-[#131c2f]"
                      }`}
                    >
                      <td className="p-3 lg:p-4 font-medium text-xs lg:text-sm">
                        {booking.customerName}
                      </td>
                      <td
                        className={`p-3 lg:p-4 text-xs lg:text-sm ${
                          !dark ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        {booking.carInfo}
                      </td>
                      <td className="p-3 lg:p-4">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td
                        className={`p-3 lg:p-4 text-xs lg:text-sm ${
                          !dark ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        {booking.subSpecializationName}
                      </td>
                      <td
                        className={`p-3 lg:p-4 text-xs lg:text-sm ${
                          !dark ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        {formatDateTime(
                          booking.date,
                          booking.slotStart,
                          booking.slotEnd
                        )}
                      </td>
                      <td className="p-3 lg:p-4">
                        {getStatusButton(booking.status, booking.id)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* PAGINATION */}
            <div
              className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t ${
                !dark ? "border-gray-200" : "border-gray-800"
              }`}
            >
              <p
                className={`text-xs md:text-sm ${
                  !dark ? "text-gray-600" : "text-gray-400"
                }`}
              >
                عرض {(currentPage - 1) * itemsPerPage + 1} إلى{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredBookings.length
                )}{" "}
                من {filteredBookings.length} حجز
              </p>
              <div className="flex gap-2">
                {Array.from(
                  { length: totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg text-xs md:text-sm font-medium transition ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : !dark
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-[#131c2f] text-gray-300 hover:bg-[#1a2332]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CARDS - Mobile */}
        {filteredBookings.length > 0 && (
          <div className="md:hidden space-y-3">
            {paginatedBookings.map((booking) => (
              <div
                key={booking.id}
                className={`p-4 rounded-xl ${
                  !dark
                    ? "bg-white shadow-md border border-gray-200"
                    : "bg-[#0d1629] border border-gray-800"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-sm mb-1">
                      {booking.customerName}
                    </h3>
                    <p
                      className={`text-xs ${
                        !dark ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {booking.carInfo}
                    </p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span
                      className={
                        !dark ? "text-gray-600" : "text-gray-400"
                      }
                    >
                      الخدمة:
                    </span>
                    <span className="font-medium">
                      {booking.subSpecializationName}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span
                      className={
                        !dark ? "text-gray-600" : "text-gray-400"
                      }
                    >
                      الموعد:
                    </span>
                    <span className="font-medium">
                      {formatDateTime(
                        booking.date,
                        booking.slotStart,
                        booking.slotEnd
                      )}
                    </span>
                  </div>
                </div>
                {getStatusButton(booking.status, booking.id)}
              </div>
            ))}
            <div className="flex justify-center gap-2 mt-4">
              {Array.from(
                { length: totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : !dark
                      ? "bg-white text-gray-700 border border-gray-200"
                      : "bg-[#131c2f] text-gray-300 border border-gray-800"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* OVERLAY */}
      {(selectedBooking || drawerLoading) && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSelectedBooking(null)}
        />
      )}

      {/* DRAWER */}
      <div
        dir="rtl"
        className={`fixed top-0 left-0 h-full w-full sm:w-[420px] z-50 shadow-2xl transition-transform duration-300 overflow-y-auto
          ${selectedBooking || drawerLoading ? "translate-x-0" : "-translate-x-full"}
          ${!dark ? "bg-white" : "bg-[#0d1629]"}
        `}
      >
        {/* Drawer Header */}
        <div
          className={`flex items-center justify-between p-5 border-b ${
            !dark ? "border-gray-200" : "border-gray-800"
          }`}
        >
          <h2 className="text-lg font-bold">تفاصيل الحجز</h2>
          <button
            onClick={() => setSelectedBooking(null)}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition ${
              !dark
                ? "hover:bg-gray-100 text-gray-600"
                : "hover:bg-gray-800 text-gray-400"
            }`}
          >
            ✕
          </button>
        </div>

        {/* Drawer Loading */}
        {drawerLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Drawer Content */}
        {selectedBooking && !drawerLoading && (
          <div className="p-5 space-y-5">
            <div className="flex justify-center">
              {getStatusBadge(selectedBooking.status)}
            </div>

            {/* Customer */}
            <div
              className={`rounded-xl p-4 space-y-3 ${
                !dark
                  ? "bg-gray-50 border border-gray-200"
                  : "bg-[#131c2f] border border-gray-800"
              }`}
            >
              <h3
                className={`text-xs font-semibold uppercase tracking-wider ${
                  !dark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                بيانات العميل
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {selectedBooking.customerName
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {selectedBooking.customerName}
                  </p>
                  <p
                    className={`text-xs ${
                      !dark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    عميل
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div
              className={`rounded-xl p-4 space-y-1 ${
                !dark
                  ? "bg-gray-50 border border-gray-200"
                  : "bg-[#131c2f] border border-gray-800"
              }`}
            >
              <h3
                className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                  !dark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                تفاصيل الحجز
              </h3>
              {[
                {
                  label: "السيارة",
                  value: selectedBooking.carInfo,
                  icon: "🚗",
                },
                {
                  label: "الخدمة",
                  value: selectedBooking.subSpecializationName,
                  icon: "🔧",
                },
                {
                  label: "التاريخ",
                  value: new Date(
                    selectedBooking.date
                  ).toLocaleDateString("ar-EG", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                  icon: "📅",
                },
                {
                  label: "الوقت",
                  value: `${selectedBooking.slotStart.slice(0, 5)} - ${selectedBooking.slotEnd.slice(0, 5)}`,
                  icon: "⏰",
                },
                {
                  label: "الميكانيكي",
                  value: selectedBooking.mechanicName,
                  icon: "👨‍🔧",
                },
              ].map(({ label, value, icon }) => (
                <div
                  key={label}
                  className={`flex items-center justify-between py-2 border-b last:border-0 ${
                    !dark ? "border-gray-200" : "border-gray-700"
                  }`}
                >
                  <span
                    className={`text-sm ${
                      !dark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {icon} {label}
                  </span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>

            {/* Timestamps */}
            <div
              className={`rounded-xl p-4 space-y-1 ${
                !dark
                  ? "bg-gray-50 border border-gray-200"
                  : "bg-[#131c2f] border border-gray-800"
              }`}
            >
              <h3
                className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                  !dark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                سجل الوقت
              </h3>
              {[
                {
                  label: "تاريخ الإنشاء",
                  value: new Date(
                    selectedBooking.createdAt
                  ).toLocaleString("ar-EG"),
                },
                {
                  label: "آخر تحديث",
                  value: selectedBooking.updatedAt
                    ? new Date(
                        selectedBooking.updatedAt
                      ).toLocaleString("ar-EG")
                    : "—",
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className={`flex items-center justify-between py-2 border-b last:border-0 ${
                    !dark ? "border-gray-200" : "border-gray-700"
                  }`}
                >
                  <span
                    className={`text-sm ${
                      !dark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>

            {/* ✅ أزرار الإجراءات حسب الحالة */}
            {selectedBooking.status === "Pending" && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    handleAccept(selectedBooking.id);
                    setSelectedBooking((prev) =>
                      prev
                        ? { ...prev, status: "Confirmed" }
                        : null
                    );
                  }}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition"
                >
                  ✓ موافقة
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedBooking.id);
                    setSelectedBooking(null);
                  }}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition"
                >
                  ✕ رفض
                </button>
              </div>
            )}

            {/* ✅ زر إكمال الحجز - يظهر فقط لما الحالة Confirmed أو Accepted */}
            {(selectedBooking.status === "Confirmed" ||
              selectedBooking.status === "Accepted") && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    handleComplete(selectedBooking.id);
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  إكمال الحجز
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;

// ✅ كومبوننت القائمة مع إضافة زر إكمال الحجز
const ActionMenu = ({
  status,
  bookingId,
  onView,
  onAccept,
  onReject,
  onComplete,
}: any) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const closeAll = () => setOpen(false);
    window.addEventListener("closeAllMenus", closeAll);
    return () => window.removeEventListener("closeAllMenus", closeAll);
  }, []);

  const handleToggle = () => {
    window.dispatchEvent(new Event("closeAllMenus"));
    setOpen((prev) => !prev);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10"
      >
        <MdMoreVert size={18} />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-40 bg-white dark:bg-[#1E293B] border dark:border-gray-700 rounded-lg shadow-lg z-50">
          <button
            onClick={() => {
              onView(bookingId);
              setOpen(false);
            }}
            className="block w-full text-right px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-white/10 rounded-t-lg"
          >
            عرض
          </button>

          {status === "Pending" && (
            <>
              <button
                onClick={() => {
                  onAccept(bookingId);
                  setOpen(false);
                }}
                className="block w-full text-right px-4 py-2.5 text-sm text-green-600 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                ✓ موافقة
              </button>

              <button
                onClick={() => {
                  onReject(bookingId);
                  setOpen(false);
                }}
                className="block w-full text-right px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-white/10 rounded-b-lg"
              >
                ✕ رفض
              </button>
            </>
          )}

          {/* ✅ زر إكمال الحجز في المنيو - يظهر فقط لما الحالة Confirmed أو Accepted */}
          {(status === "Confirmed" || status === "Accepted") && (
            <button
              onClick={() => {
                onComplete(bookingId);
                setOpen(false);
              }}
              className="block w-full text-right px-4 py-2.5 text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-white/10 rounded-b-lg font-medium"
            >
              ✅ إكمال الحجز
            </button>
          )}
        </div>
      )}
    </div>
  );
};