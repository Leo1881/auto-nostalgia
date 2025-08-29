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
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red bg-white text-gray-900 transition-all duration-300 ease-in-out mb-4 cursor-pointer flex items-center justify-between ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={toggleDropdown}
        style={{
          borderRadius: isOpen ? "8px 8px 0 0" : "8px",
          borderTop: "1px solid #d1d5db",
          borderLeft: "1px solid #d1d5db",
          borderRight: "1px solid #d1d5db",
          borderBottom: isOpen ? "none" : "1px solid #d1d5db",
        }}
      >
        <span
          className={selectedOption ? "text-gray-900" : "text-gray-500"}
          style={{
            fontWeight: selectedOption ? "500" : "400",
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`transition-transform duration-300 ease-in-out ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{
            color: selectedOption ? "#111827" : "#6b7280",
            width: "20px",
            height: "20px",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
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
      <div
        className={`absolute z-10 w-full bg-white shadow-xl max-h-60 transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 transform translate-y-0 scale-y-100"
            : "opacity-0 transform translate-y-0 scale-y-0 pointer-events-none"
        }`}
        style={{
          borderRadius: "0 0 8px 8px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          width: "100%",
          left: "0",
          top: "100%",
          transformOrigin: "top",
          transform: isOpen
            ? "translateY(0) scaleY(1)"
            : "translateY(-10px) scaleY(0.95)",
          backgroundColor: "white",
          border: "1px solid #d1d5db",
          borderTop: "none",
          borderBottom: "1px solid #d1d5db",
          borderLeft: "1px solid #d1d5db",
          borderRight: "1px solid #d1d5db",
        }}
      >
        {options.map((option) => (
          <div
            key={option.value}
            className={`px-4 py-2 cursor-pointer transition-all duration-200 ease-in-out ${
              selectedOption?.value === option.value
                ? "bg-red-50 border-l-4 border-red-500"
                : "hover:bg-gray-50 hover:scale-[1.02]"
            }`}
            style={{
              padding: "8px 16px",
              transition: "all 0.2s ease-in-out",
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
    </div>
  );
};

export default CustomSelect;
