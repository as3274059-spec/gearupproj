import React, { useEffect, useState, useRef } from "react";
import AdminSidebar from "../../../components/AdminSidebar/AdminSidebar";
import NotificationBell from "../../../components/NotificationBell/notification_bell";
import ThemeToggle from "../../../components/ThemeToggle/theme_toggle";
import {
  FaEye,
  FaSearch,
  FaWrench,
  FaPlus,
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaPlusCircle,
} from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { useTheme } from "../../../contexts/ThemeContext";
import Swal from "sweetalert2";

// Interfaces
interface SubSpecialization {
  id: string;
  name: string;
}

interface ApiSpecialization {
  id: string;
  name: string;
  subSpecializations: SubSpecialization[];
}

interface ServiceDisplay {
  id: string;
  name: string;
  count: number;
  subSpecializations: SubSpecialization[];
}

const ServicesManagement: React.FC = () => {
  const { dark } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  // States
  const [allServices, setAllServices] = useState<ServiceDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Drawer States
  const [selectedService, setSelectedService] = useState<ServiceDisplay | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Menu States
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  // Modals States
  const [isAddMainModalOpen, setIsAddMainModalOpen] = useState(false);
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditSubModalOpen, setIsEditSubModalOpen] = useState(false);

  // Form Inputs
  const [newMainServiceName, setNewMainServiceName] = useState("");
  const [newSubServiceName, setNewSubServiceName] = useState("");
  const [editServiceName, setEditServiceName] = useState("");
  const [editSubServiceName, setEditSubServiceName] = useState("");

  const [parentServiceForSub, setParentServiceForSub] =
    useState<ServiceDisplay | null>(null);
  const [serviceToEdit, setServiceToEdit] =
    useState<ServiceDisplay | null>(null);
  const [subServiceToEdit, setSubServiceToEdit] =
    useState<SubSpecialization | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const inputStyle =
    "w-full bg-gray-100 dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-800 dark:text-blue-400 font-bold outline-none cursor-pointer hover:bg-gray-200 dark:hover:bg-[#0F172A] transition-all focus:border-blue-500/50";

  const labelStyle =
    "text-right font-bold text-gray-700 dark:text-white mb-2 block text-sm pr-1";

  // Fetch Data
  const fetchServices = async () => {
    setLoading(true);
    const token = sessionStorage.getItem("userToken");

    try {
      const response = await fetch("https://gearupapp.runasp.net/api/specializations", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: ApiSpecialization[] = await response.json();

        const formattedData: ServiceDisplay[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          count: item.subSpecializations?.length || 0,
          subSpecializations: item.subSpecializations || [],
        }));

        setAllServices(formattedData.reverse());
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تحميل البيانات",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ في الاتصال بالخادم",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const openServiceDrawer = (service: ServiceDisplay) => {
    setSelectedService(service);
    setActionMenuId(null);

    setTimeout(() => {
      setIsDrawerOpen(true);
    }, 10);
  };

  const closeServiceDrawer = () => {
    setIsDrawerOpen(false);

    setTimeout(() => {
      setSelectedService(null);
    }, 500);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Update selected service after fetching new data
  useEffect(() => {
    if (!selectedService) return;

    const updatedSelectedService = allServices.find(
      (service) => service.id === selectedService.id
    );

    if (updatedSelectedService) {
      setSelectedService(updatedSelectedService);
    }
  }, [allServices, selectedService?.id]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActionMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Add Main Service
  const handleAddMainService = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMainServiceName.trim()) return;

    const token = sessionStorage.getItem("userToken");

    try {
      const response = await fetch("https://gearupapp.runasp.net/api/admin/specializations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newMainServiceName.trim(),
        }),
      });

      if (response.ok) {
        setNewMainServiceName("");
        setIsAddMainModalOpen(false);

        Swal.fire({
          icon: "success",
          title: "تم بنجاح",
          text: "تم إضافة الخدمة الرئيسية بنجاح",
          confirmButtonText: "حسنًا",
          confirmButtonColor: "#137FEC",
        });

        fetchServices();
      } else {
        Swal.fire({
          icon: "error",
          title: "فشل الإضافة",
          text: "حدث خطأ أثناء إضافة الخدمة",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Add main service error:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ غير متوقع",
        confirmButtonColor: "#d33",
      });
    }
  };

  // 2. Add Sub Service
  const handleAddSubService = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!parentServiceForSub) return;
    if (!newSubServiceName.trim()) return;

    const token = sessionStorage.getItem("userToken");

    try {
      const response = await fetch("https://gearupapp.runasp.net/api/admin/sub-specializations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          specializationId: parentServiceForSub.id,
          name: newSubServiceName.trim(),
        }),
      });

      if (response.ok) {
        setNewSubServiceName("");
        setParentServiceForSub(null);
        setIsAddSubModalOpen(false);
        setActionMenuId(null);

        Swal.fire({
          icon: "success",
          title: "تم بنجاح",
          text: "تم إضافة الخدمة الفرعية بنجاح",
          confirmButtonText: "حسنًا",
          confirmButtonColor: "#137FEC",
        });

        fetchServices();
      } else {
        Swal.fire({
          icon: "error",
          title: "فشل الإضافة",
          text: "حدث خطأ أثناء إضافة الخدمة الفرعية",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Add sub service error:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ غير متوقع",
        confirmButtonColor: "#d33",
      });
    }
  };

  // 3. Edit Main Service
  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceToEdit) return;
    if (!editServiceName.trim()) return;

    const token = sessionStorage.getItem("userToken");

    try {
      const response = await fetch(
        `https://gearupapp.runasp.net/api/admin/specializations/${serviceToEdit.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editServiceName.trim(),
          }),
        }
      );

      if (response.ok) {
        setEditServiceName("");
        setServiceToEdit(null);
        setIsEditModalOpen(false);
        setActionMenuId(null);

        Swal.fire({
          icon: "success",
          title: "تم بنجاح",
          text: "تم تعديل الخدمة الرئيسية بنجاح",
          confirmButtonText: "حسنًا",
          confirmButtonColor: "#137FEC",
        });

        fetchServices();
      } else {
        Swal.fire({
          icon: "error",
          title: "فشل التعديل",
          text: "حدث خطأ أثناء تعديل الخدمة",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Edit main service error:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ غير متوقع",
        confirmButtonColor: "#d33",
      });
    }
  };

  // 4. Delete Main Service
  const handleDeleteService = async (serviceId: string) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذه الخدمة الرئيسية وجميع الخدمات الفرعية المرتبطة بها!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#137FEC",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const token = sessionStorage.getItem("userToken");

      try {
        const response = await fetch(
          `https://gearupapp.runasp.net/api/admin/specializations/${serviceId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          setActionMenuId(null);

          if (selectedService?.id === serviceId) {
            closeServiceDrawer();
          }

          fetchServices();

          Swal.fire({
            title: "تم الحذف!",
            text: "تم حذف الخدمة بنجاح.",
            icon: "success",
            confirmButtonColor: "#137FEC",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "فشل الحذف",
            text: "حدث خطأ أثناء حذف الخدمة",
            confirmButtonColor: "#d33",
          });
        }
      } catch (error) {
        console.error("Delete main service error:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "حدث خطأ غير متوقع",
          confirmButtonColor: "#d33",
        });
      }
    });
  };

  // 5. Edit Sub Service
  const handleEditSubService = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subServiceToEdit) return;
    if (!editSubServiceName.trim()) return;

    const token = sessionStorage.getItem("userToken");

    try {
      const response = await fetch(
        `https://gearupapp.runasp.net/api/admin/sub-specializations/${subServiceToEdit.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editSubServiceName.trim(),
          }),
        }
      );

      if (response.ok) {
        setEditSubServiceName("");
        setSubServiceToEdit(null);
        setIsEditSubModalOpen(false);

        Swal.fire({
          icon: "success",
          title: "تم بنجاح",
          text: "تم تعديل الخدمة الفرعية بنجاح",
          confirmButtonText: "حسنًا",
          confirmButtonColor: "#137FEC",
        });

        fetchServices();
      } else {
        Swal.fire({
          icon: "error",
          title: "فشل التعديل",
          text: "حدث خطأ أثناء تعديل الخدمة الفرعية",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Edit sub service error:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ غير متوقع",
        confirmButtonColor: "#d33",
      });
    }
  };

  // 6. Delete Sub Service
  const handleDeleteSubService = async (subServiceId: string) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذه الخدمة الفرعية نهائياً!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#137FEC",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const token = sessionStorage.getItem("userToken");

      try {
        const response = await fetch(
          `https://gearupapp.runasp.net/api/admin/sub-specializations/${subServiceId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          fetchServices();

          Swal.fire({
            title: "تم الحذف!",
            text: "تم حذف الخدمة الفرعية بنجاح.",
            icon: "success",
            confirmButtonColor: "#137FEC",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "فشل الحذف",
            text: "حدث خطأ أثناء حذف الخدمة الفرعية",
            confirmButtonColor: "#d33",
          });
        }
      } catch (error) {
        console.error("Delete sub service error:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "حدث خطأ غير متوقع",
          confirmButtonColor: "#d33",
        });
      }
    });
  };

  // Helpers
  const openEditModal = (service: ServiceDisplay) => {
    setServiceToEdit(service);
    setEditServiceName(service.name);
    setIsEditModalOpen(true);
    setActionMenuId(null);
  };

  const openAddSubModal = (service: ServiceDisplay) => {
    setParentServiceForSub(service);
    setNewSubServiceName("");
    setIsAddSubModalOpen(true);
    setActionMenuId(null);
  };

  const openEditSubModal = (subService: SubSpecialization) => {
    setSubServiceToEdit(subService);
    setEditSubServiceName(subService.name);
    setIsEditSubModalOpen(true);
  };

  const closeEditSubModal = () => {
    setSubServiceToEdit(null);
    setEditSubServiceName("");
    setIsEditSubModalOpen(false);
  };

  // Filter & Pagination
  const filteredServices = allServices.filter((service) => {
    const matchesTab = activeTab === "all";
    const matchesSearch = service.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = () => (
    <span
      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
        !dark
          ? "bg-green-100 text-green-700"
          : "bg-green-600/20 dark:text-green-400"
      }`}
    >
      نشط
    </span>
  );

  if (loading) {
    return (
      <div
        dir="rtl"
        className={`flex min-h-screen ${!dark ? "bg-gray-50" : "bg-[#0B1220]"}`}
      >
        <AdminSidebar />

        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#137FEC] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className={!dark ? "text-gray-600" : "text-gray-400"}>
              جاري تحميل الخدمات...
            </p>
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
          <h1
            className={`text-xl md:text-2xl lg:text-3xl font-bold ${
              !dark ? "text-black" : "text-white"
            }`}
          >
            إدارة الخدمات
          </h1>

          <div className="flex items-center gap-3 md:gap-4 self-end sm:self-auto">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>

        {/* SEARCH & ADD BUTTON */}
        <div className="flex flex-col md:flex-row gap-4">
          <div
            className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl ${
              !dark
                ? "bg-white shadow-sm border border-gray-200"
                : "bg-[#0d1629] border border-gray-800"
            }`}
          >
            <FaSearch
              className={`text-lg ${!dark ? "text-gray-400" : "text-gray-500"}`}
            />

            <input
              type="text"
              placeholder="البحث عن خدمة رئيسية..."
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

          <button
            type="button"
            onClick={() => setIsAddMainModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#137FEC] hover:bg-blue-600 text-white rounded-2xl font-bold text-sm md:text-base transition shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <FaPlus /> إضافة خدمة رئيسية
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setCurrentPage(1);
            }}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              activeTab === "all"
                ? "bg-[#137FEC] text-white shadow-lg shadow-blue-500/20"
                : !dark
                ? "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                : "bg-[#0d1629] text-gray-400 hover:bg-[#1a2332] border border-gray-800"
            }`}
          >
            الكل ({allServices.length})
          </button>
        </div>

        {/* EMPTY STATE */}
        {filteredServices.length === 0 && (
          <div
            className={`text-center py-20 rounded-2xl ${
              !dark ? "bg-white" : "bg-[#0d1629]"
            }`}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <FaWrench className="text-2xl text-gray-300 dark:text-gray-700" />
            </div>

            <p className={!dark ? "text-gray-500" : "text-gray-400"}>
              لا توجد خدمات حالياً
            </p>
          </div>
        )}

        {/* TABLE - Desktop */}
        {filteredServices.length > 0 && (
          <div
            className={`hidden md:block rounded-3xl overflow-hidden ${
              !dark
                ? "bg-white shadow-lg border border-gray-100"
                : "bg-[#0d1629] border border-gray-800"
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr
                    className={`text-right text-sm font-bold border-b ${
                      !dark
                        ? "bg-gray-50/50 text-gray-600 border-gray-100"
                        : "bg-[#131c2f] text-gray-400 border-gray-800"
                    }`}
                  >
                    <th className="p-5">الخدمة الرئيسية</th>
                    <th className="p-5 text-center">الخدمات الفرعية</th>
                    <th className="p-5 text-center">الحالة</th>
                    <th className="p-5">الإجراءات</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedServices.map((service) => (
                    <tr
                      key={service.id}
                      className={`border-b transition-colors ${
                        !dark
                          ? "border-gray-100 hover:bg-blue-50/30"
                          : "border-gray-800 hover:bg-[#137FEC5]"
                      }`}
                    >
                      <td className="p-5 font-medium text-sm flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            !dark
                              ? "bg-blue-50 text-blue-600"
                              : "bg-blue-900/20 text-blue-400"
                          }`}
                        >
                          <FaWrench size={14} />
                        </div>

                        {service.name}
                      </td>

                      <td className="p-5 text-center text-sm font-bold text-[#137FEC]">
                        {service.count}
                      </td>

                      <td className="p-5 text-center">{getStatusBadge()}</td>

                      <td className="p-5">
                        <div className="relative" ref={menuRef}>
                          <button
                            type="button"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuId(
                                actionMenuId === service.id ? null : service.id
                              );
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                          >
                            <FaEllipsisV
                              size={18}
                              color={dark ? "#9CA3AF" : "#4B5563"}
                            />
                          </button>

                          {actionMenuId === service.id && (
                            <div
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                              className={`absolute top-10 left-0 w-48 rounded-2xl shadow-2xl border py-2 z-50 flex flex-col overflow-hidden ${
                                !dark
                                  ? "bg-white border-gray-100"
                                  : "bg-[#0d1629] border-gray-800"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => openServiceDrawer(service)}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-colors w-full text-right ${
                                  !dark ? "text-gray-700" : "text-gray-300"
                                }`}
                              >
                                <FaEye size={14} /> عرض التفاصيل
                              </button>

                              <button
                                type="button"
                                onClick={() => openAddSubModal(service)}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-[#137FEC] transition-colors w-full text-right"
                              >
                                <FaPlusCircle size={14} /> إضافة خدمة فرعية
                              </button>

                              <button
                                type="button"
                                onClick={() => openEditModal(service)}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-[#137FEC] transition-colors w-full text-right"
                              >
                                <FaEdit size={14} /> تعديل
                              </button>

                              <div
                                className={`h-px mx-4 my-1 ${
                                  !dark ? "bg-gray-100" : "bg-gray-800"
                                }`}
                              />

                              <button
                                type="button"
                                onClick={() => handleDeleteService(service.id)}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors w-full text-right"
                              >
                                <FaTrash size={14} /> حذف
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div
                className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t ${
                  !dark ? "border-gray-100" : "border-gray-800"
                }`}
              >
                <span className={`text-sm ${!dark ? "text-gray-500" : "text-gray-400"}`}>
                  عرض {(currentPage - 1) * itemsPerPage + 1} إلى{" "}
                  {Math.min(currentPage * itemsPerPage, filteredServices.length)} من{" "}
                  {filteredServices.length}
                </span>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-9 h-9 md:w-10 md:h-10 rounded-xl text-sm font-bold transition ${
                        currentPage === i + 1
                          ? "bg-[#137FEC] text-white shadow-lg shadow-blue-500/20"
                          : !dark
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          : "bg-[#131c2f] text-gray-400 hover:bg-[#1a2332]"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CARDS - Mobile */}
        {filteredServices.length > 0 && (
          <div className="md:hidden space-y-4">
            {paginatedServices.map((service) => (
              <div
                key={service.id}
                className={`p-4 rounded-2xl ${
                  !dark
                    ? "bg-white shadow-md border border-gray-100"
                    : "bg-[#0d1629] border border-gray-800"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-base mb-1 flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          !dark
                            ? "bg-blue-50 text-blue-600"
                            : "bg-blue-900/20 text-blue-400"
                        }`}
                      >
                        <FaWrench size={12} />
                      </div>

                      {service.name}
                    </h3>

                    <p className={`text-xs ${!dark ? "text-gray-500" : "text-gray-400"}`}>
                      يحتوي على{" "}
                      <span className="font-bold text-[#137FEC]">{service.count}</span>{" "}
                      خدمة فرعية
                    </p>
                  </div>

                  <div className="relative" ref={menuRef}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionMenuId(
                          actionMenuId === service.id ? null : service.id
                        );
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                      <FaEllipsisV
                        size={18}
                        color={dark ? "#9CA3AF" : "#4B5563"}
                      />
                    </button>

                    {actionMenuId === service.id && (
                      <div
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute top-8 left-0 w-48 rounded-2xl shadow-2xl border py-2 z-50 flex flex-col overflow-hidden ${
                          !dark
                            ? "bg-white border-gray-100"
                            : "bg-[#0d1629] border-gray-800"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => openServiceDrawer(service)}
                          className={`flex items-center gap-3 px-4 py-3 text-sm font-bold w-full text-right hover:bg-gray-50 dark:hover:bg-white/10 ${
                            !dark ? "text-gray-700" : "text-gray-300"
                          }`}
                        >
                          <FaEye size={14} /> عرض التفاصيل
                        </button>

                        <button
                          type="button"
                          onClick={() => openAddSubModal(service)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold w-full text-right text-[#137FEC] hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <FaPlusCircle size={14} /> إضافة خدمة فرعية
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(service)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold w-full text-right text-[#137FEC] hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <FaEdit size={14} /> تعديل
                        </button>

                        <div
                          className={`h-px mx-4 my-1 ${
                            !dark ? "bg-gray-100" : "bg-gray-800"
                          }`}
                        />

                        <button
                          type="button"
                          onClick={() => handleDeleteService(service.id)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold w-full text-right text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <FaTrash size={14} /> حذف
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {getStatusBadge()}
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition ${
                      currentPage === i + 1
                        ? "bg-[#137FEC] text-white shadow-lg shadow-blue-500/20"
                        : !dark
                        ? "bg-white text-gray-600 border border-gray-200"
                        : "bg-[#131c2f] text-gray-400 border border-gray-800"
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

      {/* DRAWER */}
      {selectedService && (
        <>
          <div
            className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-500 ease-in-out ${
              isDrawerOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeServiceDrawer}
          />

          <div
            dir="rtl"
            className={`fixed top-0 left-0 h-full w-full sm:w-[460px] z-50 shadow-2xl overflow-y-auto
              transition-transform duration-500 ease-in-out
              ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}
              ${!dark ? "bg-white" : "bg-[#0d1629]"}
            `}
          >
            <div
              className={`flex items-center justify-between p-6 border-b ${
                !dark ? "border-gray-100" : "border-gray-800"
              }`}
            >
              <h2 className="text-xl font-bold">تفاصيل الخدمة</h2>

              <button
                type="button"
                onClick={closeServiceDrawer}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition ${
                  !dark
                    ? "hover:bg-gray-100 text-gray-600"
                    : "hover:bg-gray-800 text-gray-400"
                }`}
              >
                <MdClose size={26} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-center">{getStatusBadge()}</div>

              <div
                className={`rounded-2xl p-6 space-y-4 ${
                  !dark
                    ? "bg-gray-50 border border-gray-200"
                    : "bg-[#131c2f] border border-gray-800"
                }`}
              >
                <h3
                  className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                    !dark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  الخدمة الرئيسية
                </h3>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#137FEC] flex items-center justify-center text-white font-black text-xl">
                    {selectedService.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-xl truncate">
                      {selectedService.name}
                    </p>
                    <p className={`text-sm ${!dark ? "text-gray-500" : "text-gray-400"}`}>
                      خدمة رئيسية
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl p-6 space-y-3 ${
                  !dark
                    ? "bg-gray-50 border border-gray-200"
                    : "bg-[#131c2f] border border-gray-800"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider ${
                      !dark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    الخدمات الفرعية ({selectedService.count})
                  </h3>

                  <button
                    type="button"
                    onClick={() => openAddSubModal(selectedService)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#137FEC] text-white text-xs font-bold hover:bg-blue-600 transition"
                  >
                    <FaPlus size={11} /> إضافة
                  </button>
                </div>

                {selectedService.subSpecializations.length > 0 ? (
                  <div className="space-y-2">
                    {selectedService.subSpecializations.map((sub) => (
                      <div
                        key={sub.id}
                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                          !dark
                            ? "bg-white border-gray-200"
                            : "bg-[#0d1629] border-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#137FEC20] text-[#137FEC] flex items-center justify-center shrink-0">
                            <FaWrench size={12} />
                          </div>

                          <span className="text-sm font-bold truncate">
                            {sub.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditSubModal(sub)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-[#137FEC] hover:bg-[#137FEC] hover:text-white transition"
                            title="تعديل"
                          >
                            <FaEdit size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSubService(sub.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition"
                            title="حذف"
                          >
                            <FaTrash size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    className={`text-sm text-center py-6 ${
                      !dark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    لا توجد خدمات فرعية لهذه الخدمة
                  </p>
                )}

                <div className="text-center text-xs text-gray-400 mt-2">
                  ID: {selectedService.id}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL: ADD MAIN SERVICE */}
      {isAddMainModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsAddMainModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-[40px] shadow-2xl overflow-hidden border border-gray-200 dark:border-blue-500/20 animate-in fade-in zoom-in duration-300">
            <button
              type="button"
              onClick={() => setIsAddMainModalOpen(false)}
              className="absolute top-6 left-6 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors z-10"
            >
              <MdClose size={30} />
            </button>

            <div className="p-8 md:p-12">
              <h2 className="text-2xl font-black text-gray-800 dark:text-white text-right mb-10">
                إضافة خدمة رئيسية جديدة
              </h2>

              <form onSubmit={handleAddMainService} className="space-y-6">
                <div className="text-right">
                  <label className={labelStyle}>اسم الخدمة</label>
                  <input
                    type="text"
                    required
                    value={newMainServiceName}
                    onChange={(e) => setNewMainServiceName(e.target.value)}
                    placeholder="مثال: صيانة المحركات"
                    className={inputStyle}
                    dir="rtl"
                  />
                </div>

                <div className="flex gap-4 pt-6" dir="rtl">
                  <button
                    type="button"
                    onClick={() => setIsAddMainModalOpen(false)}
                    className="flex-1 bg-gray-100 text-gray-700 dark:bg-[#0F1323] dark:text-white py-4 rounded-2xl font-black text-lg border border-gray-200 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-[#1e293b] transition-all"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-[#137FEC] text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all"
                  >
                    إضافة
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUB SERVICE */}
      {isAddSubModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsAddSubModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-[40px] shadow-2xl overflow-hidden border border-gray-200 dark:border-blue-500/20 animate-in fade-in zoom-in duration-300">
            <button
              type="button"
              onClick={() => setIsAddSubModalOpen(false)}
              className="absolute top-6 left-6 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors z-10"
            >
              <MdClose size={30} />
            </button>

            <div className="p-8 md:p-12">
              <h2 className="text-2xl font-black text-gray-800 dark:text-white text-right mb-10">
                إضافة خدمة فرعية
              </h2>

              <form onSubmit={handleAddSubService} className="space-y-6">
                <div className="text-right">
                  <label className={labelStyle}>تابع لخدمة</label>
                  <div className={`${inputStyle} text-gray-500 dark:text-gray-400`}>
                    {parentServiceForSub?.name}
                  </div>
                </div>

                <div className="text-right">
                  <label className={labelStyle}>اسم الخدمة الفرعية</label>
                  <input
                    type="text"
                    required
                    value={newSubServiceName}
                    onChange={(e) => setNewSubServiceName(e.target.value)}
                    placeholder="مثال: تغيير الزيت"
                    className={inputStyle}
                    dir="rtl"
                  />
                </div>

                <div className="flex gap-4 pt-6" dir="rtl">
                  <button
                    type="button"
                    onClick={() => setIsAddSubModalOpen(false)}
                    className="flex-1 bg-gray-100 text-gray-700 dark:bg-[#0F1323] dark:text-white py-4 rounded-2xl font-black text-lg border border-gray-200 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-[#1e293b] transition-all"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-[#137FEC] text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all"
                  >
                    إضافة
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MAIN SERVICE */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsEditModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-[40px] shadow-2xl overflow-hidden border border-gray-200 dark:border-blue-500/20 animate-in fade-in zoom-in duration-300">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-6 left-6 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors z-10"
            >
              <MdClose size={30} />
            </button>

            <div className="p-8 md:p-12">
              <h2 className="text-2xl font-black text-gray-800 dark:text-white text-right mb-10">
                تعديل اسم الخدمة
              </h2>

              <form onSubmit={handleEditService} className="space-y-6">
                <div className="text-right">
                  <label className={labelStyle}>الاسم الجديد</label>
                  <input
                    type="text"
                    required
                    value={editServiceName}
                    onChange={(e) => setEditServiceName(e.target.value)}
                    placeholder="أدخل الاسم الجديد"
                    className={inputStyle}
                    dir="rtl"
                  />
                </div>

                <div className="flex gap-4 pt-6" dir="rtl">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 bg-gray-100 text-gray-700 dark:bg-[#0F1323] dark:text-white py-4 rounded-2xl font-black text-lg border border-gray-200 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-[#1e293b] transition-all"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-[#137FEC] text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all"
                  >
                    حفظ التعديلات
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SUB SERVICE */}
      {isEditSubModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeEditSubModal}
          />

          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-[40px] shadow-2xl overflow-hidden border border-gray-200 dark:border-blue-500/20 animate-in fade-in zoom-in duration-300">
            <button
              type="button"
              onClick={closeEditSubModal}
              className="absolute top-6 left-6 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors z-10"
            >
              <MdClose size={30} />
            </button>

            <div className="p-8 md:p-12">
              <h2 className="text-2xl font-black text-gray-800 dark:text-white text-right mb-10">
                تعديل الخدمة الفرعية
              </h2>

              <form onSubmit={handleEditSubService} className="space-y-6">
                <div className="text-right">
                  <label className={labelStyle}>
                    الاسم الجديد للخدمة الفرعية
                  </label>
                  <input
                    type="text"
                    required
                    value={editSubServiceName}
                    onChange={(e) => setEditSubServiceName(e.target.value)}
                    placeholder="أدخل الاسم الجديد"
                    className={inputStyle}
                    dir="rtl"
                  />
                </div>

                <div className="flex gap-4 pt-6" dir="rtl">
                  <button
                    type="button"
                    onClick={closeEditSubModal}
                    className="flex-1 bg-gray-100 text-gray-700 dark:bg-[#0F1323] dark:text-white py-4 rounded-2xl font-black text-lg border border-gray-200 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-[#1e293b] transition-all"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-[#137FEC] text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all"
                  >
                    حفظ التعديلات
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManagement;