"use client";

import {useEffect, useState} from "react";

export type Modules = {
  vehicles: boolean;
  insurance: boolean;
  beauty: boolean;
  stock: boolean;
};

export const useSettings = () => {
  const [modules, setModules] = useState<Modules | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");

        if (!response.ok) {
          throw new Error("Nie udało się pobrać ustawień.");
        }

        const data = await response.json();

        setModules(data.modules);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return {
    modules,
    isLoading,
  };
};
