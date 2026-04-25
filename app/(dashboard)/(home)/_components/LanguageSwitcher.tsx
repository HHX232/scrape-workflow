"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import styles from "./LanguageSwitcher.module.scss";

const languages = [
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "by", label: "Беларуская" },
];

export const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const cookieLang = Cookies.get("NEXT_LOCALE");
    if (cookieLang && languages.some(l => l.code === cookieLang)) {
      setCurrentLang(cookieLang);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    setCurrentLang(code);
    Cookies.set("NEXT_LOCALE", code, { expires: 365, path: "/", sameSite: "Lax" });
    setIsOpen(false);
    
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className={styles.language_switcher} ref={dropdownRef}>
      <button
        className={styles.language_button}
        onClick={() => setIsOpen(prev => !prev)}
        disabled={isPending}
        style={{ 
          opacity: isPending ? 0.5 : 1,
          cursor: isPending ? 'wait' : 'pointer'
        }}
      >
        {languages.find(l => l.code === currentLang)?.label}
        <span className={`${styles.arrow} ${isOpen ? styles.open : ""}`}>▼</span>
      </button>
      {isOpen && (
        <ul className={styles.language_dropdown}>
          {languages.map(lang => (
            <li key={lang.code}>
              <button
                className={`${styles.language_item} ${lang.code === currentLang ? styles.active : ""}`}
                onClick={() => handleSelect(lang.code)}
                disabled={isPending}
                style={{ 
                  opacity: isPending ? 0.5 : 1,
                  cursor: isPending ? 'wait' : 'pointer'
                }}
              >
                {lang.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};