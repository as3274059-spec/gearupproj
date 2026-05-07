
import React from "react";
import { FaTimes } from "react-icons/fa";

interface AddSupervisorProps {
  dark: boolean;
  onClose: () => void;
}

const AddSupervisor: React.FC<AddSupervisorProps> = ({ dark, onClose }) => {
  const inputClasses = `
    w-full rounded-lg px-4 py-3 text-sm
    ${dark ? "bg-[#122b4d] text-white" : "bg-[#dbeafe] text-gray-900"}
    border border-transparent outline-none focus:border-blue-500 transition-all duration-200
  `;

  return (
    <div dir="rtl" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl transition-all ${dark ? "bg-[#0b1d33] text-white" : "bg-[#eef5ff] text-gray-900"}`}>
        
        {/* Header */}
        <div className={`px-6 md:px-8 py-5 border-b flex items-center justify-between ${dark ? "border-blue-900" : "border-blue-200"}`}>
          <div>
            <h2 className="text-lg md:text-xl font-bold">إضافة مسؤول جديد</h2>
            <p className={`text-[10px] md:text-xs mt-1 ${dark ? "text-gray-400" : "text-gray-500"}`}>املأ البيانات لإنشاء حساب جديد</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition"><FaTimes /></button>
        </div>

        {/* Body - Scrollable */}
        <div className="px-6 md:px-8 py-6 space-y-5 overflow-y-auto overflow-x-hidden">
          <div className="space-y-1">
            <label className="block text-xs md:text-sm font-bold">الاسم بالكامل</label>
            <input type="text" placeholder="أدخل الاسم الكامل" className={inputClasses} />
          </div>

          <div className="space-y-1">
            <label className="block text-xs md:text-sm font-bold">البريد الإلكتروني</label>
            <input type="email" placeholder="example@mail.com" className={inputClasses} />
          </div>

          {/* Grid: 1 column on mobile, 2 columns on tablets/desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="block text-xs md:text-sm font-bold">كلمة المرور</label>
              <input type="password" placeholder="••••••••" className={inputClasses} />
            </div>
            <div className="space-y-1">
              <label className="block text-xs md:text-sm font-bold">تأكيد كلمة المرور</label>
              <input type="password" placeholder="••••••••" className={inputClasses} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 md:px-8 py-5 flex flex-col sm:flex-row justify-start gap-3 border-t" style={{ borderColor: dark ? "#1E2A44" : "#DCEEFF" }}>
          <button className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#137FEC] text-white text-sm font-bold hover:scale-[1.02] active:scale-95 transition-all">
            إضافة مشرف
          </button>
          <button onClick={onClose} className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gray-500/20 text-current text-sm font-bold hover:bg-gray-500/30 transition-all">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSupervisor;