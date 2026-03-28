import React, { useState } from "react";
import { LuChevronDown } from "react-icons/lu";

export const SelectDropdown = ({ options, value, onChange, placeholder, compact }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    const triggerPad = compact ? "py-2 mt-1.5" : "py-3 mt-2";

    return <div className="relative w-full">
        {/* Dropdown Button */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full text-sm text-black outline-none bg-white border border-slate-100 px-2.5 rounded-md flex justify-between items-center min-h-0 ${triggerPad}`}
        >
            {value ? options.find((opt) => opt.value === value)?.label : placeholder}
            <span className="ml-2">{isOpen ? <LuChevronDown classNarotate-180me="" /> : <LuChevronDown  />}</span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
            <div className="absolute w-full bg-white border border-slate-100 rounded-md mt-1 shadow-md z-10">
                {options.map((option) => (
                    <div
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                    >
                        {option.label}
                    </div>
                ))}
            </div>
        )}
    </div>
};

