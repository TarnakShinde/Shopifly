"use client";
import { useState } from "react";



export const PasswordStrength = ({ placeholder, onChange }) => {
    const [strength, setStrength] = useState("");

    const getStrength = (password) => {
        let strengthIndicator = -1;
        if (/[a-z]/.test(password)) strengthIndicator++;
        if (/[A-Z]/.test(password)) strengthIndicator++;
        if (/\d/.test(password)) strengthIndicator++;
        if (/[^a-zA-Z0-9]/.test(password)) strengthIndicator++;
        if (password.length >= 16) strengthIndicator++;
        return strengthLabels[strengthIndicator];
    };

    const handleChange = (event) => {
        setStrength(getStrength(event.target.value));
        onChange(event.target.value);
    };

    return (
        <>
            <input
                name="password"
                spellCheck="false"
                className="w-full h-14 px-4 py-0 text-lg bg-gray-900 border-0 rounded-md outline-none text-white my-2 transition-all duration-400"
                type="password"
                placeholder={placeholder}
                onChange={handleChange}
            />
            <div className={`flex items-center h-1.5 rounded bg-gray-900 my-2`}>
                <div
                    className={`h-1.5 rounded transition-all duration-400 ${
                        strength === "weak"
                            ? "bg-red-500 w-1/3"
                            : strength === "medium"
                            ? "bg-orange-500 w-2/3"
                            : strength === "strong"
                            ? "bg-green-500 w-full"
                            : "w-0"
                    }`}
                ></div>
            </div>
            <div className="text-left h-8 capitalize text-gray-500">
                {strength && `${strength} password`}
            </div>
        </>
    );
};
