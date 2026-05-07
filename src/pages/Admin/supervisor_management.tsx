
import React, { useState } from "react";
import { FaPlus, FaBars, FaTimes } from "react-icons/fa";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import NotificationBell from "../../components/NotificationBell/notification_bell";
import ThemeToggle from "../../components/ThemeToggle/theme_toggle";
import { useTheme } from "../../contexts/ThemeContext";
import AddSupervisor from "./add_supervisor";

const SupervisorManagement: React.FC = () => {
  const { dark } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const supervisors = Array.from({ length: 9 });

  return (
    <div dir="rtl" className={`min-h-screen flex transition-colors duration-500 ${dark ? "bg-primary_BGD text-white" : "bg-white text-[#1E3A5F]"}`}>
      
      {/* Sidebar Mobile Wrapper */}
      <div className={`fixed inset-y-0 right-0 z-50 transform ${isSidebarOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 lg:relative lg:translate-x-0 lg:flex shadow-2xl lg:shadow-none`}>
        <AdminSidebar />
        {/* زر إغلاق السايدبار في الموبايل */}
        <button onClick={() => setSidebarOpen(false)} className="absolute left-4 top-4 lg:hidden text-2xl"><FaTimes /></button>
      </div>

      {/* Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 p-4 md:p-8 w-full overflow-x-hidden">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-xl"><FaBars /></button>
            <div>
              <h1 className={`${dark ? "text-white" : "text-black"} text-2xl md:text-3xl font-bold mb-1`}>إدارة المشرفين</h1>
              <p className={`${dark ? "text-white/50" : "text-black/50"} text-xs md:text-sm`}>إدارة الوصول والأذونات لمسؤولي النظام</p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto">
            <NotificationBell  size={22}/>
            <ThemeToggle />
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-4">
          <input
            placeholder="البحث حسب الاسم أو البريد الإلكتروني..."
            className={`w-full h-[45px] px-4 rounded-xl text-sm outline-none transition-colors ${dark ? "bg-[#0E162A] border border-[#1E2A44] text-white" : "bg-[#EEF6FF] border border-[#D6E9FF] text-[#1E3A5F]"}`}
          />
        </div>

        {/* FILTERS & ADD BUTTON */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-6 gap-4">
          <select className={`h-[45px] px-4 rounded-xl text-sm outline-none ${dark ? "bg-[#0E162A] border border-[#1E2A44]" : "bg-[#EEF6FF] border border-[#D6E9FF]"}`}>
            <option>الحالة: نشط</option>
            <option>الحالة: معطل</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-[#137FEC] hover:bg-[#0F6AD1] text-white px-5 py-3 rounded-xl text-sm transition font-bold"
          >
            <FaPlus />
            إضافة مسؤول جديد
          </button>
        </div>

        {/* CONTENT - TABLE ON DESKTOP, CARDS ON MOBILE */}
        <div className={`rounded-2xl overflow-hidden border ${dark ? "bg-[#0E162A] border-[#1E2A44]" : "bg-white border-[#E3EEFF]"}`}>
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`${dark ? "bg-primary_BGD text-white/60" : "bg-[#EAF4FF] text-[#5C7AA5]"}`}>
                <tr>
                  <th className="py-4 px-4 text-right">الاسم</th>
                  <th className="py-4 px-4 text-right">البريد</th>
                  <th className="py-4 px-4 text-right">الحالة</th>
                  <th className="py-4 px-4 text-right">آخر تسجيل دخول</th>
                  <th className="py-4 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {supervisors.map((_, i) => (
                  <tr key={i} className={`border-t ${dark ? "border-[#1E2A44] hover:bg-[#111B34]" : "border-[#E3EEFF] hover:bg-[#F5F9FF]"}`}>
                    <td className="px-4 py-4 font-medium">Jane Cooper</td>
                    <td className="px-4 py-4 opacity-70">alex.j@gearup.ai</td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${i === 1 ? "bg-red-500/15 text-red-500" : "bg-green-500/15 text-green-500"}`}>
                        {i === 1 ? "معطل" : "نشط"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs opacity-70">2023-10-27</td>
                    <td className="px-4 py-4 text-center cursor-pointer">•••</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-[#1E2A44]/20">
            {supervisors.map((_, i) => (
              <div key={i} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">Jane Cooper</h3>
                    <p className="text-xs opacity-60">alex.j@gearup.ai</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${i === 1 ? "bg-red-500/15 text-red-500" : "bg-green-500/15 text-green-500"}`}>
                    {i === 1 ? "معطل" : "نشط"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="opacity-50 text-xs">آخر تسجيل: 2023-10-27</span>
                  <button className="text-lg">•••</button>
                </div>
              </div>
            ))}
          </div>
          
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between mt-8 gap-4 text-sm text-center">
  <span className={dark ? "text-white/50" : "text-[#0F132380]/50"}>
    عرض 1 إلى 5 من 2,345 مستخدم
  </span>

  <div className="flex gap-2 flex-row-reverse">
    {["1", "2", "3", "…", "10"].map((item, idx) => (
      <button
        key={idx}
        className={`
          w-8 h-8 rounded-lg flex items-center justify-center font-semibold transition-opacity
          ${item === "…" 
            ? "cursor-default text-gray-400" 
            : "hover:opacity-80 text-black bg-[#0F13231A] dark:text-white dark:bg-[#FFFFFF1A]"
          }
        `}
      >
        {item}
      </button>
    ))}
  </div>
</div>
      </main>

      {showAddModal && <AddSupervisor onClose={() => setShowAddModal(false)} dark={dark} />}
    </div>
  );
};

export default SupervisorManagement;