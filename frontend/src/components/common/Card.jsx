import React from "react";

const Card = ({
  children,
  className = "",
  padding = "p-6",
  hover = false,
  ...props
}) => {
  const hoverStyles = hover ? "hover:shadow-md transition-shadow duration-200" : "";

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${padding} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "" }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-base font-semibold text-slate-800 ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = "" }) => (
  <p className={`mt-1 text-sm text-slate-500 ${className}`}>{children}</p>
);

export default Card;
