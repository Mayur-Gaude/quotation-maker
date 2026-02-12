import React from 'react';
import Sidebar from "../components/layout/Sidebar";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <div className="flex min-h-screen overflow-hidden">
        <div className="shrink-0">
          <Sidebar />
        </div>
        {/* Don't add padding here; pages control their own spacing */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AuthLayout;