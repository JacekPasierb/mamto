"use client";

import {useAuth} from "@clerk/nextjs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Modules = {
  vehicles: boolean;
  insurance: boolean;
  documents: boolean;
  beauty: boolean;
  stock: boolean;
};

type SettingsContextType = {
  modules: Modules | null;
  isLoading: boolean;
  updateModules: (modules: Modules) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider = ({children}: {children: ReactNode}) => {
  const {isLoaded, isSignedIn} = useAuth();
  const [modules, setModules] = useState<Modules | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    const response = await fetch("/api/settings");

    if (response.status === 401) {
      setModules(null);
      return;
    }

    if (!response.ok) {
      throw new Error("Nie udało się pobrać ustawień.");
    }

    const data = await response.json();
    setModules(data.modules);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setModules(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        await fetchSettings();
      } catch (error) {
        if (!cancelled) {
          console.error("Settings error:", error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, fetchSettings]);

  const updateModules = async (updatedModules: Modules) => {
    const previousModules = modules;

    setModules(updatedModules);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modules: updatedModules,
        }),
      });

      if (!response.ok) {
        throw new Error("Nie udało się zapisać ustawień.");
      }
    } catch (error) {
      setModules(previousModules);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        modules,
        isLoading: !isLoaded || isLoading,
        updateModules,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings musi być używany wewnątrz SettingsProvider");
  }

  return context;
};
