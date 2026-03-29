import React, { useEffect, useRef, useState } from "react";
import { LuChevronDown } from "react-icons/lu";

export const SelectDropdown = ({
    options,
    value,
    onChange,
    placeholder,
    compact,
    closeOnSignal,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef(null);

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    useEffect(() => {
        setIsOpen(false);
    }, [closeOnSignal]);

    useEffect(() => {
        if (!isOpen) return;
        const onPointerDown = (e) => {
            const el = rootRef.current;
            if (el && !el.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("touchstart", onPointerDown, { passive: true });
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("touchstart", onPointerDown);
        };
    }, [isOpen]);

    const triggerPad = compact ? "py-2 mt-1.5" : "py-3 mt-2";

    return (
        <div ref={rootRef} className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen((o) => !o)}
                className={`w-full text-sm text-black outline-none bg-white border border-slate-100 px-2.5 rounded-md flex justify-between items-center min-h-0 ${triggerPad}`}
            >
                {value ? options.find((opt) => opt.value === value)?.label : placeholder}
                <span className="ml-2 shrink-0">
                    <LuChevronDown
                        className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                </span>
            </button>

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
    );
};
