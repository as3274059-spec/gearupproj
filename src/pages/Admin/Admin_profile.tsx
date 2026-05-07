import { useState } from "react";
import NotificationBell from "../../components/NotificationBell/notification_bell";
import ThemeToggle from "../../components/ThemeToggle/theme_toggle";
import { useTheme } from "../../contexts/ThemeContext";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import Personaladmintab from "./Personaladmintab";
import Securityadmintab from  "./Securityadmintab";

const tabs = [
  { id: "personal",   label: "البيانات الشخصية" },

  { id: "security",   label: "الأمان"            },
];

const Mprofile = () => {
  const { dark } = useTheme();
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div
      dir="rtl"
      className={`flex min-h-screen transition-colors duration-500 ${
        !dark ? "bg-gray-50 text-[#1E3A5F]" : "bg-[#0B1220] text-white"
      }`}
    >
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-w-0 p-3 sm:p-5 md:p-6 lg:p-8 space-y-4 md:space-y-6 overflow-x-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between mt-14 lg:mt-0 gap-3">
          <h1 className={`text-2xl sm:text-2xl md:text-3xl lg:text-3xl font-bold ${!dark ? "text-black" : "text-white"}`}>
            ملفك الشخصي
          </h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell size={28} />
            <ThemeToggle />
          </div>
        </div>

        {/* TABS — scroll أفقي على موبايل */}
        <div className="overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex gap-2 min-w-max sm:flex-wrap sm:min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-5 sm:px-6 py-2.5 sm:py-2.5 rounded-xl text-sm sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40"
                    : !dark
                    ? "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    : "bg-[#0d1629] text-gray-300 hover:bg-[#131c2f] border border-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="w-full max-w-4xl">
          {activeTab === "personal"   && <Personaladmintab />}
          {activeTab === "security"   && <Securityadmintab />}
        </div>

      </main>
    </div>
  );
};

export default Mprofile;