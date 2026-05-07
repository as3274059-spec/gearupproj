
import React, { useState } from "react";
import AdminSidebar from "../../../components/AdminSidebar/AdminSidebar";
import NotificationBell from "../../../components/NotificationBell/notification_bell";
import ThemeToggle from "../../../components/ThemeToggle/theme_toggle";
import { useTheme } from "../../../contexts/ThemeContext";
import { FaEllipsisH } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const CitiesManagement: React.FC = () => {
  const { dark } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div
      className={`flex min-h-screen ${dark ? "bg-[#0F1323]" : "bg-white"} relative`}
      dir="rtl"
    >
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN */}
      <main className="flex-1 px-4 md:px-10 pt-4">
        {/* TOP BAR */}
        <div className="flex justify-end items-center gap-4 mb-8 mt-6">
          <NotificationBell size={22} />
          <ThemeToggle />
        </div>

        {/* TITLE */}
        <div className="mb-8 text-right -mt-6 md:-mt-20">
          <h1 className={`text-3xl md:text-4xl font-bold ${dark ? "text-white" : "text-[#0B2545]"}`}>
            إدارة المدن
          </h1>
          <p className={`mt-1 text-sm md:text-base ${dark ? "text-gray-400" : "text-gray-500"}`}>
            إدارة مناطق الخدمة والتوافر الإقليمي
          </p>
        </div>

        {/* ADD BUTTON */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#137FEC] hover:bg-[#0F6AD1] text-white px-6 py-2 rounded-lg font-medium transition"
          >
            إضافة مدينة جديدة
          </button>
        </div>

        {/* TABLE CARD */}
        <div
          className={`rounded-2xl overflow-hidden transition-colors border ${
            dark ? "bg-[#0B1020] border-[#1E2A44]" : "bg-white border-[#D6E9FF]"
          }`}
        >
          {/* TABLE HEADER */}
          <div
            className={`hidden md:grid grid-cols-4 px-6 py-4 text-sm font-medium ${
              dark ? "text-gray-300 border-b border-[#1E2A44]" : "text-[#5C7AA5] bg-[#EAF4FF] border-b border-[#D6E9FF]"
            }`}
          >
            <span>المنطقة/الولاية</span>
            <span className="text-center">آخر تحديث</span>
            <span className="text-center">حالة</span>
            <span className="text-center">الإجراءات</span>
          </div>

          {/* TABLE ROWS */}
          <div className="overflow-x-auto">
            <div className={`grid grid-cols-4 items-center px-6 py-4 text-sm transition ${dark ? "text-white hover:bg-[#111B34]" : "text-[#0B2545] hover:bg-[#F2F8FF]"}`}>
              <span>أوستن</span>
              <span className="text-center text-gray-400">Oct 24, 2023</span>
              <div className="flex justify-center">
                <span className="px-4 py-1 text-xs font-medium rounded-full bg-[#0BDA651A] text-[#0BDA65]">
                  نشط
                </span>
              </div>
              <div className="flex justify-center">
                <button className={`w-8 h-8 flex items-center justify-center rounded-full ${dark ? "hover:bg-[#1E2A44]" : "hover:bg-[#EAF4FF]"}`}>
                  <FaEllipsisH />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0,0,0,0.1)" }}
        >
          <div
            className="w-full max-w-lg md:max-w-2xl rounded-3xl overflow-hidden shadow-2xl transition-all"
            dir="rtl"
            style={{ backgroundColor: "rgba(19,127,236,0.3)" }}
          >
            {/* HEADER */}
            <div className="p-6 md:p-8 pb-4 text-center relative border-b border-white/10">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute left-4 top-4 text-white/80 hover:text-white"
              >
                <IoMdClose size={28} />
              </button>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                إضافة مدينة جديدة
              </h2>
              <p className="text-white/70 text-sm md:text-base mt-2">
                قم بإنشاء مدينة جديدة
              </p>
            </div>

            {/* BODY */}
            <div className="p-6 md:p-10 space-y-6 md:space-y-8">
              <div className="text-center">
                <label className="block text-white mb-2 text-base md:text-lg font-medium">
                  اسم المدينة
                </label>
                <input
                  type="text"
                  placeholder="مثال : قنا"
                  className={`w-full p-4 md:p-5 rounded-xl text-center outline-none
                    ${dark ? "placeholder:text-[#137FEC9C] text-white" : "placeholder:text-[#137FEC9C] text-[#0B4C8C]"}`}
                  style={{ backgroundColor: "rgba(15,19,35,0.5)" }}
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-6 md:p-8 pt-0 flex flex-col md:flex-row-reverse gap-4 justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full md:w-[160px] py-4 rounded-xl text-white font-medium hover:bg-black/30 transition"
                style={{ backgroundColor: "#0F1323" }}
              >
                إلغاء
              </button>
              <button
                className="w-full md:w-[160px] py-4 rounded-xl text-white font-medium hover:bg-blue-600 transition shadow-lg"
                style={{ backgroundColor: "#137FEC" }}
              >
                إضافة مدينة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitiesManagement;
