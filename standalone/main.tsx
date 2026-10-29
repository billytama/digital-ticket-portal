import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Home from "../app/page";
import { RuntimeContext } from "../app/runtime";
import "../app/globals.css";
import "./style.css";

function App() {
  const [uploadsEnabled, setUploadsEnabled] = useState(false);
  const [error, setError] = useState("");
  async function loadConfig() {
    try {
      const response = await fetch("/api/config");
      if (!response.ok) throw new Error("Konfigurasi portal belum dapat dimuat.");
      const config = await response.json() as { uploadsEnabled: boolean };
      setUploadsEnabled(config.uploadsEnabled);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Koneksi bermasalah.");
    }
  }
  useEffect(() => { void loadConfig(); }, []);
  return <>
    <div className="public-bar"><span className="live-dot" />Workspace publik<span className="public-bar-detail">Semua pengunjung dapat membuat tiket dan memperbarui status.</span></div>
    {error && <div className="config-error" role="alert">{error}<button onClick={loadConfig}>Coba lagi</button></div>}
    <RuntimeContext.Provider value={{ readOnly: false, uploadsEnabled }}><Home /></RuntimeContext.Provider>
  </>;
}

createRoot(document.getElementById("root")!).render(<App />);
