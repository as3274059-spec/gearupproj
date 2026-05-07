import { useEffect, useState } from "react";
import { useTheme } from "../../../../contexts/ThemeContext";
import { FaEdit, FaSave, FaSpinner } from "react-icons/fa";

interface ServiceData {
  id?: string;
  subSpecializationId: string;
  subSpecializationName?: string;
  price: string;
  isNew?: boolean;
}

interface SubSpecialization {
  id: string;
  name: string;
}

const ServicesTab = () => {
  const { dark } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [services, setServices] = useState<ServiceData[]>([]);
  const [subSpecializations, setSubSpecializations] = useState<SubSpecialization[]>([]);

  const token = sessionStorage.getItem("userToken");

  const fetchSubSpecializations = async () => {
    setIsLoadingOptions(true);

    try {
      if (!token) throw new Error("No token found");

      const response = await fetch(
        "https://gearupapp.runasp.net/api/specializations/sub-specializations",
        {
          method: "GET",
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`GET sub-specializations failed: ${response.status}`);
      }

      const data = await response.json();

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setSubSpecializations(items);
    } catch (err) {
      console.error("fetchSubSpecializations error:", err);
      setError("تعذر تحميل قائمة الخدمات");
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const fetchMyServices = async () => {
    setIsLoadingServices(true);

    try {
      if (!token) throw new Error("No token found");

      const response = await fetch(
        "https://gearupapp.runasp.net/api/mechanics/my/services",
        {
          method: "GET",
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`GET my services failed: ${response.status}`);
      }

      const data = await response.json();

      setServices(
        data.map((item: any) => ({
          id: item.id,
          subSpecializationId: item.subSpecializationId,
          subSpecializationName: item.subSpecializationName,
          price: String(item.price ?? ""),
          isNew: false,
        }))
      );
    } catch (err) {
      console.error("fetchMyServices error:", err);
      setError("تعذر تحميل الخدمات الحالية");
    } finally {
      setIsLoadingServices(false);
    }
  };

  useEffect(() => {
    setError("");
    fetchSubSpecializations();
    fetchMyServices();
  }, []);

  const addService = () => {
    setServices((prev) => [
      {
        subSpecializationId: "",
        subSpecializationName: "",
        price: "",
        isNew: true,
      },
      ...prev,
    ]);
  };

  const updateService = (
    index: number,
    field: keyof ServiceData,
    value: string
  ) => {
    setServices((prev) =>
      prev.map((service, i) =>
        i === index ? { ...service, [field]: value } : service
      )
    );
  };

  const deleteServiceFromState = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteService = async (service: ServiceData, index: number) => {
    setError("");
    setSuccess("");

    try {
      if (!token) {
        throw new Error("No token found");
      }

      if (service.isNew || !service.id) {
        deleteServiceFromState(index);
        return;
      }

      const confirmed = window.confirm("متأكدة إنك عايزة تحذفي الخدمة دي؟");
      if (!confirmed) return;

      const response = await fetch(
        `https://gearupapp.runasp.net/api/mechanics/my/services/${service.subSpecializationId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DELETE error:", response.status, errorText);
        throw new Error(`DELETE failed: ${response.status} - ${errorText}`);
      }

      await fetchMyServices();
      setSuccess("تم حذف الخدمة بنجاح ✅");
    } catch (err) {
      console.error("handleDeleteService error:", err);
      setError("تعذر حذف الخدمة");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!token) {
        throw new Error("No token found");
      }

      const validServices = services.filter(
        (service) =>
          service.subSpecializationId.trim() !== "" &&
          service.price.trim() !== "" &&
          Number(service.price) > 0
      );

      if (validServices.length === 0) {
        setError("لازم يكون فيه خدمة واحدة على الأقل بسعر صحيح");
        return;
      }

      for (const service of validServices) {
        const payload = {
          subSpecializationId: service.subSpecializationId,
          price: Number(service.price),
        };

        if (service.isNew || !service.id) {
          const response = await fetch(
            "https://gearupapp.runasp.net/api/mechanics/my/services",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "*/*",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error("POST error:", response.status, errorText);
            throw new Error(`POST failed: ${response.status} - ${errorText}`);
          }
        } else {
          const response = await fetch(
            `https://gearupapp.runasp.net/api/mechanics/my/services/${service.subSpecializationId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Accept: "*/*",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error("PUT error:", response.status, errorText);
            throw new Error(`PUT failed: ${response.status} - ${errorText}`);
          }
        }
      }

      await fetchMyServices();
      setSuccess("تم حفظ الخدمات بنجاح ✅");
      setIsEditing(false);
    } catch (err) {
      console.error("handleSave error:", err);
      setError("تعذر حفظ الخدمات");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = (extra = "") =>
    `w-full px-4 py-3 rounded-xl border outline-none transition-all ${
      !dark
        ? "bg-white border-gray-300 text-black"
        : "bg-[#0B1220] border-gray-600 text-white"
    } ${
      isEditing
        ? "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        : "cursor-not-allowed"
    } ${extra}`;

  return (
    <div
      className={`rounded-2xl border p-6 space-y-6 ${
        !dark
          ? "bg-white border-gray-200 shadow-md"
          : "bg-[#0d1629] border-blue-900/30"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">الخدمات والأسعار</h3>

        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              onClick={addService}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              <span className="text-lg">＋</span>
              إضافة خدمة
            </button>
          )}

          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setError("");
                  setSuccess("");
                  fetchMyServices();
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  !dark
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                إلغاء
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>حفظ</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsEditing(true);
                setError("");
                setSuccess("");
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
            >
              <FaEdit />
              <span>تعديل الخدمات</span>
            </button>
          )}
        </div>
      </div>

      {success && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-500 text-sm text-center">
          {success}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      {(isLoadingOptions || isLoadingServices) && (
        <div className="text-center py-3 text-gray-400">
          جاري تحميل الخدمات...
        </div>
      )}

     <div className="max-h-[420px] overflow-y-auto pr-2 space-y-3">
  {services.length === 0 ? (
    <div className="text-center py-12 text-gray-400">
      <p>لا توجد خدمات مضافة بعد</p>
      {!isEditing && (
        <p className="text-sm mt-2">
          اضغط على تعديل الخدمات ثم أضف خدمة جديدة
        </p>
      )}
    </div>
  ) : (
    services.map((service, index) => (
      <div
        key={service.id || `${service.subSpecializationId}-${index}`}
        className={`p-4 rounded-xl border ${
          !dark
            ? "bg-gray-50 border-gray-200"
            : "bg-[#131c2f] border-gray-700"
        }`}
      >
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label
              className={`block text-sm mb-2 ${
                !dark ? "text-gray-600" : "text-gray-400"
              }`}
            >
              الخدمة
            </label>

            {isEditing && (service.isNew || !service.id) ? (
              <select
                value={service.subSpecializationId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedService = subSpecializations.find(
                    (item) => item.id === selectedId
                  );

                  setServices((prev) =>
                    prev.map((s, i) =>
                      i === index
                        ? {
                            ...s,
                            subSpecializationId: selectedId,
                            subSpecializationName:
                              selectedService?.name || "",
                          }
                        : s
                    )
                  );
                }}
                className={inputClass()}
              >
                <option value="">اختر خدمة</option>
                {subSpecializations.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={service.subSpecializationName || ""}
                readOnly
                className={inputClass()}
              />
            )}
          </div>

          <div className="w-40 relative">
            <label
              className={`block text-sm mb-2 ${
                !dark ? "text-gray-600" : "text-gray-400"
              }`}
            >
              السعر
            </label>

            <input
              type="number"
              value={service.price}
              onChange={(e) => updateService(index, "price", e.target.value)}
              readOnly={!isEditing}
              placeholder="0"
              className={inputClass("pr-14")}
            />

            <span className="absolute right-4 top-[42px] text-xs font-bold text-blue-500">
              EGP
            </span>
          </div>
        </div>

        {isEditing && (
          <button
            onClick={() => handleDeleteService(service, index)}
            className="w-full mt-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition text-sm"
          >
            حذف الخدمة
          </button>
        )}
      </div>
    ))
  )}
</div>
    </div>
  );
};

export default ServicesTab;