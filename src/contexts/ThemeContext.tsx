import { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
    dark: boolean;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [dark, setDark] = useState<boolean>(() => {
        return localStorage.getItem("theme") === "dark";
    });

    const toggleTheme = () => {
        setDark(prev => {
            const newTheme = !prev;
            localStorage.setItem("theme", newTheme ? "dark" : "light");
            return newTheme;
        });
    };

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [dark]);

    return (
        <ThemeContext.Provider value={{ dark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used inside ThemeProvider");
    }
    return context;
};