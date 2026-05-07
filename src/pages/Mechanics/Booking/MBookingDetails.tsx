import React, { useState } from "react";
import { useParams } from "react-router-dom";
import NotificationBell from "../../../components/NotificationBell/notification_bell";
import ThemeToggle from "../../../components/ThemeToggle/theme_toggle";
import { useTheme } from "../../../contexts/ThemeContext";
import MachineSidebar from "../../../components/Machine/MachineSidebar";
import { FaCheckCircle, FaTimes, FaClock, FaPaperPlane } from "react-icons/fa";

const MBookingDetails = () => {
  const { dark } = useTheme();
  const { id } = useParams();
  const [message, setMessage] = useState("");

  const booking = {
    id,
    number: "8789-12456",
    client: {
      name: "جون لورانس",
      phone: "(555) 123-4567",
      avatar: "https://i.pravatar.cc/100?img=1",
    },
    car:     { model: "2021 Toyota Camry", plate: "XYZ-1236" },
    service: "فحص الفرامل وتغيير الزيت",
    date:    "October 26, 2026 at 2:00 PM",
    notes:   "السيارة تُصدر صوت من الفرامل الأمامية اليمنى عند الضغط على الفرامل أثناء السرعة العالية",
    status:  "new",
    messages: [
      { id: 1, from: "client",   text: "ممكن أعرف التكلفة التقريبية قبل الحضور؟",                                    time: "10:30 AM" },
      { id: 2, from: "mechanic", text: "التكلفة عادة بين 200–300 ريال، والفحص النهائي يتم عند الحضور.",              time: "10:35 AM" },
    ],
  };

  const card = `rounded-xl ${dark ? "bg-[#0d1629]" : "bg-white shadow-md border border-gray-200"}`;
  const divider = `border-b ${dark ? "border-gray-800" : "border-gray-200"}`;

  return (
    <div
      dir="rtl"
      className={`flex min-h-screen transition-colors duration-500 ${
        dark ? "bg-[#0B1220] text-white" : "bg-gray-50 text-[#1E3A5F]"
      }`}
    >
      <MachineSidebar />

      <div className="flex-1 min-w-0 p-3 sm:p-5 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">

        {/* Header */}
        <div className="flex items-center justify-between mt-14 lg:mt-0 gap-3">
          <h1 className="text-xl sm:text-2xl font-bold">الحجوزات</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <NotificationBell size={25} />
          </div>
        </div>

        {/* Status Bar */}
        <div className={`${card} px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3`}>
          <div>
            <h2 className="font-bold text-base sm:text-lg">مراجعة طلب الحجز</h2>
            <p className={`text-xs sm:text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
              رقم الحجز: {booking.number}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-medium flex-shrink-0 ${
            dark ? "bg-yellow-600/20 text-yellow-400" : "bg-yellow-100 text-yellow-700"
          }`}>
            في انتظار الموافقة
          </span>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* Details */}
          <div className={`${card} p-4 sm:p-6 lg:col-span-2`}>
            <h3 className={`font-bold mb-4 pb-3 text-sm sm:text-base ${divider}`}>تفاصيل الطلب</h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <DetailRow dark={dark} label="العميل"         value={booking.client.name}  />
              <DetailRow dark={dark} label="الهاتف"         value={booking.client.phone} />
              <DetailRow dark={dark} label="العربة"         value={booking.car.model}    />
              <DetailRow dark={dark} label="لوحة الترخيص"  value={booking.car.plate}    />
              <DetailRow dark={dark} label="الخدمة"         value={booking.service}      />
              <DetailRow dark={dark} label="التاريخ"        value={booking.date}         />
              <DetailRow dark={dark} label="ملاحظات"        value={booking.notes}        />
            </div>

            {/* Action Buttons — كل واحد يتمدد على موبايل */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mt-5 sm:mt-6">
              <ActionBtn color="green"  icon={<FaCheckCircle />} text="الموافقة"    />
              <ActionBtn color="red"    icon={<FaTimes />}       text="رفض الحجز"  />
              <ActionBtn color="yellow" icon={<FaClock />}       text="اقتراح وقت" />
            </div>
          </div>

          {/* Chat */}
          <div className={`${card} flex flex-col`} style={{ minHeight: "420px", maxHeight: "600px" }}>

            {/* Chat Header */}
            <div className={`p-3 sm:p-4 flex items-center gap-3 ${divider} flex-shrink-0`}>
              <img src={booking.client.avatar} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0" alt="client" />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{booking.client.name}</p>
                <span className="text-xs text-green-500">متصل الآن</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-3 sm:p-4 space-y-3 overflow-y-auto">
              {booking.messages.map((msg) => {
                const isMe = msg.from === "mechanic";
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2`}>
                    {!isMe && (
                      <img src={booking.client.avatar} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full self-end flex-shrink-0" alt="avatar" />
                    )}
                    <div className={`max-w-[80%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isMe
                        ? "bg-blue-600 text-white rounded-br-md"
                        : dark
                        ? "bg-[#1a2332] text-white rounded-bl-md"
                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                    }`}>
                      {msg.text}
                      <div className={`text-[10px] mt-1 text-right ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className={`p-3 flex items-center gap-2 ${divider.replace("border-b", "border-t")} flex-shrink-0`}>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالة..."
                className={`flex-1 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm outline-none min-w-0 ${
                  dark
                    ? "bg-[#131c2f] text-white placeholder-gray-500"
                    : "bg-gray-100 text-gray-900 placeholder-gray-400"
                }`}
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 sm:p-3 rounded-xl transition flex-shrink-0">
                <FaPaperPlane size={13} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, dark }: { label: string; value: string; dark: boolean }) => (
  <div className={`flex justify-between pb-2 border-b gap-4 ${dark ? "border-gray-800" : "border-gray-200"}`}>
    <span className={`flex-shrink-0 ${dark ? "text-gray-400" : "text-gray-500"}`}>{label}</span>
    <span className="font-medium text-right">{value}</span>
  </div>
);

const ActionBtn = ({
  icon, text, color,
}: {
  icon: React.ReactNode; text: string; color: "green" | "red" | "yellow";
}) => {
  const colors = {
    green:  "bg-green-600 hover:bg-green-700",
    red:    "bg-red-600 hover:bg-red-700",
    yellow: "bg-yellow-600 hover:bg-yellow-700",
  };
  return (
    <button className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition w-full sm:w-auto ${colors[color]}`}>
      {icon} {text}
    </button>
  );
};

export default MBookingDetails;