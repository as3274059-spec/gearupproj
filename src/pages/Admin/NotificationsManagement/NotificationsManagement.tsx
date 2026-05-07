
import React, { useState } from "react";
import AdminSidebar from "../../../components/AdminSidebar/AdminSidebar";
import NotificationBell from "../../../components/NotificationBell/notification_bell";
import { useTheme } from "../../../contexts/ThemeContext";
import ThemeToggle from "../../../components/ThemeToggle/theme_toggle";
import { FaTimes, FaBars } from "react-icons/fa";

const NotificationsManagement: React.FC = () => {
  const { dark } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const notifications = [
    { id: 1, title: "طلب انضمام ميكانيكي جديد", time: "اليوم ، 10:00 صباحاً", statusColor: "bg-green-400" },
    { id: 2, title: "عميل جديد", time: "اليوم ، 10:00 صباحاً", statusColor: "bg-red-400" },
    { id: 3, title: "مشكلة في عملية التسجيل", time: "اليوم ، 10:00 صباحاً", statusColor: "bg-yellow-400" },
  ];

  return (
    <div
      dir="rtl"
      className={`flex min-h-screen w-full transition-colors duration-500 relative
        ${dark ? "bg-primary_BGD" : "bg-white"}`}
    >
      {/* SIDEBAR */}
      <div
        className={`fixed inset-y-0 right-0 z-50 transform transition-transform duration-300
        ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
        lg:relative lg:translate-x-0 lg:flex`}
      >
        <AdminSidebar />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* MAIN */}
      <main className="flex-1 flex flex-col p-4 md:p-10 overflow-y-auto w-full">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-6 gap-2">
          <div className="text-right">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-2xl p-1"
              >
                <FaBars className={dark ? "text-white" : "text-black"} />
              </button>
              <h2 className={`text-xl md:text-3xl font-bold ${dark ? "text-white" : "text-black"}`}>
                إدارة الاشعارات
              </h2>
            </div>
            <p className={`text-xs md:text-sm mt-1 ${dark ? "text-gray-400" : "text-gray-500"}`}>
              إدارة وإرسال التنبيهات على مستوى النظام
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <NotificationBell size={22} />
            <ThemeToggle />
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="flex justify-center md:justify-end mt-4 mb-8 md:mb-12">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-[#137FEC] hover:bg-[#0F6AD1]
            text-white px-8 py-3 rounded-lg font-bold transition-all
            shadow-lg active:scale-95"
          >
            ارسال اشعار جديد
          </button>
        </div>

        {/* NOTIFICATIONS */}
        <div className="w-full space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`relative flex flex-col justify-center p-5 md:p-6
              rounded-xl border transition-all duration-300
              ${dark
                ? "bg-[#137FEC1A] border-[#1E2A44] hover:bg-[#137FEC2A]"
                : "bg-[#EAF4FF] border-[#C6E0FF] hover:bg-[#DCEEFF]"
              }`}
            >
              <div
                className={`absolute right-0 top-1/2 -translate-y-1/2
                w-1 md:w-1.5 h-1/2 md:h-3/5 rounded-l-full ${notif.statusColor}`}
              />
              <div className="pr-4 md:pr-6 text-right">
                <h3 className={`font-bold text-base md:text-xl ${dark ? "text-white" : "text-[#1E3A5F]"}`}>
                  {notif.title}
                </h3>
                <span className={`text-[10px] md:text-xs mt-1 block ${dark ? "text-gray-400" : "text-gray-500"}`}>
                  {notif.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4
          bg-black/40 backdrop-blur-sm">
          
          <div
            className="w-full max-w-2xl rounded-2xl md:rounded-[2.5rem]
            shadow-2xl overflow-hidden transform transition-all
            border border-white/10
            bg-[#137FEC]/35"
            dir="rtl"
          >
            {/* MODAL HEADER */}
            <div className="p-6 md:p-8 pb-4 flex justify-between items-center border-b border-white/10">
              <h3 className="text-xl md:text-3xl font-bold text-white">
                إرسال اشعار جديد
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-2"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-6 md:p-10 space-y-6 md:space-y-8 text-center">
              <div className="space-y-2 md:space-y-4">
                <label className="text-white text-base md:text-lg font-bold block">
                  الأشخاص المستهدفون
                </label>
                <select
                  className="w-full p-4 md:p-5 rounded-xl md:rounded-2xl
                  outline-none text-center appearance-none
                  border-none text-white/60 font-medium
                  bg-[#0A1F3A]/80"
                  onChange={(e) => (e.target.style.color = "white")}
                >
                  <option value="" disabled selected>
                    مثال: المشرفون
                  </option>
                  <option className="bg-[#0A1F3A] text-white">المستخدمين</option>
                  <option className="bg-[#0A1F3A] text-white">الميكانيكيين</option>
                  <option className="bg-[#0A1F3A] text-white">الكل</option>
                </select>
              </div>

              <div className="space-y-2 md:space-y-4">
                <label className="text-white text-base md:text-lg font-bold block">
                  الرسالة
                </label>
                <textarea
                  rows={4}
                  placeholder="اكتب نص الرسالة هنا..."
                  className="w-full p-4 md:p-5 rounded-xl md:rounded-2xl
                  outline-none text-center border-none resize-none
                  text-white placeholder:text-white/40 font-medium
                  bg-[#0A1F3A]/80"
                />
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-6 md:p-8 pt-0 flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full md:w-[140px] py-3 rounded-xl
                text-white font-bold bg-black hover:bg-gray-900
                transition active:scale-95 shadow-lg"
              >
                إلغاء
              </button>
              <button
                className="w-full md:w-[160px] py-3 rounded-xl
                text-white font-bold bg-[#137FEC]
                shadow-lg hover:bg-blue-600
                transition active:scale-95"
              >
                إرسال إشعار
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsManagement;
