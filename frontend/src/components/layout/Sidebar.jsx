import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FileTextIcon,
  PlusIcon,
  PencilIcon,
  CheckCircleIcon,
  LogoutIcon,
  LayersIcon,
  MenuIcon,
  XMarkIcon,
  CogIcon,
  MailIcon
} from "../common/Icons";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

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
      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
      isActive
        ? "bg-slate-100 text-slate-900 shadow-sm ring-1 ring-slate-200/80"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    ].join(" ");

  const status = new URLSearchParams(location.search).get("status");
  const isOnList = location.pathname === "/";
  const isAllActive = isOnList && !status;
  const isDraftActive = isOnList && status === "DRAFT";
  const isSentActive = isOnList && status === "SENT";
  const isFinalActive = isOnList && status === "FINAL";
  const isCreateActive = location.pathname === "/create";
  const isItemsActive = location.pathname === "/items";
  const isSettingsActive = location.pathname === "/settings";

  const linkClose = () => setMobileOpen(false);

  const aside = (
    <aside
      className={[
        "flex h-full w-[17rem] flex-col border-r border-slate-200/90 bg-white shadow-sm md:h-screen md:translate-x-0",
        "fixed inset-y-0 left-0 z-[80] transition-transform duration-200 ease-out md:static md:z-auto",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      ].join(" ")}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 md:px-5 md:py-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm">
            <FileTextIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight text-slate-900">
              Quotation Manager
            </div>
            <div className="truncate text-xs text-slate-500">Quotes & exports</div>
          </div>
        </div>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-slate-100 px-4 py-3 md:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 ring-1 ring-slate-200/80">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
            <p className="truncate text-xs text-slate-500">{email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4 md:px-4">
        <NavLink to="/" className={() => navItem(isAllActive)} onClick={linkClose}>
          <FileTextIcon className="h-5 w-5 flex-shrink-0 text-slate-500 group-hover:text-slate-700" />
          <span>All quotations</span>
        </NavLink>

        <NavLink to="/create" className={() => navItem(isCreateActive)} onClick={linkClose}>
          <PlusIcon className="h-5 w-5 flex-shrink-0 text-slate-500 group-hover:text-slate-700" />
          <span>Create quotation</span>
        </NavLink>

        <NavLink to="/items" className={() => navItem(isItemsActive)} onClick={linkClose}>
          <LayersIcon className="h-5 w-5 flex-shrink-0 text-slate-500 group-hover:text-slate-700" />
          <span>Item library</span>
        </NavLink>

        <NavLink to="/settings" className={() => navItem(isSettingsActive)} onClick={linkClose}>
          <CogIcon className="h-5 w-5 flex-shrink-0 text-slate-500 group-hover:text-slate-700" />
          <span>Settings</span>
        </NavLink>

        <div className="py-3">
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Filter by status
          </div>
        </div>

        <NavLink to="/?status=DRAFT" className={() => navItem(isDraftActive)} onClick={linkClose}>
          <PencilIcon className="h-5 w-5 flex-shrink-0 text-slate-500 group-hover:text-slate-700" />
          <span>Drafts</span>
        </NavLink>

        <NavLink to="/?status=SENT" className={() => navItem(isSentActive)} onClick={linkClose}>
          <MailIcon className="h-5 w-5 flex-shrink-0 text-slate-500 group-hover:text-slate-700" />
          <span>Sent</span>
        </NavLink>

        <NavLink to="/?status=FINAL" className={() => navItem(isFinalActive)} onClick={linkClose}>
          <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-slate-500 group-hover:text-slate-700" />
          <span>Finalized</span>
        </NavLink>
      </nav>

      <button
        type="button"
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="flex items-center gap-3 border-t border-slate-100 px-4 py-4 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 md:px-5"
      >
        <LogoutIcon className="h-5 w-5 flex-shrink-0" />
        <span>Logout</span>
      </button>
    </aside>
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-3 top-3 z-[70] flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-700 shadow-md md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-[1px] md:hidden"
          aria-label="Close menu overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

  <div className="w-0 shrink-0 overflow-visible md:w-[17rem]">{aside}</div>
    </>
  );
};

export default Sidebar;
