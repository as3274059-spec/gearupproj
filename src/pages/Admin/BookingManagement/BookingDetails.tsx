
import React from "react";
import AdminSidebar from "../../../components/AdminSidebar/AdminSidebar";
import { useTheme } from "../../../contexts/ThemeContext";
import { FaSyncAlt, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

const BookingDetails: React.FC = () => {
  const { dark } = useTheme();

  const themeClass = dark ? "bg-primary_BGD text-white" : "bg-white text-[#1E3A5F]";
  const cardClass = "bg-[#137FEC1A] border-transparent";
  const titleClass = dark ? "text-white font-bold" : "text-black font-bold";

  return (

    <div className={`flex flex-col lg:flex-row min-h-screen transition-colors duration-500 ${themeClass}`} dir="rtl">
      
      {/* SIDEBAR WRAPPER */}

      <div className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen z-40">
        <AdminSidebar />
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 w-full overflow-x-hidden">
        {/* Breadcrumb */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="text-sm">
            لوحة القيادة / الحجوزات / <span className="font-bold">رقم الحجز #BK-2024-12345</span>
          </div>
        </div>

        {/* Grid Main */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`p-6 rounded-2xl ${cardClass}`}>
              <h3 className={`text-xl mb-6 ${titleClass}`}>العميل والمركبة</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 text-right">
                <div>
                  <p className="text-xs opacity-60">الاسم</p>
                  <p className="font-bold">جون ادورد</p>
                </div>
                <div>
                  <p className="text-xs opacity-60">المركبة</p>
                  <p className="font-bold">2021 Toyota Camry</p>
                </div>
                <div>
                  <p className="text-xs opacity-60">بريد إلكتروني</p>
                  <p className="font-bold underline text-sm">john.doe@example.com</p>
                </div>
                <div>
                  <p className="text-xs opacity-60">لوحة ترخيص</p>
                  <p className="font-bold" dir="ltr">XYZ-1234</p>
                </div>
                <div>
                  <p className="text-xs opacity-60">هاتف</p>
                  <p className="font-bold inline-block" dir="ltr">(555) 123-4567</p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl ${cardClass}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                 <h3 className={`text-xl ${titleClass}`}>تفاصيل الميكانيكي</h3>
                 <button className="bg-[#137FEC] text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-[#0F6AD1] transition-colors">
                   اتصل بالميكانيكي
                 </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 text-right">
                <div>
                  <p className="text-xs opacity-60">معين إلى</p>
                  <p className="font-bold">جون ادورد</p>
                </div>
                <div>
                  <p className="text-xs opacity-60">شركة</p>
                  <p className="font-bold text-[#137FEC]">AutoCare Experts</p>
                </div>
                <div>
                  <p className="text-xs opacity-60">هاتف</p>
                  <p className="font-bold inline-block" dir="ltr">(555) 987-6543</p>
                </div>
                <div>
                  <p className="text-xs opacity-60">تصنيف</p>
                  <p className="font-bold" dir="ltr">4.8 / 5</p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl ${cardClass}`}>
              <h3 className={`text-xl mb-4 ${titleClass}`}>دفع الخدمة</h3>
              <div className="mb-6">
                <p className="font-bold mb-2">الخدمات المطلوبة</p>
                <ul className="text-sm opacity-80 space-y-1">
                  <li>تغيير الزيت الاصطناعي بالكامل</li>
                  <li>تدوير الإطارات وموازنة الإطارات</li>
                  <li>فحص الفرامل</li>
                </ul>
              </div>
              <div className="mb-6 border-t pt-4 border-dashed border-gray-400/30">
                <p className="font-bold mb-2 text-sm">ملاحظات العملاء</p>
                <div className="p-3 rounded-xl text-xs bg-black/5 dark:bg-white/5">
                  كانت السيارة تصدر صوت صرير خفيف من العجلة الأمامية اليمنى عند الكبح بسرعات منخفضة.
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-dashed border-gray-400/30">
                <p className="font-bold">ملخص الدفع</p>
                <div className="flex justify-between text-sm">
                  <span>تكلفة الخدمة:</span>
                  <span className="text-[#137FEC] font-bold" dir="ltr">$120.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>أجزاء:</span>
                  <span className="text-[#137FEC] font-bold" dir="ltr">$120.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>الضرائب والرسوم:</span>
                  <span className="text-[#137FEC] font-bold" dir="ltr">$120.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-dashed pt-3 mt-3 border-gray-400/30">
                  <span>الاجمالي :</span>
                  <span className="text-red-500" dir="ltr">$360.00</span>
                </div>
                <div className="text-left mt-2">
                  <span className="text-xs font-bold text-green-500">حالة الدفع : مدفوع</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl ${cardClass}`}>
              <h3 className={`text-lg mb-4 text-center ${titleClass}`}>حالة الحجز</h3>
              <div className="flex flex-col items-center gap-2">
                <FaSyncAlt className={`text-[#137FEC] ${dark ? 'animate-spin' : ''}`} />
                <span className="text-[#137FEC] font-bold">جاري المعالجة</span>
                <span className="text-[10px] opacity-50">آخر تحديث: منذ ساعتين</span>
              </div>
            </div>

            <div className={`p-6 rounded-2xl ${cardClass}`}>
              <h3 className={`text-lg mb-4 text-center ${titleClass}`}>جدولة الموقع</h3>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-6">
                <div className="p-2 bg-[#137FEC26] rounded-lg"><FaCalendarAlt className="text-[#137FEC]" /></div>
                <div>
                  <p className="text-xs opacity-60">التاريخ والوقت</p>
                  <p className="text-sm font-bold">28 أغسطس 2024 الساعة 2:00 مساءً</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="p-2 bg-[#137FEC26] rounded-lg"><FaMapMarkerAlt className="text-[#137FEC]" /></div>
                <div>
                  <p className="text-xs opacity-60">الموقع</p>
                  <p className="text-sm font-bold">123 شارع ماين، أي تاون، الولايات المتحدة الأمريكية 12345</p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl ${cardClass}`}>
              <h3 className={`text-lg mb-6 text-center ${titleClass}`}>سجل الحجز</h3>
              <div className="space-y-6 relative before:hidden sm:before:block before:absolute before:h-full before:w-[1px] before:bg-gray-500/30 before:right-2">
                <TimelineItem 
                  color="bg-green-500" 
                  title="تم تغيير الحالة إلى قيد التقدم" 
                  date="28 أغسطس (آب) 2024 - 2:15 مساءً" 
                />
                <TimelineItem 
                  color="bg-[#137FEC]" 
                  title="ميكانيكي معين" 
                  date="28 أغسطس (آب) 2024 - 11:30 صباحاً" 
                />
                <TimelineItem 
                  color="bg-red-500" 
                  title="تم تأكيد الحجز" 
                  date="27 أغسطس (آب) 2024 - 5:45 مساءً" 
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};


const TimelineItem = ({ color, title, date }: { color: string, title: string, date: string }) => (
  <div className="relative pr-8">
    <div className={`absolute right-0 top-1 w-4 h-4 rounded-full border-2 border-[#f0f7ff] dark:border-[#1e2a44] ${color}`}></div>
    <p className="text-sm font-bold leading-tight">{title}</p>
    <p className="text-[10px] opacity-60">{date}</p>
  </div>
);

export default BookingDetails;