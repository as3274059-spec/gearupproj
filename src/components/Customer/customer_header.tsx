import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaStar } from "react-icons/fa";
import ThemeToggle from "../ThemeToggle/theme_toggle";
import NotificationBtn from "../NotificationBell/notification_bell";
// import AiMechanicProfile from "../../pages/Customer/Aiprofile/ai_mechanic_profile";

interface UserData {
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string;
}

interface MechanicResult {
  mechanicId: string;
  name: string;
  phone: string;
  specialty: string;
  latitude: number;
  longitude: number;
  averageRating: number;
}

interface Suggestion {
  suggestion: string;
  type: string;
}

const Header = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<MechanicResult[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  // إغلاق الـ dropdown عند النقر خارجه
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounce السيرش + Suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchTerm.trim()) {
      setResults([]);
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const token = sessionStorage.getItem("userToken");

      try {
        const [suggestRes, searchRes] = await Promise.all([
          fetch(
            `https://gearupapp.runasp.net/api/mechanics/suggestions?q=${encodeURIComponent(searchTerm)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(
            `https://gearupapp.runasp.net/api/mechanics/ai-search?q=${encodeURIComponent(searchTerm)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        if (suggestRes.ok) setSuggestions(await suggestRes.json());
        if (searchRes.ok) setResults(await searchRes.json());
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [searchTerm]);

  // جلب بيانات المستخدم
  useEffect(() => {
    const savedData = sessionStorage.getItem("userData");
    if (savedData) setUserData(JSON.parse(savedData));

    const fetchHeaderProfile = async () => {
      const token = sessionStorage.getItem("userToken");
      if (!token) return;
      try {
        const response = await fetch("https://gearupapp.runasp.net/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          sessionStorage.setItem("userData", JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error fetching header profile:", error);
      }
    };
    fetchHeaderProfile();
  }, []);

  return (
    <header
      className="w-full dark:bg-primary_BGD py-4 px-8 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 transition-colors duration-500"
      dir="rtl"
    >
      {/* Search */}
      <div className="flex-1 max-w-2xl mx-12 relative" ref={searchRef}>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => (results.length > 0 || suggestions.length > 0) && setShowDropdown(true)}
            placeholder="ابحث عن ميكانيكي بالاسم أو التخصص..."
            className="w-full bg-[#137FEC1A] dark:bg-[#137FEC1A] border-none rounded-full dark:text-white py-3 pr-12 pl-6 text-sm outline-none focus:ring-2 focus:ring-[#137FEC] transition-all"
          />
          {loading ? (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#137FEC] border-t-transparent rounded-full animate-spin" />
          ) : (
            <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#0d1629] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden">

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="border-b border-gray-100 dark:border-gray-800">
                <div className="px-4 py-2 text-xs text-gray-400">اقتراحات</div>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSearchTerm(s.suggestion);
                      setSuggestions([]);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#137FEC0D] dark:hover:bg-[#137FEC15] transition-colors text-right"
                  >
                    <FaSearch size={11} className="text-gray-400 shrink-0" />
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                      {s.suggestion}
                    </span>
                    <span className="text-xs text-[#137FEC] bg-[#137FEC15] px-2 py-0.5 rounded-full shrink-0">
                      {s.type}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Results */}
            {results.length === 0 && suggestions.length === 0 ? (
              <div className="px-5 py-6 text-center text-sm text-gray-400">
                لا توجد نتائج لـ "{searchTerm}"
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-400">{results.length} ميكانيكي</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                  {results.map((mechanic) => (
                    <button
                      key={mechanic.mechanicId}
                      onClick={() => {
                        // هنا يتم الانتقال لصفحة الميكانيكي (AiMechanicProfile) عن طريق الـ ID
                        navigate(`/ai_mechanic_profile/${mechanic.mechanicId}`);
                        setShowDropdown(false);
                        setSearchTerm("");
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#137FEC0D] dark:hover:bg-[#137FEC15] transition-colors text-right"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#137FEC20] flex items-center justify-center text-[#137FEC] font-bold text-base shrink-0">
                        {mechanic.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                          {mechanic.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{mechanic.specialty}</p>
                      </div>
                      {mechanic.averageRating > 0 && (
                        <div className="flex items-center gap-1 shrink-0">
                          <FaStar size={11} className="text-amber-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {mechanic.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        <NotificationBtn />
        <ThemeToggle />
        <button
          onClick={() => navigate("/customer/profilesettings")}
          className="flex items-center gap-3 group"
          title="الملف الشخصي"
        >
          <div className="w-12 h-12 rounded-full border-2 border-[#E5F1FD] dark:border-gray-700 overflow-hidden shadow-sm bg-gray-100 flex items-center justify-center transition-all group-hover:border-[#137FEC] group-hover:shadow-md group-hover:scale-105">
            {userData?.profilePhotoUrl ? (
              <img
                src={userData.profilePhotoUrl}
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-[#137FEC] font-bold text-lg">
                {userData?.firstName?.[0] || "U"}
              </div>
            )}
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;