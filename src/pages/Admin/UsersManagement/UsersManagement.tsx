import React, { useEffect, useState, useMemo } from 'react';
import AdminSidebar from "../../../components/AdminSidebar/AdminSidebar";
import NotificationBell from "../../../components/NotificationBell/notification_bell";
import ThemeToggle from "../../../components/ThemeToggle/theme_toggle";
import { FaEye, FaSearch, FaUser } from "react-icons/fa";
import { useTheme } from "../../../contexts/ThemeContext";

// Types
interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: number;
  isActive: boolean;
  profilePhotoUrl: string | null;
  registeredAt: string;
}

type UserStatus = 'Active' | 'Frozen';

interface UserDisplay {
  id: string;
  name: string;
  status: UserStatus;
  statusLabel: string;
  phone: string;
  email: string;
  regDate: string;
  profilePhotoUrl: string | null; // ✅ إضافة الصورة لعرضها في الـ Drawer
}

const UsersManagement: React.FC = () => {
  const { dark } = useTheme();
  
  const [allUsers, setAllUsers] = useState<UserDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // State لعرض الـ Drawer (يحتوي على بيانات العرض فقط)
  const [selectedUser, setSelectedUser] = useState<UserDisplay | null>(null);
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Fetch Data (القائمة العامة فقط)
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const token = sessionStorage.getItem("userToken");
      
      try {
        const response = await fetch("https://gearupapp.runasp.net/api/admin/users", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const data: ApiUser[] = await response.json();
          
          // ✅ فلترة المستخدمين (Role === 1 فقط) وتنسيق البيانات
          const filteredData = data.filter(user => user.role === 1);
          
          const formattedData: UserDisplay[] = filteredData.map(item => {
            const statusInfo = mapUserStatus(item.isActive);
            return {
              id: item.id,
              name: `${item.firstName} ${item.lastName}`,
              status: statusInfo.status,
              statusLabel: statusInfo.label,
              phone: item.phone,
              email: item.email,
              regDate: formatDate(item.registeredAt),
              profilePhotoUrl: item.profilePhotoUrl // ✅ تضمين رابط الصورة
            };
          });
          setAllUsers(formattedData);
        } else {
          console.error("Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // ✅ تمت إزالة useEffect الخاص بالتفاصيل

  // Status Logic
  const mapUserStatus = (isActive: boolean) => {
    if (isActive) return { status: 'Active' as const, label: 'نشط' };
    return { status: 'Frozen' as const, label: 'مجمد' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };
  
  // Tabs
  const tabs = useMemo(() => [
    { id: "all", label: "الكل", count: allUsers.length },
    { id: "Active", label: "نشط", count: allUsers.filter(u => u.status === 'Active').length },
    { id: "Frozen", label: "مجمد", count: allUsers.filter(u => u.status === 'Frozen').length },
  ], [allUsers]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const matchesTab = activeTab === "all" || u.status === activeTab;
      const matchesSearch = 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.includes(searchTerm);
      return matchesTab && matchesSearch;
    });
  }, [allUsers, activeTab, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    const colorMap: Record<string, string> = {
      Active: "bg-green-100 text-green-700 dark:bg-green-600/20 dark:text-green-400",
      Frozen: "bg-gray-200 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300", 
    };
    const label = tabs.find(t => t.id === status)?.label || status;
    return (
      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${colorMap[status] || "bg-gray-200 text-gray-600"}`}>
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div dir="rtl" className={`flex min-h-screen ${!dark ? "bg-gray-50" : "bg-[#0B1220]"}`}>
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className={!dark ? "text-gray-600" : "text-gray-400"}>جاري تحميل المستخدمين...</p>
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
      <AdminSidebar />
      <main className="flex-1 p-3 md:p-6 lg:p-8 space-y-4 md:space-y-6 w-full overflow-x-hidden mt-12 lg:mt-0">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-6">
          <h1 className={`text-xl md:text-2xl lg:text-3xl font-bold ${!dark ? "text-black" : "text-white"}`}>
            إدارة المستخدمين
          </h1>
          <div className="flex items-center gap-3 md:gap-4 self-end sm:self-auto">
            <NotificationBell />
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
          <FaSearch className={`text-base md:text-lg ${!dark ? "text-gray-400" : "text-gray-500"}`} />
          <input
            type="text"
            placeholder="البحث حسب الاسم أو البريد أو الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`flex-1 bg-transparent outline-none text-sm md:text-base ${!dark ? "text-gray-900" : "text-white"} placeholder-gray-500`}
          />
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-2 md:gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

        {/* EMPTY STATE */}
        {filteredUsers.length === 0 && (
          <div className={`text-center py-16 rounded-xl ${!dark ? "bg-white" : "bg-[#0d1629]"}`}>
            <p className={!dark ? "text-gray-500" : "text-gray-400"}>لا يوجد مستخدمين بهذا الفلتر</p>
          </div>
        )}

        {/* TABLE - Desktop */}
        {filteredUsers.length > 0 && (
          <div className={`hidden md:block rounded-xl overflow-hidden ${!dark ? "bg-white shadow-xl" : "bg-[#0d1629]"}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className={`text-right text-xs lg:text-sm ${!dark ? "bg-gray-50 text-gray-700" : "bg-[#131c2f] text-gray-300"}`}>
                    <th className="p-3 lg:p-4 font-semibold">المستخدم</th>
                    <th className="p-3 lg:p-4 font-semibold">الحالة</th>
                    <th className="p-3 lg:p-4 font-semibold">رقم الهاتف</th>
                    <th className="p-3 lg:p-4 font-semibold">البريد الإلكتروني</th>
                    <th className="p-3 lg:p-4 font-semibold">تاريخ التسجيل</th>
                    <th className="p-3 lg:p-4 font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`border-b transition-colors ${!dark ? "border-gray-200 hover:bg-gray-50" : "border-gray-800 hover:bg-[#131c2f]"}`}
                    >
                      <td className="p-3 lg:p-4 font-medium text-xs lg:text-sm">{user.name}</td>
                      <td className="p-3 lg:p-4">{getStatusBadge(user.status)}</td>
                      <td className={`p-3 lg:p-4 text-xs lg:text-sm ${!dark ? "text-gray-600" : "text-gray-400"}`}>{user.phone}</td>
                      <td className={`p-3 lg:p-4 text-xs lg:text-sm ${!dark ? "text-gray-600" : "text-gray-400"}`}>{user.email}</td>
                      <td className={`p-3 lg:p-4 text-xs lg:text-sm ${!dark ? "text-gray-600" : "text-gray-400"}`}>{user.regDate}</td>
                      <td className="p-3 lg:p-4">
                         <button onClick={() => setSelectedUser(user)} className="p-2 hover:bg-[#137FEC1A] rounded-full transition-colors">
                            <FaEye size={18} color={dark ? "#E5E7EB" : "#1E293B"} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION SECTION (DESKTOP) */}
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t ${!dark ? "border-gray-200" : "border-gray-800"}`}>
              <span className={`text-xs md:text-sm ${!dark ? "text-gray-600" : "text-gray-400"}`}>
                عرض {(currentPage - 1) * itemsPerPage + 1} إلى {Math.min(currentPage * itemsPerPage, filteredUsers.length)} من {filteredUsers.length} مستخدم
              </span>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg text-xs md:text-sm font-medium transition ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : !dark
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-[#131c2f] text-gray-300 hover:bg-[#1a2332]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CARDS - Mobile */}
        {filteredUsers.length > 0 && (
          <div className="md:hidden space-y-3">
            {paginatedUsers.map((user) => (
              <div
                key={user.id}
                className={`p-4 rounded-xl ${!dark ? "bg-white shadow-md border border-gray-200" : "bg-[#0d1629] border border-gray-800"}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{user.name}</h3>
                    <p className={`text-xs ${!dark ? "text-gray-600" : "text-gray-400"}`}>{user.email}</p>
                  </div>
                  {getStatusBadge(user.status)}
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className={dark ? "text-gray-400" : "text-gray-600"}>الهاتف:</span>
                    <span className="font-medium">{user.phone}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={dark ? "text-gray-400" : "text-gray-600"}>التسجيل:</span>
                    <span className="font-medium">{user.regDate}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(user)} className="w-full py-2 text-center text-sm font-medium text-[#137FEC] hover:bg-[#137FEC1A] rounded-lg transition-colors">
                  عرض التفاصيل
                </button>
              </div>
            ))}

            {/* PAGINATION SECTION (MOBILE) */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : !dark
                        ? "bg-white text-gray-700 border border-gray-200"
                        : "bg-[#131c2f] text-gray-300 border border-gray-800"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* OVERLAY */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedUser(null)} />
      )}

      {/* DRAWER - DETAILS VIEW (Using Selected User Data) */}
      <div
        dir="rtl"
        className={`fixed top-0 left-0 h-full w-full sm:w-[420px] z-50 shadow-2xl transition-transform duration-300 overflow-y-auto
          ${selectedUser ? "translate-x-0" : "-translate-x-full"}
          ${!dark ? "bg-white" : "bg-[#0d1629]"}
        `}
      >
        {/* Drawer Header */}
        <div className={`flex items-center justify-between p-5 border-b ${!dark ? "border-gray-200" : "border-gray-800"}`}>
          <h2 className="text-lg font-bold">تفاصيل المستخدم</h2>
          <button onClick={() => setSelectedUser(null)} className={`w-8 h-8 flex items-center justify-center rounded-full transition ${!dark ? "hover:bg-gray-100 text-gray-600" : "hover:bg-gray-800 text-gray-400"}`}>
            ✕
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-5 space-y-6">
          
          {/* Data Display - Directly from List */}
          {selectedUser && (
            <div className="space-y-5">
              
              {/* Profile Section */}
              <div className={`rounded-xl p-4 space-y-3 ${!dark ? "bg-gray-50 border border-gray-200" : "bg-[#131c2f] border border-gray-800"}`}>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-600 flex-shrink-0">
                    {selectedUser.profilePhotoUrl ? (
                      <img 
                        src={selectedUser.profilePhotoUrl} 
                        alt="profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150"; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-500">
                        {selectedUser.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold truncate">{selectedUser.name}</h3>
                    <p className={`text-sm truncate ${dark ? "text-gray-400" : "text-gray-600"}`}>{selectedUser.email}</p>
                    <p className={`text-sm truncate ${dark ? "text-gray-400" : "text-gray-600"}`}>{selectedUser.phone}</p>
                  </div>
                </div>
                
                {/* Main Status */}
                <div className="pt-2 flex flex-wrap gap-2">
                  {getStatusBadge(selectedUser.status)}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-600/20 dark:text-blue-400`}>
                    <FaUser />
                    مستخدم
                  </span>
                </div>
              </div>

              {/* Account Info */}
              <div className={`rounded-xl p-4 space-y-4 ${!dark ? "bg-gray-50 border border-gray-200" : "bg-[#131c2f] border border-gray-800"}`}>
                <h3 className={`text-xs font-semibold uppercase tracking-wider ${!dark ? "text-gray-500" : "text-gray-400"}`}>بيانات الحساب</h3>
                
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">رقم الهاتف</span>
                    <span className="font-medium">{selectedUser.phone}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">البريد الإلكتروني</span>
                    <span className="font-medium break-all">{selectedUser.email}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">تاريخ التسجيل</span>
                    <span className="font-medium">{selectedUser.regDate}</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;