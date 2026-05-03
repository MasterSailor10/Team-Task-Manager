import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import "./AppLayout.css";

export default function AppLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <div className="app-loader"><span className="spinner" style={{borderTopColor:"var(--accent)"}}/></div>;
  if (!user)   return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar className={sidebarOpen ? "open" : ""} />
      <div className="app-main">
        <header className="app-topbar">
          <button className="topbar-menu" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">☰</button>
          <span className="topbar-logo">TaskFlow</span>
        </header>
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}