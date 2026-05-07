import React, { useState , useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaClipboardList,
  FaCog,
  FaCalendarAlt,
  FaSignOutAlt,
  FaRegCommentDots,
  FaTools
} from "react-icons/fa";
import { MdDashboard, MdMenu, MdClose } from "react-icons/md";
import { useTheme } from "../../contexts/ThemeContext";

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  dark: boolean;
  to?: string;
  closeSidebar: () => void;
};

const MachineSidebar: React.FC = () => {
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("...");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // جيب اسم المستخدم من الـ API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem("userToken");
        if (!token) return;
        const res = await fetch("https://gearupapp.runasp.net/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setUserName(`${data.firstName || ""} ${data.lastName || ""}`.trim());
        setPhotoUrl(data.profilePhotoUrl || null);
      } catch {
        // لو فشل يفضل الاسم الافتراضي
      }
    };
    fetchProfile();
  }, []);

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-5 right-5 z-50 p-2 bg-[#137FEC] text-white rounded-lg shadow-lg"
      >
        {isOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggleSidebar}></div>
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-40 w-72 flex flex-col justify-between p-6 transition-all duration-300 ease-in-out
          ${dark ? "bg-primary_BGD text-white" : "bg-white text-[#1E3A5F]"}
          ${isOpen ? "translate-x-0" : "translate-x-full"} 
          lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen shadow-2xl lg:shadow-none`}
        dir="rtl"
      >
        <div className="flex flex-col h-full overflow-hidden">
          <h1 className={`text-2xl font-bold mb-10 ${dark ? "text-white" : "text-black"} text-center flex-shrink-0`}>
            GearUp
          </h1>

          <nav className="space-y-2 text-lg overflow-y-auto flex-1 pr-2 custom-scrollbar">
            <SidebarItem icon={<MdDashboard />} label="لوحة التحكم" dark={dark} to="/mechanics/machinedashboard" closeSidebar={() => setIsOpen(false)} />
            <SidebarItem icon={<FaTools />} label="طلبات الصيانة" dark={dark} to="/mechanics/request/mrequest_history" closeSidebar={() => setIsOpen(false)} />
            <SidebarItem icon={<FaCalendarAlt />} label="جدول المواعيد" dark={dark} to="/mechanics/schedule" closeSidebar={() => setIsOpen(false)} />
            <SidebarItem icon={<FaClipboardList />} label="الحجوزات" dark={dark} to="/mechanics/booking" closeSidebar={() => setIsOpen(false)} />
            <SidebarItem icon={<FaRegCommentDots />} label="المراجعات" dark={dark} to="/mechanics/reviewing" closeSidebar={() => setIsOpen(false)} />
          </nav>

          <div
            className={`rounded-2xl p-4 mt-6 flex-shrink-0 transition-colors duration-500
              ${dark ? "bg-[#137FEC1A] border-t border-[#137FEC]" : "bg-[#EAF4FF] border-t border-[#C6E0FF]"}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <img
                src={photoUrl || "/avatar-path.png"}
                alt="mechanic"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="overflow-hidden">
                <p className="font-semibold text-sm truncate">{userName}</p>
                <p className={`text-[10px] ${dark ? "text-white/50" : "text-[#5C7AA5]"}`}>ميكانيكي</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => { navigate("/mechanics/mprofile"); setIsOpen(false); }}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm transition-all
                  ${dark ? "bg-[#1E2A44] text-white hover:bg-[#2A3A5B]" : "bg-[#DCEEFF] text-[#1E3A5F] hover:bg-[#CFE6FF]"}`}
              >
                <FaCog /> الملف الشخصي
              </button>
              <button
                onClick={() => {
                  sessionStorage.removeItem("userToken");
                  localStorage.removeItem("token");
                  localStorage.removeItem("userType");
                  navigate("/");
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm transition-all
                  ${dark ? "bg-[#0B1020] text-red-500 hover:bg-[#1A1F2D]" : "bg-[#F2F8FF] text-red-600 hover:bg-[#E4F0FF]"}`}
              >
                <FaSignOutAlt /> تسجيل خروج
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, dark, to, closeSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // const isActive = to ? location.pathname === to : false;
  const isActive = to ? location.pathname.startsWith(to) : false;

  return (
    <div
      onClick={() => { if (to) { navigate(to); closeSidebar(); } }}
      className={`group flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-all duration-200
        ${dark
          ? `text-gray-300 ${isActive ? "bg-[#137FEC1A] text-white" : "hover:bg-[#137FEC1A] hover:text-white"}`
          : `text-black ${isActive ? "bg-[#EAF4FF] text-[#137FEC]" : "hover:bg-[#EAF4FF] hover:text-[#137FEC]"}`
        }`}
    >
      <span className={`text-lg transition-colors ${isActive ? "text-[#137FEC]" : "group-hover:text-[#137FEC]"}`}>
        {icon}
      </span>
      <span className={`whitespace-nowrap transition-colors ${isActive ? "text-[#137FEC]" : "group-hover:text-[#137FEC]"}`}>
        {label}
      </span>
    </div>
  );
};

export default MachineSidebar;