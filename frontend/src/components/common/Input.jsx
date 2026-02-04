const Input = ({ value, onChange, placeholder, type = "text", disabled }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="border p-2 rounded w-full disabled:bg-gray-100"
    />
  );
};

export default Input;
