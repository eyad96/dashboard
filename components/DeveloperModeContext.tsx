"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { usePathname } from "next/navigation";

export type LogType = "info" | "mutation" | "query" | "error";

export interface SystemLog {
  timestamp: string;
  type: LogType;
  message: string;
}

export interface StyleOptions {
  accentTheme: "indigo" | "emerald" | "amber" | "rose" | "sapphire";
  borderRadius: "sharp" | "rounded" | "premium" | "extra";
  gridStyle: "clean" | "dots" | "grid";
  chartStyle: "monotone" | "linear" | "step";
  glowIntensity: "off" | "subtle" | "neon";
}

interface DeveloperModeContextType {
  isDevMode: boolean;
  setIsDevMode: (val: boolean) => void;
  logs: SystemLog[];
  addLog: (type: LogType, message: string) => void;
  clearLogs: () => void;
  styleOptions: StyleOptions;
  setStyleOptions: React.Dispatch<React.SetStateAction<StyleOptions>>;
}

export const DeveloperModeContext = createContext<DeveloperModeContextType | undefined>(undefined);

export function DeveloperModeProvider({ children }: { children: ReactNode }) {
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const pathname = usePathname();

  const [styleOptions, setStyleOptions] = useState<StyleOptions>({
    accentTheme: "indigo",
    borderRadius: "premium",
    gridStyle: "dots",
    chartStyle: "monotone",
    glowIntensity: "subtle",
  });

  // Helper to add a system log with stable timestamps wrapped in useCallback
  const addLog = useCallback((type: LogType, message: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [
      { timestamp: time, type, message },
      ...prev.slice(0, 99), // Keep last 100 logs
    ]);
  }, []);

  const clearLogs = () => setLogs([]);

  // Auto-log page changes
  useEffect(() => {
    const timer = setTimeout(() => {
      addLog("info", `Navigation route changed to: ${pathname}`);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname, addLog]);

  // Log active state
  useEffect(() => {
    const timer = setTimeout(() => {
      addLog("info", `Developer Console Workspace is ${isDevMode ? "ENABLED" : "DISABLED"}`);
    }, 0);
    return () => clearTimeout(timer);
  }, [isDevMode, addLog]);

  return (
    <DeveloperModeContext.Provider
      value={{
        isDevMode,
        setIsDevMode,
        logs,
        addLog,
        clearLogs,
        styleOptions,
        setStyleOptions,
      }}
    >
      {children}
    </DeveloperModeContext.Provider>
  );
}

export function useDeveloperMode() {
  const context = useContext(DeveloperModeContext);
  if (!context) {
    throw new Error("useDeveloperMode must be used within a DeveloperModeProvider");
  }
  return context;
}
