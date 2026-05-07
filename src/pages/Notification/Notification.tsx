import { useState } from "react";
import NotificationBell from "../../components/NotificationBell/notification_bell";
import ThemeToggle from "../../components/ThemeToggle/theme_toggle";
import { useTheme } from "../../contexts/ThemeContext";
import MachineSidebar from "../../components/Machine/MachineSidebar";

const Notification = () => {
  const { dark } = useTheme();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "تم قبول طلبك",
      time: "اليوم - 10:00 صباحاً",
      read: true,
    },
    {
      id: 2,
      title: "جاري مراجعة طلبك",
      time: "اليوم - 10:00 صباحاً",
      read: false,
    },
    {
      id: 3,
      title: "لديك رسالة غير مقروءة من علي",
      time: "اليوم - 10:00 صباحاً",
      read: false,
    },
  ]);

  return (
    <div
      dir="rtl"
      className={`flex min-h-screen transition-colors duration-500 ${
        dark ? "bg-[#0B1220] text-white" : "bg-gray-50 text-[#1E3A5F]"
      }`}
    >
      {/* Sidebar */}
      <MachineSidebar />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold">إدارة الإشعارات</h1>

          <div className="flex items-center gap-3">
            <NotificationBell size={20} />
            <ThemeToggle />
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4 max-w-3xl">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() =>
                setNotifications((prev) =>
                  prev.map((n) =>
                    n.id === item.id ? { ...n, read: true } : n
                  )
                )
              }
              className={`
                cursor-pointer p-4 rounded-xl border transition-all duration-200
                ${
                  item.read
                    ? "bg-blue-300/10 border-green-300 text-green-500"
                    : "bg-blue-300/10 border-yellow-300 text-yellow-500"
                }
              `}
            >
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm opacity-70">{item.time}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Notification;
