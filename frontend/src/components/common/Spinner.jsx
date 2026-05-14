import React from "react";

const Spinner = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3"
  };

  return (
    <div
      className={`animate-spin rounded-full border-slate-200 border-t-slate-600 ${sizes[size]} ${className}`}
    />
  );
};

export const LoadingScreen = ({ message = "Loading..." }) => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50">
    <div className="text-center">
      <Spinner size="lg" className="mx-auto" />
      <p className="mt-4 text-sm text-slate-600">{message}</p>
    </div>
  </div>
);

export const LoadingOverlay = ({ message = "Loading..." }) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
    <div className="text-center">
      <Spinner size="lg" className="mx-auto" />
      <p className="mt-4 text-sm text-slate-600">{message}</p>
    </div>
  </div>
);

export default Spinner;
