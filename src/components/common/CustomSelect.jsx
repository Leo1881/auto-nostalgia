import React, { useState, useRef, useEffect } from "react";

const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (value) {
      const option = options.find((opt) => opt.value === value);
      setSelectedOption(option);
    } else {
      setSelectedOption(null);
    }
  }, [value, options]);

  const handleSelect = (option) => {
    setSelectedOption(option);
    onChange(option.value);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`form-input cursor-pointer custom-select-container bg-transparent ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={toggleDropdown}
        style={{
          outline: "none",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span
          className={selectedOption ? "" : ""}
          style={{
            color: selectedOption ? "#374151" : "#6b7280",
            fontWeight: selectedOption ? "500" : "400",
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{
            color: selectedOption ? "#374151" : "#6b7280",
            width: "24px",
            height: "24px",
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-hidden"
          style={{
            borderRadius: "16px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            width: "320px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "white",
            border: "2px solid #374151",
            borderColor: "#374151",
          }}
        >
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-6 py-4 cursor-pointer transition-all duration-200 ${
                selectedOption?.value === option.value
                  ? "bg-red-50 border-l-4 border-red-500"
                  : "hover:bg-gray-50"
              }`}
              style={{
                padding: "16px 24px",
                transition: "all 0.2s ease",
              }}
              onClick={() => handleSelect(option)}
            >
              <span
                className={`font-medium ${
                  selectedOption?.value === option.value
                    ? "text-red-600"
                    : "text-gray-700"
                }`}
                style={{
                  fontWeight: "500",
                }}
              >
                {option.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
