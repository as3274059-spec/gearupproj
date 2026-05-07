import { useState, useEffect } from 'react'; 
import {
  MdDashboard, MdNotifications, MdHistory,
  MdBuild, MdAccessTime, MdSmartToy, MdSettings, MdLogout,
  MdMenu, MdClose
} from 'react-icons/md';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface UserData {
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string;
  role: number;
}

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null); 
  const location = useLocation();
  const navigate = useNavigate();

  const fetchSidebarProfile = async () => {
    const token = sessionStorage.getItem("userToken");
    if (!token) return;
    try {
      const response = await fetch("https://gearupapp.runasp.net/api/users/profile", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data: UserData = await response.json();
        setUserData(data);
        sessionStorage.setItem("userData", JSON.stringify(data));
      } else {
        const savedData = sessionStorage.getItem("userData");
        if (savedData) setUserData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Error fetching sidebar profile:", error);
    }
  };

  useEffect(() => {
    fetchSidebarProfile();
  }, [location.pathname]); 

  const fullName = userData
    ? `${userData.firstName} ${userData.lastName}`.trim()
    : "اسم المستخدم";

  const menuItems = [
    { name: 'لوحة التحكم', icon: <MdDashboard />, path: '/customer/dashboard' },
    { name: 'تذكير',        icon: <MdNotifications />, path: '/customer/reminders' },
    { name: 'تاريخ الخدمة', icon: <MdHistory />,       path: '/customer/servicehistory' },
    { name: 'طلب صيانة',   icon: <MdAccessTime />,     path: '/customer/maintenancerequest' },
    { name: 'حجز صيانة',   icon: <MdBuild />,          path: '/customer/maintenancebookings' },

    { name: 'المساعد الذكي', icon: <MdSmartToy />,     path: '/customer/chatbot' },
  ];

  const settingsPath = '/customer/profilesettings';
  const isSettingsActive = location.pathname === settingsPath;
  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    sessionStorage.removeItem("userToken");
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("gearup_chat_messages");
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* زر الموبايل */}
      <button 
        onClick={toggleSidebar} 
        className="lg:hidden fixed top-5 right-5 z-50 p-2 bg-[#137FEC] text-white rounded-lg shadow-lg active:scale-95 transition-transform"
      >
        {isOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" 
          onClick={toggleSidebar}
        />
      )}

      {/* ✅ aside بـ h-screen وflex-col لضمان إن الـ footer ينزل للأسفل دايماً */}
      <aside 
        className={`
          fixed inset-y-0 right-0 z-40 w-72
          dark:bg-[#0B1120] bg-white
          h-screen flex flex-col
          shadow-xl 
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          lg:translate-x-0 lg:static lg:h-screen
        `}
        dir="rtl"
      >
        
        {/* الشعار — flex-shrink-0 عشان ميتضغطش */}
        <div className="flex-shrink-0 p-8 text-center">
          <h1 className="text-2xl font-black text-[#1e293b] dark:text-white tracking-tight">
            GearUp
          </h1>
        </div>

        {/* ✅ nav بـ flex-1 وoverflow-y-auto عشان يأخد باقي المساحة ويسكرول لو احتاج */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1 min-h-0">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-6 py-3 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-[#E5F1FD] dark:bg-[#137FEC26] text-[#137FEC] font-bold shadow-sm' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#137FEC1A] hover:text-[#137FEC] dark:hover:text-blue-400'
                  }`}
              >
                <span className={`text-2xl transition-transform duration-300 ${!isActive && 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className="text-lg">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* ✅ Profile card — flex-shrink-0 يضمن إنه يفضل في الأسفل ومش بيتضغط */}
        <div className="flex-shrink-0 p-6 border-t border-gray-100 dark:border-gray-800/50">
          <div className="rounded-[25px] border border-blue-400/20 p-4 bg-gray-50/50 dark:bg-[#137FEC0D] backdrop-blur-md">
            
            {/* معلومات المستخدم */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full border-2 border-[#137FEC] overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 shadow-sm">
                {userData?.profilePhotoUrl ? (
                  <img
                    src={userData.profilePhotoUrl}
                    className="w-full h-full object-cover"
                    alt="Profile"
                  />
                ) : (
                  <div className="text-[#137FEC] font-bold text-lg uppercase">
                    {userData?.firstName?.[0] || "U"}
                  </div>
                )}
              </div>

              <div className="text-right overflow-hidden">
                <h4 className="font-bold text-sm dark:text-white truncate">{fullName}</h4>
                <p className="text-[10px] text-gray-400 font-medium">
                  {userData?.role === 1 ? "حساب عميل" : "حساب مستخدم"}
                </p>
              </div>
            </div>

            {/* أزرار الإعدادات والخروج */}
            <div className="space-y-1">
              <Link
                to={settingsPath}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-300
                  ${isSettingsActive 
                    ? 'bg-[#E5F1FD] dark:bg-[#137FEC26] text-[#137FEC] font-bold' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#137FEC1A] dark:hover:text-blue-400'
                  }`}
              >
                <MdSettings className="text-xl" />
                <span>الملف الشخصي</span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl text-sm font-bold transition-colors group"
              >
                <MdLogout className="text-xl rotate-180 group-hover:-translate-x-1 transition-transform" />
                <span>تسجيل خروج</span>
              </button>
            </div>

          </div>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;