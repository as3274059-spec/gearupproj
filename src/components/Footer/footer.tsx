import React from "react";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaLinkedin,
  FaGlobe,
  FaTwitter,
} from "react-icons/fa";

const Footer: React.FC = () => {
  const footerGroups = [
    {
      title: "روابط سريعة",
      links: ["الرئيسية", "المميزات", "كيف نعمل", "الأسعار", "تواصل معنا"],
    },
    {
      title: "المميزات",
      links: ["تشخيص ذكي", "إدارة الورش", "إدارة المخزون", "تقارير وتحليلات"],
    },
    {
      title: "الدعم",
      links: ["الدعم الفني", "الأسئلة الشائعة", "دليل المستخدم", "سياسة الخصوصية"],
    },
  ];

  return (
    <footer
      id="footer"
      dir="rtl"
      // 1. تفعيل الخلفية الداكنة للفوتر
      className="mt-12 border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr]">
        {/* قسم الشعار والوصف */}
        <div className="space-y-4">
          <img
            src="/gearup-logo-v2.png"
            alt="GearUp"
            // 2. إعدادات اللوجو: دائرة، خلفية غامقة في الدارك، وعكس الألوان (invert) ليظهر أبيض
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-2 dark:bg-[#0F1729]  "
          />
          <p className="text-sm leading-7 text-slate-500 dark:text-slate-400">
            منصة ذكية لصيانة السيارات مدعومة بالذكاء الاصطناعي لتقديم أفضل
            خدمة لعملائنا وشركائنا.
          </p>
        </div>

        {/* الأقسام المتكررة (روابط، مميزات، دعم) */}
        {footerGroups.map((group, index) => (
          <div key={index} className="flex flex-col space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {group.title}
            </h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              {group.links.map((link, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="transition duration-200 hover:text-blue-600 hover:underline dark:hover:text-blue-400"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* قسم التواصل */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">تواصل معنا</h3>
          <div className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              {/* 3. تعديل خلفية الأيقونات لتتناسب مع الدارك مود */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400">
                <FaPhone className="text-sm" />
              </div>
              <span dir="ltr">+966 50 123 4567</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400">
                <FaEnvelope className="text-sm" />
              </div>
              <span>info@gearup.app</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400">
                  <FaMapMarkerAlt className="text-sm" />
                </div>
              <span>الرياض، المملكة العربية السعودية</span>
            </div>
          </div>

          {/* أيقونات السوشيال ميديا */}
          <div className="mt-2 flex items-center gap-4 text-slate-400 dark:text-slate-500">
            <a href="#" className="transition hover:text-blue-700 dark:hover:text-blue-400">
              <FaLinkedin size={20} />
            </a>
            <a href="#" className="transition hover:text-blue-700 dark:hover:text-blue-400">
              <FaGlobe size={20} />
            </a>
            <a href="#" className="transition hover:text-blue-700 dark:hover:text-blue-400">
              <FaTwitter size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* حقوق النشر */}
      <div className="mx-auto mt-12 max-w-7xl border-t border-slate-200 pt-6 text-center text-sm text-slate-400 dark:border-slate-800 dark:text-slate-500">
        © 2025 GearUp. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
};

export default Footer;