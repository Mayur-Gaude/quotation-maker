const Button = ({ children, onClick, type = "button", variant = "primary", disabled }) => {
  const styles = {
    primary: "bg-blue-600 text-white",
    success: "bg-green-600 text-white",
    danger: "bg-red-600 text-white",
    secondary: "bg-gray-200 text-black"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles[variant]} px-4 py-2 rounded disabled:opacity-50`}
    >
      {children}
    </button>
  );
};

export default Button;
