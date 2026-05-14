import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  className = "",
  icon,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary:
      "bg-slate-800 text-white shadow-sm hover:bg-slate-700 focus:ring-slate-500 active:bg-slate-900",
    secondary:
      "bg-white text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-50 focus:ring-slate-300 active:bg-slate-100",
    success:
      "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus:ring-emerald-500 active:bg-emerald-800",
    danger:
      "bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-500 active:bg-red-800",
    ghost:
      "text-slate-600 hover:bg-slate-100 hover:text-slate-800 focus:ring-slate-300",
    link: "text-slate-600 underline hover:text-slate-800 focus:ring-slate-300"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
