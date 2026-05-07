
import { useState } from "react";

const UploadLicense = () => {
  const [file, setFile] = useState<File | null>(null);
  const userId = localStorage.getItem("pendingMechanicId");

  const handleUpload = async () => {
    if (!file) {
      alert("الرجاء اختيار ملف أولاً");
      return;
    }

    const formData = new FormData();
    // تأكد من أن هذه البيانات مطابقة لما يتوقعه الـ API الجديد
    formData.append("UserId", userId!); 
    formData.append("File", file!);
    formData.append("IsWorkshopLicense", "true");

    try {
      const res = await fetch(
        "https://gearupapp.runasp.net/api/admin/verify-document", // تم تحديث الرابط هنا
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        localStorage.removeItem("pendingMechanicId");
        window.location.href = "/login";
      } else {
        alert("حدث خطأ أثناء الرفع");
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    // الخلفية الخارجية (خفيفة) وتوسيط العنصر
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4 font-sans">
      
      {/* الكارت الرئيسي */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        
        {/* الجزء العلوي: الأيقونة والعنوان */}
        <div className="text-center pt-8 pb-2 px-6">
          <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            {/* أيقونة السحابة */}
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">رفع رخصة الورشة</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            قم برفع صورة واضحة لترخيص الورشة الخاصة بك
          </p>
        </div>

        {/* منطقة الرفع (Dashed Box) */}
        <div className="px-6 mt-4">
          <label
            htmlFor="dropzone-file"
            className={`flex flex-col items-center justify-center w-full h-40 border-2 ${
              file ? "border-blue-500 bg-blue-50" : "border-blue-200 bg-gray-50"
            } border-dashed rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all duration-300`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {/* أيقونة التحميل */}
              <svg
                className="w-8 h-8 mb-3 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                ></path>
              </svg>
              
              {/* النصوص */}
              {file ? (
                <p className="mb-2 text-sm font-semibold text-blue-600">{file.name}</p>
              ) : (
                <p className="mb-2 text-sm text-gray-500 font-medium">
                  <span className="font-semibold">اضغط لرفع الملف</span> أو اسحبه هنا
                </p>
              )}
              
              <p className="text-xs text-gray-400"> PNG, JPG, JPEG</p>
            </div>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        {/* الأزرار */}
        <div className="p-6">
          <button
            onClick={handleUpload}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition transform active:scale-95"
          >
            تحميل الملف
          </button>
          
          <div className="text-center mt-4">
            <button
              onClick={() => window.history.back()} // أو المسار المناسب للرجوع
              className="text-gray-400 hover:text-blue-600 text-sm font-medium transition"
            >
              الصفحة السابقة ←
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadLicense;