import React from "react";
import { motion } from "framer-motion";
import {
  FaBrain,
  FaUserCheck,
  FaCar,
  FaLinkedin,
  FaGlobe,
  FaXTwitter,
  FaCartShopping,
  FaChartLine,
  FaScrewdriverWrench,
  FaHeadset,
  FaCircleCheck,
  FaMagnifyingGlass,
  FaGear,
} from "react-icons/fa6";
import Footer from "../../components/Footer/footer";
import ThemeToggle from "../../components/ThemeToggle/theme_toggle";

const navLinks = [
  { label: "الرئيسية",  target: "home"         },
  { label: "المميزات",  target: "features"      },
  { label: "كيف يعمل", target: "how-it-works"  },
  { label: "فريق العمل",target: "team"          },
  { label: "تواصل معنا",target: "footer-section"},
];

const teamMembers = [
  { name: "Rahma Hassan",        role: "Front End", avatar: "RH" },
  { name: "Eman Saleh",          role: "Front End", avatar: "ES" },
  { name: "Ali Gamal",           role: "UI / UX",   avatar: "AG" },
  { name: "Amr Mohamed",         role: "Mobile",    avatar: "AM" },
  { name: "Gahad Abdollah",      role: "AI",        avatar: "GA" },
  { name: "Montaha Ahmed",       role: "AI",        avatar: "MA" },
  { name: "Rawan Adel",          role: "Back End",  avatar: "RA" },
  { name: "Alshimaa Mohamed",    role: "Back End",  avatar: "SM" },
  { name: "Youstina Magdy",      role: "Back End",  avatar: "YM" },
  { name: "Mohamed Abdelfatah",  role: "Back End",  avatar: "MF" },
];

const features = [
  { icon: <FaBrain />,            title: "تشخيص ذكي",         desc: "تحليل سريع ودقيق لمشاكل السيارة ومساعدتك في الوصول للحل المناسب."          },
  { icon: <FaScrewdriverWrench />,title: "إدارة الورش",        desc: "متابعة الطلبات والخدمات والميكانيكيين من مكان واحد بشكل منظم."              },
  { icon: <FaChartLine />,        title: "تقارير ذكية",        desc: "تقارير واضحة تساعدك في متابعة الأداء واتخاذ قرارات أفضل."                  },
  { icon: <FaCartShopping />,     title: "إدارة قطع الغيار",   desc: "تنظيم الطلبات والمخزون وعمليات البحث عن القطع بسهولة."                      },
  { icon: <FaUserCheck />,        title: "حجز المواعيد",       desc: "احجز مع الميكانيكي المناسب وحدد الوقت المتاح بسهولة."                       },
  { icon: <FaHeadset />,          title: "دعم ومتابعة",        desc: "متابعة مستمرة وتجربة استخدام أسهل وأكثر احترافية."                          },
];

const steps = [
  { icon: <FaCar />,              title: "أدخل بيانات سيارتك", desc: "أدخل بيانات السيارة أو رقم اللوحة للبدء.",                                  number: "1" },
  { icon: <FaBrain />,            title: "تحليل ذكي",          desc: "الذكاء الاصطناعي يحلل الحالة ويقترح الأعطال المحتملة.",                      number: "2" },
  { icon: <FaMagnifyingGlass />,  title: "تحديد الأعطال",      desc: "عرض الأسباب المتوقعة والحلول أو الإجراءات المقترحة.",                        number: "3" },
  { icon: <FaScrewdriverWrench />,title: "تنفيذ ومتابعة",      desc: "تنفيذ الصيانة ومتابعة حالة السيارة والخدمة.",                                number: "4" },
];

// const stats = [
//   { value: "24/7", label: "دعم فني",       icon: <FaHeadset />         },
//   { value: "98%",  label: "دقة تشخيص",    icon: <FaBrain />           },
//   { value: "+50K", label: "عميل نشط",      icon: <FaCircleCheck />     },
//   { value: "+10K", label: "ورشة موثوقة",   icon: <FaScrewdriverWrench />},
// ];

const systemsLeft  = [{ label: "نظام التعليق" }, { label: "نظام الفرامل"  }, { label: "نظام التوجيه"  }];
const systemsRight = [{ label: "نظام التبريد" }, { label: "نظام الوقود"   }, { label: "نظام الكهرباء" }];

// ======= Variants =======
const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const staggerFast = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const cardVariant = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const viewport = { once: true, amount: 0.15 };

const Landing: React.FC = () => {
  const handleScroll = (target: string) => {
    const section = document.getElementById(target);
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      id="home"
      dir="rtl"
      className="min-h-screen bg-[#f7f9fd] dark:bg-primary_BGD text-gray-900 dark:text-white transition-colors duration-500"
    >
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-gray-200/70 dark:border-gray-800 bg-white/85 dark:bg-[#0F172AE6] backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-10 py-4">
          <motion.img
            src="/gearup-logo-v2.png"
            alt="GearUp"
            className="w-16 h-16 sm:w-20 sm:h-20 dark:bg-{#FEFEFF} rounded-full p-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          />

          <motion.div
            className="hidden lg:flex items-center gap-7"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {navLinks.map((link) => (
              <button
                key={link.target}
                onClick={() => handleScroll(link.target)}
                className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#2563EB] transition-colors"
              >
                {link.label}
              </button>
            ))}
          </motion.div>

          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <button
              onClick={() => (window.location.href = "/login")}
              className="hidden sm:inline-flex border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-white px-5 py-2 rounded-xl text-sm font-semibold hover:border-[#2563EB] hover:text-[#2563EB] transition"
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => (window.location.href = "/register")}
              className="bg-[#2563EB] px-5 py-2 rounded-xl text-white text-sm font-semibold hover:bg-blue-600 transition shadow-sm"
            >
              ابدأ الآن
            </button>
            <ThemeToggle />
          </motion.div>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" className="scroll-mt-24 px-4 sm:px-6 lg:px-10 pt-8 sm:pt-10 lg:pt-12 pb-14">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Text side */}
          <motion.div
            className="order-2 lg:order-1 text-center lg:text-right"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.span
              variants={cardVariant}
              className="inline-flex rounded-full bg-blue-50 dark:bg-blue-900/20 text-[#2563EB] text-xs sm:text-sm font-bold px-4 py-2 mb-5"
            >
              منصة GearUp
            </motion.span>

            <motion.h1
              variants={cardVariant}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.35] mb-5"
            >
              العناية بالسيارة بطريقة
              <span className="block text-[#2563EB] mt-8 mb-8">أسهل وأكثر ذكاءً</span>
            </motion.h1>

            <motion.p
              variants={cardVariant}
              className="text-sm sm:text-base lg:text-lg leading-8 text-gray-600 dark:text-gray-300 mb-16 max-w-2xl mx-auto lg:mx-0"
            >
              منصة ذكية مدعومة بالذكاء الاصطناعي، تبسّط عمليات الصيانة والتشخيص
              وتمنحك تجربة أكثر راحة واحترافية لإدارة كل ما يخص سيارتك.
            </motion.p>

            <motion.div
              variants={cardVariant}
              className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4"
            >
              <button
                onClick={() => (window.location.href = "/register")}
                className="bg-[#2563EB] text-white h-11 px-7 rounded-2xl text-sm font-bold hover:bg-blue-600 transition shadow-md"
              >
                ابدأ الآن
              </button>
              <button
                onClick={() => handleScroll("features")}
                className="bg-white dark:bg-[#131A2E] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white h-11 px-7 rounded-2xl text-sm font-bold hover:border-[#2563EB] hover:text-[#2563EB] transition"
              >
                تعرف على المميزات
              </button>
            </motion.div>

            {/* Stats */}
            {/* <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10"
              variants={staggerFast}
              initial="hidden"
              animate="visible"
            >
              {stats.map((item, index) => (
                <motion.div
                  key={index}
                  variants={cardVariant}
                  className="bg-white dark:bg-[#131A2E] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[#2563EB] flex items-center justify-center mx-auto mb-3">
                    {item.icon}
                  </div>
                  <div className="text-lg font-extrabold text-[#2563EB]">{item.value}</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{item.label}</div>
                </motion.div>
              ))}
            </motion.div> */}
          </motion.div>

          {/* Image side */}
          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="relative overflow-hidden rounded-[32px] lg:rounded-[40px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
              <img
                src="/011_hero_workshop_technician.png"
                alt="GearUp Hero"
                className="w-full h-[320px] sm:h-[430px] lg:h-[540px] object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-3 bg-[#8cb8ff]" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-24 px-4 sm:px-6 lg:px-10 py-16">
        <motion.div
          className="max-w-7xl mx-auto text-center mb-12"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">كل ما تحتاجه في مكان واحد</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-8 max-w-3xl mx-auto">
            من التشخيص الذكي إلى إدارة الورش والطلبات وقطع الغيار، كل شيء في واجهة واحدة بشكل بسيط ومرتب.
          </p>
        </motion.div>

        <motion.div
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariant}
              whileHover={{ y: -6 }}
              className="bg-white dark:bg-[#131A2E] border border-gray-100 dark:border-gray-800 rounded-[24px] p-6 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-[#2563EB] text-2xl flex items-center justify-center mb-4 text-center mx-auto">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-2 text-center">{feature.title}</h3>
              <p className="text-sm leading-7 text-gray-500 dark:text-gray-400 text-center">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CAR SYSTEMS */}
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative rounded-[40px]">

            {/* Car image */}
            <div className="mx-auto max-w-4xl">
              <motion.img
                src="/02_car_systems_cutaway.png"
                alt="Car Systems"
                className="mx-auto w-full max-w-3xl object-contain"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              />
            </div>

            {/* Desktop labels left */}
            <div className="hidden lg:block">
              {systemsLeft.map((item, index) => {
                const positions = ["top-10", "top-1/2 -translate-y-1/2", "bottom-10"];
                return (
                  <motion.div
                    key={index}
                    className={`absolute left-0 ${positions[index]} flex items-center gap-4`}
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
                        {item.label}
                      </div>
                      <span className="h-px w-28 border-t border-dashed border-blue-300" />
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-[#2f7df6] shadow-sm">
                      <FaGear />
                    </div>
                  </motion.div>
                );
              })}

              {/* Desktop labels right */}
              {systemsRight.map((item, index) => {
                const positions = ["top-10", "top-1/2 -translate-y-1/2", "bottom-10"];
                return (
                  <motion.div
                    key={index}
                    className={`absolute right-0 ${positions[index]} flex items-center gap-4`}
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-[#2f7df6] shadow-sm">
                      <FaGear />
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="h-px w-28 border-t border-dashed border-blue-300" />
                      <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
                        {item.label}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Mobile labels */}
            <motion.div
              className="mt-8 grid grid-cols-2 gap-3 lg:hidden"
              variants={staggerFast}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[...systemsLeft, ...systemsRight].map((item, index) => (
                <motion.div
                  key={index}
                  variants={cardVariant}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm"
                >
                  <span className="text-[#2f7df6]"><FaGear /></span>
                  {item.label}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="scroll-mt-24 px-4 sm:px-6 lg:px-10 py-16">
        <motion.div
          className="max-w-7xl mx-auto text-center mb-12"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">كيف يعمل GearUp</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-8 max-w-2xl mx-auto">
            خطوات بسيطة تبدأ من إدخال البيانات وتنتهي بتجربة صيانة أذكى وأسهل.
          </p>
        </motion.div>

        <motion.div
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={cardVariant}
              whileHover={{ y: -6 }}
              className="bg-white dark:bg-[#131A2E] border border-gray-100 dark:border-gray-800 rounded-[24px] p-6 shadow-sm text-center"
            >
              <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white text-sm font-bold flex items-center justify-center mx-auto">
                {step.number}
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-[#2563EB] text-2xl flex items-center justify-center mx-auto mt-4 mb-4">
                {step.icon}
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm leading-7 text-gray-500 dark:text-gray-400">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* TEAM */}
      <section id="team" className="scroll-mt-24 px-4 sm:px-6 lg:px-10 py-16">
        <motion.div
          className="max-w-7xl mx-auto text-center mb-12"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">فريق العمل</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            الفريق المسؤول عن تطوير منصة GearUp
          </p>
        </motion.div>

        <motion.div
          className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              variants={cardVariant}
              whileHover={{ y: -6 }}
              className="bg-white dark:bg-[#131A2E] border border-gray-100 dark:border-gray-800 rounded-[24px] p-5 text-center shadow-sm hover:shadow-lg transition"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2563EB] to-cyan-400 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                {member.avatar}
              </div>
              <h3 className="text-sm sm:text-base font-bold">{member.name}</h3>
              <p className="text-xs sm:text-sm text-[#2563EB] mt-1 font-medium">{member.role}</p>
              <div className="flex justify-center gap-4 text-gray-400 mt-4 text-sm">
                <FaLinkedin className="hover:text-[#2563EB] cursor-pointer transition" />
                <FaGlobe    className="hover:text-[#2563EB] cursor-pointer transition" />
                <FaXTwitter className="hover:text-[#2563EB] cursor-pointer transition" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section id="cta" className="scroll-mt-24 px-4 sm:px-6 lg:px-10 py-12">
        <motion.div
          className="max-w-7xl mx-auto overflow-hidden rounded-[32px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#131A2E] shadow-sm"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            <div className="order-2 lg:order-1 p-6 sm:p-8 lg:p-10">
              <motion.h2
                className="text-2xl sm:text-3xl font-extrabold leading-relaxed mb-4"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
              >
                جاهزون لتجربة صيانة أكثر ذكاءً؟
              </motion.h2>

              <motion.p
                className="text-sm sm:text-base leading-8 text-gray-500 dark:text-gray-400 mb-8 max-w-xl"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
              >
                انضم إلى مستخدمي GearUp واستمتع بتجربة أكثر سرعة وتنظيمًا في التشخيص والصيانة والمتابعة.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
              >
                <button
                  onClick={() => (window.location.href = "/register")}
                  className="bg-[#2563EB] text-white h-11 px-7 rounded-2xl text-sm font-bold hover:bg-blue-600 transition"
                >
                  ابدأ الآن
                </button>
                <button
                  onClick={() => (window.location.href = "/login")}
                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0d1629] text-gray-700 dark:text-white h-11 px-7 rounded-2xl text-sm font-bold hover:border-[#2563EB] hover:text-[#2563EB] transition"
                >
                  تسجيل الدخول
                </button>
              </motion.div>
            </div>

            <div className="order-1 lg:order-2 relative">
              <motion.img
                src="/landing.jpg"
                alt="Landing CTA"
                className="w-full h-[280px] sm:h-[340px] lg:h-[380px] object-cover"
                initial={{ opacity: 0, scale: 1.04 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              />
              <motion.div
                className="absolute top-4 right-4 bg-white/95 dark:bg-[#0d1629]/95 backdrop-blur rounded-[20px] p-4 shadow-lg"
                initial={{ opacity: 0, y: -16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="space-y-3 text-xs sm:text-sm font-semibold">
                  {["تشخيص أسرع", "تقارير دقيقة", "زيادة كفاءة", "تنظيم أفضل"].map((text, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                    >
                      <span className="text-[#2563EB]"><FaCircleCheck /></span>
                      {text}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <section id="footer-section" className="scroll-mt-24">
        <Footer />
      </section>
    </div>
  );
};

export default Landing;