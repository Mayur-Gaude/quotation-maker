import React from "react";

const Input = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  error,
  helperText,
  required = false,
  className = "",
  icon,
  ...props
}) => {
  const baseStyles =
    "w-full rounded-lg border bg-white px-4 py-2.5 text-slate-800 placeholder-slate-400 transition focus:outline-none focus:ring-2";

  const errorStyles = error
    ? "border-red-300 focus:border-red-400 focus:ring-red-200"
    : "border-slate-200 focus:border-slate-400 focus:ring-slate-200";

  const disabledStyles = disabled
    ? "bg-slate-50 cursor-not-allowed opacity-60"
    : "";

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`${baseStyles} ${errorStyles} ${disabledStyles} ${
            icon ? "pl-10" : ""
          }`}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!error && helperText && (
        <p className="text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
