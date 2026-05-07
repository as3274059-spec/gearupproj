import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import {
  MdSend,
  MdSmartToy,
  MdAutoAwesome,
  MdOutlineAttachFile,
  MdClose,
  MdCreate,
  MdDirectionsCar,
  MdKeyboardArrowDown,
} from "react-icons/md";
import toast from "react-hot-toast";
import Header from "../../../components/Customer/customer_header";
import Sidebar from "../../../components/Customer/customer_sidebar";
import CreateReminderModal from "../Reminder/create_reminder_modal";
import { useNavigate } from "react-router-dom";
// ===== الأنواع =====
interface ReminderData {
  title: string;
  description: string;
  frequency: string;
  start_date: string;
  end_date: string;
  notification_time: string;
}

interface ReminderPrefillData {
  title?: string;
  description?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  preferredNotificationTime?: string;
}
interface Technician {
  id: number;
  name: string;
  specialty?: string;
  image?: string;
  phone?: string;
  lat?: number;
  lng?: number;
}

interface Message {
  issue_summary?: string;
  id: number;
  role: "bot" | "user";
  text: string;
  time: string;
  imagePreview?: string;
  offersReminder?: boolean;
  reminder?: ReminderData | null;
  followUpQuestions?: string[];
  technicians?: Technician[];
  requires_mechanic?: boolean; // ← أضفها هنا
  requires_feedback?: boolean;
  is_emergency?: boolean;
  required_service?: string;
  recommended_mechanics?: any[];
  car_id?: string;
}

interface ParsedReply {
  query?: string;
  ai_answer?: string;
  reply?: string;
  message?: string;
  answer?: string;
  requires_feedback?: boolean;
  requires_mechanic?: boolean;
  offers_reminder?: boolean;
  suggested_reminder_title?: string;
  suggested_reminder_desc?: string;
  suggested_frequency?: string;
  suggested_date?: string;
  suggested_end_date?: string;
  notification_time?: string;
  is_emergency?: boolean;
  required_service?: string;
  recommended_mechanics?: any[];
  car_id?: string;
}

interface CarItem {
  id: string;
  brand: string;
  model: string;
  year: number;
  carPhotoUrl?: string;
}

interface FormattedChatResponse {
  text: string;
  followUpQuestions: string[];
  reminder: ReminderData | null;
  offersReminder: boolean;
  requiresFeedback: boolean;
}

// ===== الثوابت =====
const API_URL = "https://gearupapp.runasp.net/api/Chatbot/message";
const CHAT_STORAGE_KEY = "gearup_chat_messages";
const hasTechnicians = (techs?: Technician[]) => (techs?.length ?? 0) > 0;
const SUGGESTED_QUESTIONS = [
  "كيف أحجز موعد صيانة؟",
  "ما هي قطع الغيار المتاحة؟",
  "متى موعد الصيانة القادمة؟",
  "كيف أتابع طلب الصيانة؟",
];

const getTime = () =>
  new Date().toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

const initialBotMessage: Message = {
  id: 1,
  role: "bot",
  text: "مرحبًا 👋 أنا مساعد GearUp الذكي. أقدر أساعدك في الصيانة، الأعطال، المواعيد، وطلبات الخدمة. كيف أساعدك اليوم؟",
  time: "الآن",
};

// ===== helper functions =====
const safeJsonParse = (value: string): unknown | null => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

// بيفك أي JSON متداخل
const deepParseJSON = (value: unknown): unknown => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  const parsed = safeJsonParse(trimmed);

  if (parsed === null) return value;

  if (typeof parsed === "string") {
    return deepParseJSON(parsed);
  }

  if (typeof parsed === "object" && parsed !== null) {
    const obj = parsed as Record<string, unknown>;

    // لو ai_answer نفسه JSON
    if (typeof obj.ai_answer === "string") {
      const nestedAi = safeJsonParse(obj.ai_answer);
      if (nestedAi && typeof nestedAi === "object") {
        return {
          ...obj,
          ...(nestedAi as Record<string, unknown>),
        };
      }
    }

    return obj;
  }

  return parsed;
};

const cleanAiAnswerText = (text: string): string => {
  if (!text) return "";

  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^\*\s+/gm, "• ")
    .replace(/^-+\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const extractFollowUpQuestions = (text: string): string[] => {
  if (!text) return [];

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line.startsWith("•") || line.startsWith("*") || line.startsWith("-"))
    .map((line) => line.replace(/^(•|\*|-)\s*/, "").trim())
    .filter(Boolean);
};

const removeFollowUpQuestionsFromText = (text: string): string => {
  if (!text) return "";

  const lines = text
    .split("\n")
    .map((line) => line.trimEnd());

  const cleanedLines = lines.filter((line) => {
    const trimmed = line.trim();
    return !(trimmed.startsWith("•") || trimmed.startsWith("*") || trimmed.startsWith("-"));
  });

  return cleanedLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
};

const parseReplyData = (reply: unknown): ParsedReply | null => {
  if (!reply) return null;

  const resolved = deepParseJSON(reply);

  if (typeof resolved === "object" && resolved !== null) {
    return resolved as ParsedReply;
  }

  if (typeof resolved === "string") {
    return { ai_answer: resolved };
  }

  return null;
};

const formatChatResponse = (parsed: ParsedReply | null, rawReply: unknown): FormattedChatResponse => {
  const rawText =
    parsed?.ai_answer ||
    parsed?.reply ||
    parsed?.message ||
    parsed?.answer ||
    (typeof rawReply === "string" ? rawReply : "") ||
    "تم استلام رسالتك بنجاح.";

  const cleanedText = cleanAiAnswerText(rawText);
  const followUpQuestions = parsed?.requires_feedback
    ? extractFollowUpQuestions(cleanedText)
    : [];

  const finalText = parsed?.requires_feedback
    ? removeFollowUpQuestionsFromText(cleanedText)
    : cleanedText;

  const reminder =
    parsed?.offers_reminder
      ? {
        title: parsed.suggested_reminder_title || "",
        description: parsed.suggested_reminder_desc || "",
        frequency: parsed.suggested_frequency || "",
        start_date: parsed.suggested_date || "",
        end_date: parsed.suggested_end_date || "",
        notification_time: parsed.notification_time || "",
      }
      : null;

  return {
    text: finalText || "تم استلام رسالتك بنجاح.",
    followUpQuestions,
    reminder,
    offersReminder: !!parsed?.offers_reminder,
    requiresFeedback: !!parsed?.requires_feedback,
  };
};

// ===== كومبوننت اختيار السيارة =====
const CarSelector = ({
  cars,
  selectedCarId,
  onSelect,
}: {
  cars: CarItem[];
  selectedCarId: string | null;
  onSelect: (car: CarItem) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedCar = cars.find((c) => c.id === selectedCarId) || null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!cars.length) return null;

  return (
    <div className="relative flex-shrink-0 min-w-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E293B] hover:border-[#137FEC] transition-all text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm min-w-0  max-w-[140px] md:max-w-[180px]"
      >
        <div className="w-7 h-7 rounded-lg overflow-hidden bg-blue-50 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-gray-600">
          {selectedCar?.carPhotoUrl ? (
            <img
              src={selectedCar.carPhotoUrl}
              alt={selectedCar.brand}
              className="w-full h-full object-cover"
            />
          ) : (
            <MdDirectionsCar size={16} className="text-[#137FEC]" />
          )}
        </div>

        <span className="truncate flex-1 text-right">
          {selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : "اختر سيارة"}
        </span>

        <MdKeyboardArrowDown
          size={16}
          className={`flex-shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 w-64 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-20 overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-[11px] font-bold text-gray-400 px-2">
              اختر السيارة التي تسأل عنها
            </p>
          </div>

          <div className="max-h-52 overflow-y-auto overflow-x-hidden p-2 space-y-1">
            {cars.map((car) => {
              const isSelected = car.id === selectedCarId;
              return (
                <button
                  key={car.id}
                  type="button"
                  onClick={() => {
                    onSelect(car);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-right min-w-0 ${isSelected
                    ? "bg-[#137FEC]/10 text-[#137FEC] border border-[#137FEC]/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                    }`}
                >
                  <div className="w-10 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-gray-600">
                    {car.carPhotoUrl ? (
                      <img
                        src={car.carPhotoUrl}
                        alt={car.brand}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MdDirectionsCar size={18} className="text-gray-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm truncate">
                      {car.brand} {car.model}
                    </p>
                    <p className="text-[11px] text-gray-400">{car.year}</p>
                  </div>

                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-[#137FEC] flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ===== مكوّن الرسالة =====
const MessageBubble = ({
  msg,
  onCreateReminder,
  onFollowUpClick,
  previousUserMessage,

}: {
  msg: Message;
  onCreateReminder: (reminder: ReminderData) => void;
  onFollowUpClick: (question: string) => void;
  selectedCarId: string | null; // 👈 جديد
  previousUserMessage?: string;
}) => {
  const isUser = msg.role === "user";
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<"helpful" | "not_helpful" | null>(null); // ← أضف هذا
  const [feedbackSent, setFeedbackSent] = useState(false);

  const sendFeedback = async (value: 1 | 0) => {
    const token = sessionStorage.getItem("userToken");
    if (!token) return;

    try {
      await axios.post(
        "https://gearupapp.runasp.net/api/Chatbot/feedback",
        {
          userMessageContent: previousUserMessage || "",
          botMessageContent: msg.text,
          feedback: value,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setFeedbackSent(true);
    } catch (e) {
      console.error("Feedback error:", e);
    }
  };

  const handleFeedback = (type: "helpful" | "not_helpful") => {
    if (feedbackSent || feedback) return;
    setFeedback(type);
    sendFeedback(type === "helpful" ? 1 : 0);
  };

  return (
    <div
      className={`w-full min-w-0 flex ${isUser ? "justify-start" : "justify-end"} animate-[fadeIn_.25s_ease]`}
      dir="rtl"
    >
      <div
        className={`max-w-[90%] sm:max-w-[80%] md:max-w-[70%] min-w-0 flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        <div
          className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm mt-1 ${isUser
            ? "bg-gradient-to-br from-[#137FEC] to-[#0EA5E9] text-white"
            : "bg-gradient-to-br from-slate-900 to-slate-700 text-white"
            }`}
        >
          {isUser ? <span className="text-sm font-bold">أ</span> : <MdSmartToy size={18} />}
        </div>

        <div className={`flex flex-col min-w-0 ${isUser ? "items-start" : "items-end"}`}>
          <div
            className={`px-4 py-3 rounded-2xl text-sm md:text-[15px] leading-7 shadow-sm border min-w-0 max-w-full ${isUser
              ? "bg-gradient-to-br from-[#137FEC] to-[#0EA5E9] text-white border-transparent rounded-tr-md"
              : "bg-white dark:bg-[#111827] text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 rounded-tl-md"
              }`}
          >
            {msg.imagePreview && (
              <img
                src={msg.imagePreview}
                alt="uploaded"
                className="max-w-full w-40 sm:w-52 md:w-56 rounded-xl mb-3 border border-white/20 object-cover"
              />
            )}

            <p className="break-words whitespace-pre-wrap [word-break:break-word]">
              {msg.text}
            </p>
            {!isUser &&
              msg.requires_mechanic === true &&
              msg.is_emergency === true &&
              hasTechnicians(msg.technicians) && (
                <button
                  onClick={() => {
                    const chatbotPayload = {
                      car_id: msg.car_id,
                      issue_summary: msg.issue_summary || msg.text,
                      required_service: msg.required_service,
                      recommended_mechanics: msg.recommended_mechanics,
                      is_emergency: true,
                    };
                    localStorage.setItem("chatbot_request", JSON.stringify(chatbotPayload));

                    navigate("/customer/maintenancerequest", {
                      state: {
                        isSOS: true,
                        carId: msg.car_id,
                      },
                    });
                  }}
                  className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  🚨 SOS اطلب فني فورًا
                </button>
              )}
            {!isUser &&
              msg.requires_mechanic === true &&
              msg.is_emergency === false && (
                <button
                  onClick={() =>
                    navigate("/customer/maintenancebookings", {
                      state: {
                        prefillData: {
                          mechanics: msg.recommended_mechanics,
                          service: msg.required_service,
                          carId: msg.car_id,
                          autoOpen: true,
                        }
                      }
                    })
                  }
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  🛠️ احجز صيانة
                </button>
              )}

            {!isUser && msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {msg.followUpQuestions.map((question, index) => (
                  <button
                    key={`${msg.id}-followup-${index}`}
                    type="button"
                    onClick={() => onFollowUpClick(question)}
                    className="px-3 py-2 rounded-full text-xs font-semibold bg-[#137FEC]/10 text-[#137FEC] border border-[#137FEC]/20 hover:bg-[#137FEC]/15 transition-all"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            {!isUser && msg.offersReminder && msg.reminder && (
              <div className="mt-4 rounded-2xl border border-[#137FEC]/25 bg-[#f0f8ff] dark:bg-[#137FEC]/10 overflow-hidden min-w-0 max-w-full">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[#137FEC]/10 dark:bg-[#137FEC]/20 border-b border-[#137FEC]/15">
                  <span className="text-[#137FEC] text-base">🔔</span>
                  <span className="text-sm font-bold text-[#137FEC]">تذكير مقترح</span>
                </div>

                <div className="px-4 py-3 space-y-1.5 min-w-0" dir="rtl">
                  <p className="font-bold text-gray-800 dark:text-white text-sm break-words">
                    {msg.reminder.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed break-words">
                    {msg.reminder.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[11px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-2.5 py-0.5 text-gray-600 dark:text-gray-300">
                      📅 {msg.reminder.start_date} ← {msg.reminder.end_date}
                    </span>
                    <span className="text-[11px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-2.5 py-0.5 text-gray-600 dark:text-gray-300">
                      🔁 {msg.reminder.frequency}
                    </span>
                    <span className="text-[11px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-2.5 py-0.5 text-gray-600 dark:text-gray-300">
                      🕘 {msg.reminder.notification_time}
                    </span>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <button
                    type="button"
                    onClick={() => onCreateReminder(msg.reminder!)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#137FEC] hover:bg-[#0EA5E9] active:scale-95 transition-all text-white text-sm font-bold shadow-md shadow-[#137FEC]/25"
                  >
                    <MdCreate size={16} />
                    <span>إنشاء التذكير الآن</span>
                  </button>
                </div>
              </div>
            )}

            {!isUser && msg.requires_feedback && (
              <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-3">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 text-right">
                  هل كانت هذه النصيحة مفيدة لك؟ قيّم ردي:
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => handleFeedback("helpful")}
                    disabled={!!feedback}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${feedback === "helpful"
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 disabled:opacity-50"
                      }`}
                  >
                    <span>👍</span>
                    <span>مفيدة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFeedback("not_helpful")}
                    disabled={!!feedback}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${feedback === "not_helpful"
                      ? "bg-red-500 text-white border-red-500"
                      : "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 disabled:opacity-50"
                      }`}
                  >
                    <span>👎</span>
                    <span>غير مفيدة</span>
                  </button>
                </div>

                {feedbackSent && (
                  <p className="text-xs text-green-500 mt-2 text-right">
                    ✅ شكراً على تقييمك!
                  </p>
                )}
              </div>
            )}
          </div>

          <span className="text-[11px] text-gray-400 mt-1 px-2">{msg.time}</span>
        </div>
      </div>
    </div>
  );
};

// ===== مؤشر الكتابة =====
const TypingIndicator = () => (
  <div className="w-full flex justify-end animate-[fadeIn_.25s_ease]" dir="rtl">
    <div className="max-w-[85%] md:max-w-[70%] flex gap-3">
      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
        <MdSmartToy size={18} />
      </div>

      <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#137FEC] animate-bounce" />
          <span className="w-2 h-2 rounded-full bg-[#137FEC] animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-[#137FEC] animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  </div>
);

// ===== الصفحة الرئيسية =====
const ChatbotPage = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch { }
    return [initialBotMessage];
  });

  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(() => {
    try {
      const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) return JSON.parse(saved).length <= 1;
    } catch { }
    return true;
  });

  const [cars, setCars] = useState<CarItem[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<ReminderPrefillData | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedCarIdRef = useRef<string | null>(null);
  const carsRef = useRef<CarItem[]>([]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const saved = sessionStorage.getItem("userCars");
        if (saved) {
          const list: CarItem[] = JSON.parse(saved);
          if (list.length) {
            setCars(list);
            setSelectedCarId(list[0].id);
            return;
          }
        }
      } catch { }

      const token = sessionStorage.getItem("userToken");
      if (!token) return;

      try {
        const res = await axios.get("https://gearupapp.runasp.net/api/customers/cars", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const list: CarItem[] = res.data?.cars || res.data || [];
        if (list.length) {
          setCars(list);
          setSelectedCarId(list[0].id);
          sessionStorage.setItem("userCars", JSON.stringify(list));
        }
      } catch (e) {
        console.error("Failed to fetch cars:", e);
      }
    };

    fetchCars();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch { }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const startNewChat = () => {
    sessionStorage.removeItem(CHAT_STORAGE_KEY);
    setMessages([{ ...initialBotMessage, time: getTime() }]);
    setInputText("");
    removeImage();
    setIsTyping(false);
    setShowSuggestions(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreateReminder = (reminder: ReminderData) => {
    if (!cars.length) {
      toast.error("لازم يكون عندك عربية مسجلة أولاً.");
      return;
    }

    setPrefillData({
      title: reminder.title,
      description: reminder.description,
      frequency: reminder.frequency,
      startDate: reminder.start_date,
      endDate: reminder.end_date,
      preferredNotificationTime: reminder.notification_time,
    });

    setModalOpen(true);
  };

  const handleFollowUpClick = (question: string) => {
    sendMessage(question);
  };

  useEffect(() => {
    selectedCarIdRef.current = selectedCarId;
  }, [selectedCarId]);

  useEffect(() => {
    carsRef.current = cars;
  }, [cars]);

  const selectedCarLabel = useMemo(() => {
    const car = cars.find((c) => c.id === selectedCarId);
    return car ? `${car.year} ${car.brand} ${car.model}` : "";
  }, [cars, selectedCarId]);

  const setSelectedCarLabel = (label: string) => {
    const car = cars.find((c) => `${c.year} ${c.brand} ${c.model}` === label);
    if (car) setSelectedCarId(car.id);
  };

  const sendMessage = async (text?: string) => {
    const msgText = (text ?? inputText).trim();
    if (!msgText && !selectedImage) return;

    const token = sessionStorage.getItem("userToken");
    if (!token) {
      setMessages((p) => [
        ...p,
        {
          id: Date.now(),
          role: "bot",
          text: "يجب تسجيل الدخول أولًا.",
          time: getTime(),
        },
      ]);
      return;
    }

    setShowSuggestions(false);

    const curImg = selectedImage;
    const curPrev = imagePreview;

    setMessages((p) => [
      ...p,
      {
        id: Date.now(),
        role: "user",
        text: msgText || "تم إرسال صورة",
        time: getTime(),
        imagePreview: curPrev || undefined,

      },
    ]);

    setInputText("");
    setIsTyping(true);
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      const currentCarId = selectedCarIdRef.current;
      const currentCars = carsRef.current;
      const selectedCar = currentCars.find((c) => c.id === currentCarId);

      const formData = new FormData();
      formData.append("Message", msgText || "");
      if (curImg) formData.append("Image", curImg);
      if (selectedCar) formData.append("CarId", selectedCar.id);

      const response = await axios.post(API_URL, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
      });

      console.log("🔴 Server Response:", response.data);

      // ===== التعديل هنا للتعامل مع شكل الرد =====
      const rawData = response.data;
      let replyData: any = null;
      let success = true;

      // الحالة 1: الرد مغلف (فيه success و reply)
      if (rawData.hasOwnProperty('success') && rawData.hasOwnProperty('reply')) {
        success = rawData.success;
        replyData = rawData.reply;
      }
      // الحالة 2: الرد مباشر (فيه ai_answer أو offers_reminder)
      else if (rawData.hasOwnProperty('ai_answer') || rawData.hasOwnProperty('offers_reminder')) {
        replyData = rawData;
      }

      // لو فيه خطأ
      if (!success || rawData.error) {
        setMessages((p) => [
          ...p,
          {
            id: Date.now() + 1,
            role: "bot",
            text: rawData.error || "حدث خطأ في الاستجابة.",
            time: getTime(),
          },
        ]);
        return;
      }

      const parsedReply = parseReplyData(replyData);
      const isMechanicRequired = parsedReply?.requires_mechanic === true;

      const technicians = isMechanicRequired
        ? ((parsedReply as any)?.recommended_mechanics || []).map((m: any, index: number) => ({
          id: index,
          name: m.Name,
          specialty: "ميكانيكي سيارات",
          image: "",
          phone: m.Phone,
          lat: m.Latitude,
          lng: m.Longitude,
        }))
        : [];
      const formatted = formatChatResponse(parsedReply, replyData);

      setMessages((p) => [
        ...p,
        {
          id: Date.now() + 1,
          role: "bot",
          text: formatted.text,
          issue_summary: (parsedReply as any)?.issue_summary,
          time: getTime(),
          offersReminder: formatted.offersReminder,
          reminder: formatted.reminder,
          followUpQuestions: formatted.followUpQuestions,
          technicians: technicians,

          requires_mechanic: parsedReply?.requires_mechanic === true,
          is_emergency: parsedReply?.is_emergency === true, // 👈 جديد
          required_service: (parsedReply as any)?.required_service,
          recommended_mechanics: (parsedReply as any)?.recommended_mechanics,
          car_id: (parsedReply as any)?.car_id,

          requires_feedback: formatted.requiresFeedback,
        },
      ]);
    } catch (err: any) {
      console.error("❌ API Error Details:", err.response || err);

      const s = err.response?.status;
      const msg =
        s === 400
          ? err.response?.data?.error || "البيانات المرسلة غير صحيحة."
          : s === 401
            ? "يجب تسجيل الدخول أولًا أو التوكين انتهت صلاحيته."
            : s === 403
              ? "ليس لديك صلاحية لاستخدام هذه الخدمة."
              : s === 404
                ? "رابط الخدمة غير موجود."
                : s === 500
                  ? err.response?.data?.error || "حصل خطأ في السيرفر."
                  : "حصل خطأ أثناء الاتصال بالمساعد الذكي.";

      setMessages((p) => [
        ...p,
        {
          id: Date.now() + 1,
          role: "bot",
          text: msg,
          time: getTime(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <div className="flex min-h-screen bg-[#f3f7fb] dark:bg-[#0B1120]" dir="rtl">
        <div className="flex min-h-screen">
          <Sidebar />
        </div>

        <div className="flex flex-col flex-1 min-w-0 min-h-screen">
          <Header />

          <main className="flex-1 min-h-0 p-2 md:p-5">
            <div className="h-full max-w-5xl mx-auto flex flex-col gap-4 overflow-hidden min-w-0">
              <div className="rounded-3xl bg-gradient-to-l from-[#137FEC] via-[#1992f3] to-[#0EA5E9] p-4 md:p-5 shadow-xl shadow-[#137FEC]/15 text-white shrink-0">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl border border-white/20">
                    <MdSmartToy size={28} />
                    <span className="absolute -bottom-1 -left-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg md:text-xl font-extrabold">المساعد الذكي</h1>
                    <p className="text-white/80 text-sm mt-1">
                      دردشة ذكية لمساعدتك في الصيانة، الأعطال، المواعيد، والطلبات
                    </p>
                  </div>

                  <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={startNewChat}
                      className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all active:scale-95 text-white"
                      type="button"
                    >
                      <MdCreate size={18} />
                      <span className="text-sm font-semibold">محادثة جديدة</span>
                    </button>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm">
                      <MdAutoAwesome size={18} />
                      <span className="text-sm font-semibold">GearUp AI</span>
                    </div>
                  </div>
                </div>
              </div>

              <section className="flex-1 flex flex-col min-h-0">
                <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-[#111827]/95 sticky top-0 z-10 shrink-0">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-gray-800 dark:text-white">المحادثة</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        اسأل عن الأعطال أو أرسل صورة للمشكلة
                      </p>
                    </div>

                    <div className="text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 flex-shrink-0">
                      متصل الآن
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-5 space-y-4 bg-[linear-gradient(to_bottom,_rgba(19,127,236,0.03),_transparent)]">
                  {messages.map((msg, index) => {
                    const previousUserMessage =
                      msg.role === "bot"
                        ? messages
                          .slice(0, index)
                          .reverse()
                          .find((m) => m.role === "user")?.text
                        : undefined;

                    return (
                      <MessageBubble
                        key={msg.id}
                        msg={msg}
                        onCreateReminder={handleCreateReminder}
                        onFollowUpClick={handleFollowUpClick}
                        selectedCarId={selectedCarId}
                        previousUserMessage={previousUserMessage}
                      />
                    );
                  })}
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              </section>

              {showSuggestions && (
                <div className="flex flex-wrap gap-2 shrink-0">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-[#137FEC] hover:text-[#137FEC] hover:-translate-y-0.5 transition-all shadow-sm"
                      type="button"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div className="sticky bottom-0 rounded-t-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] shadow-lg p-2 md:p-3">
                {imagePreview && (
                  <div className="mb-3 px-2">
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="w-24 h-24 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-1 shadow"
                        type="button"
                      >
                        <MdClose size={16} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <button
                    className="w-11 h-11 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#1f2937] transition flex-shrink-0"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <MdOutlineAttachFile size={20} />
                  </button>

                  {cars.length > 0 && (
                    <CarSelector
                      cars={cars}
                      selectedCarId={selectedCarId}
                      onSelect={(car) => setSelectedCarId(car.id)}
                    />
                  )}

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="اكتب رسالتك هنا..."
                    className="flex-1 h-11 bg-transparent outline-none px-3 text-sm md:text-[15px] text-gray-800 dark:text-white placeholder:text-gray-400 min-w-0"
                    dir="rtl"
                  />

                  <button
                    onClick={() => sendMessage()}
                    disabled={!inputText.trim() && !selectedImage}
                    className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#137FEC] to-[#0EA5E9] text-white flex items-center justify-center shadow-md shadow-[#137FEC]/25 hover:scale-[1.03] active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    type="button"
                  >
                    <MdSend size={20} />
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <CreateReminderModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setPrefillData(null);
        }}
        cars={cars}
        selectedCar={selectedCarLabel}
        setSelectedCar={setSelectedCarLabel}
        onSuccess={() => {
          setModalOpen(false);
          setPrefillData(null);
        }}
        initialData={prefillData}
      />
    </>
  );
};

export default ChatbotPage;