"use client";

import {useEffect} from "react";

/** Rejestruje Service Worker (PWA / Web Push) po zalogowaniu. */
const ServiceWorkerRegister = () => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js", {scope: "/"}).catch((error) => {
      console.error("SW register failed", error);
    });
  }, []);

  return null;
};

export default ServiceWorkerRegister;
