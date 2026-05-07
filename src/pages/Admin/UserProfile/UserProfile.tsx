

import React from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import AdminSidebar from "../../../components/AdminSidebar/AdminSidebar";

const UserProfile: React.FC = () => {
  const { dark } = useTheme();

  const bgColor = dark ? "bg-primary_BGD" : "bg-white"; 
  const cardBg = bgColor; 
  const borderColor = "border-[#137FEC]"; 
  const mainTextColor = dark ? "text-white" : "text-black";
  const carCardBg = dark ? "bg-[#137FEC1A]" : "bg-[#137FEC33]"; 
  const carNameColor = dark ? "text-white" : "text-black";

  return (
    <div className={`flex flex-col lg:flex-row min-h-screen transition-colors duration-500 ${bgColor}`} dir="rtl">
      
      {/* SIDEBAR WRAPPER */}
      <div className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen z-40">
        <AdminSidebar />
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 w-full overflow-x-hidden">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <h2 className={`text-xl md:text-2xl font-bold ${mainTextColor} leading-tight`}>
              إدارة المستخدمين /{" "}
              <span className={`${dark ? "text-white/70" : "text-black/70"} text-sm md:text-xl font-medium`}>
                الملف الشخصي
              </span>{" "}
              <div className="block sm:inline mt-1 sm:mt-0 sm:mr-2 text-[#137FEC] font-extrabold truncate">
                John Doe
              </div>
            </h2>
          </div>
        </div>

        <div className="max-w-6xl space-y-6">
        {/* personal Info */}
          <section className={`rounded-2xl md:rounded-3xl border ${borderColor} ${cardBg} p-5 md:p-8 relative shadow-sm`}>
            <h3 className={`text-base md:text-lg font-bold mb-2 text-right pr-2 ${mainTextColor}`}>
              البيانات الشخصية الأساسية
            </h3>
            <div className={`w-full h-[1px] ${dark ? 'bg-white/10' : 'bg-[#137FEC33]'} mb-8`}></div>

            <div className="flex justify-center mb-8 md:mb-10">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-[#137FEC]/20 overflow-hidden shadow-lg bg-gray-100">
                <img 
                  src="/userProfile.png" 
                  alt="User Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <ProfileInput label="الاسم الكامل" dark={dark} />
              <ProfileInput label="رقم الهاتف" dark={dark} />
              <ProfileInput label="البريد الإلكتروني" dark={dark} />
              <ProfileInput label="العنوان بالتفصيل" dark={dark} />
              <ProfileInput label="البلد" dark={dark} />
              <ProfileInput label="المدينة" dark={dark} />
              <ProfileInput label="الرمز بريدي" dark={dark} />
            </div>
          </section>

     {  /* car Info */}
          <section className={`rounded-2xl md:rounded-3xl border ${borderColor} ${cardBg} p-5 md:p-8 relative shadow-sm`}>
            <h3 className={`text-base md:text-lg font-bold mb-2 text-right pr-2 ${mainTextColor}`}>
              بيانات السيارات
            </h3>
            <div className={`w-full h-[1px] ${dark ? 'bg-white/10' : 'bg-[#137FEC33]'} mb-8`}></div>

            <div className={`rounded-2xl md:rounded-3xl p-4 flex flex-col md:flex-row items-center justify-start gap-4 md:gap-8 px-4 md:px-8 
                ${carCardBg} border border-[#137FEC1A] w-full transition-all hover:scale-[1.01] duration-300`}>
              
              <div className="w-full md:w-auto flex justify-center">
                <img 
                  src="/car_rav4.png" 
                  alt="Toyota RAV4"
                  className="w-full max-w-[200px] md:w-48 h-auto object-cover rounded-2xl" 
                />
              </div>

              <span className={`font-bold text-xl md:text-2xl text-center md:text-right ${carNameColor}`}>
                2022 Toyota RAV4
              </span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

// ProfileInput Component
const ProfileInput = ({ label, dark }: { label: string, dark: boolean }) => {
  const [value, setValue] = React.useState("");

  return (
    <div className="relative w-full">
      <label className={`block text-xs mb-2 mr-1 font-bold ${dark ? "text-white/60" : "text-black/60"}`}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={label}
        className={`w-full p-3 md:p-4 rounded-xl text-right outline-none transition-all text-sm md:text-base
          bg-[#137FEC1A] border border-transparent font-medium
          ${dark ? "text-white placeholder-gray-600" : "text-[#0F1323] placeholder-[#0F132340]"}
          focus:border-[#137FEC] focus:bg-transparent`}
      />
    </div>
  );
};

export default UserProfile;