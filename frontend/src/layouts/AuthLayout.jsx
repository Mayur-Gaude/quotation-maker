import React from 'react';
import Sidebar from "../components/layout/Sidebar";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="min-h-screen min-w-0 flex-1 overflow-y-auto bg-slate-50 pt-[4.25rem] md:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;