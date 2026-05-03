import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard",  icon: "▦" },
  { to: "/projects",  label: "Projects",   icon: "⊞" },
  { to: "/tasks",     label: "My Tasks",   icon: "✓" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">TaskFlow</div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              "sidebar__link" + (isActive ? " sidebar__link--active" : "")
            }
          >
            <span className="sidebar__icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <span
            className="sidebar__avatar"
            style={{ background: user?.avatar_color || "#6366f1" }}
          >
            {initials}
          </span>
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">{user?.name}</span>
            <span className="sidebar__user-email">{user?.email}</span>
          </div>
        </div>
        <button className="sidebar__logout" onClick={handleLogout} title="Logout">
          ⎋
        </button>
      </div>
    </aside>
  );
}