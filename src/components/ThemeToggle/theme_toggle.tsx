import React from "react";
import { FaMoon, FaSun } from "react-icons/fa6";
import { useTheme } from "../../contexts/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { dark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        w-14 h-8 rounded-full
        bg-gray-300 dark:bg-gray-700
        relative transition-colors duration-300
      "
      aria-label="Toggle Theme"
    >
      <span
        className={`
          absolute top-1
          w-6 h-6 rounded-full
          bg-blue-500
          flex items-center justify-center
          text-white
          transition-all duration-300
          ${dark ? "right-1" : "left-1"}
        `}
      >
        {dark ? <FaMoon size={12} /> : <FaSun size={12} />}
      </span>
    </button>
  );
};

export default ThemeToggle;
