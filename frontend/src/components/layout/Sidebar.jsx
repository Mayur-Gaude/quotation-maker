import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const email = user?.email || "";

  const initials = displayName
    .split(/[.\s_]/)
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0])
    .join("")
    .toUpperCase();

  const navItem = isActive =>
    [
      "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
      isActive
        ? "bg-slate-900 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    ].join(" ");

  const status = new URLSearchParams(location.search).get("status");
  const isOnList = location.pathname === "/";
  const isAllActive = isOnList && !status;
  const isDraftActive = isOnList && status === "DRAFT";
  const isFinalActive = isOnList && status === "FINAL";
  const isCreateActive = location.pathname === "/create";

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 border-b border-slate-200">
        <div className="text-sm font-semibold tracking-tight text-slate-900">
          Quotation Manager
        </div>
        <div className="mt-0.5 text-xs text-slate-500">
          Create • manage • export
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-slate-200 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {displayName}
          </p>
          <p className="truncate text-xs text-slate-500">{email}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavLink to="/" className={() => navItem(isAllActive)}>
          <span className="text-base leading-none" aria-hidden>
            📄
          </span>
          <span>Quotations</span>
        </NavLink>

        <NavLink to="/create" className={() => navItem(isCreateActive)}>
          <span className="text-base leading-none" aria-hidden>
            ➕
          </span>
          <span>Create quotation</span>
        </NavLink>

        <NavLink to="/?status=DRAFT" className={() => navItem(isDraftActive)}>
          <span className="text-base leading-none" aria-hidden>
            📝
          </span>
          <span>Drafts</span>
        </NavLink>

        <NavLink to="/?status=FINAL" className={() => navItem(isFinalActive)}>
          <span className="text-base leading-none" aria-hidden>
            ✅
          </span>
          <span>Finalized</span>
        </NavLink>
      </nav>

      {/* Logout */}
      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="flex items-center gap-2 px-4 py-4 text-left text-sm font-medium text-rose-600 border-t border-slate-200 transition hover:bg-rose-50"
      >
        <span className="text-base leading-none" aria-hidden>
          🚪
        </span>
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;