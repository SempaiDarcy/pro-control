import React from "react";
import {LuUser} from "react-icons/lu";

export const AvatarGroup = ({avatars, names = [], maxVisible = 3}) => {
    return (
        <div className="flex items-center">
            {avatars.slice(0, maxVisible).map((avatar, index) => {
                const name = names[index] || ""; // добавляем имя по индексу

                return (
                    <div key={index} className="relative group -ml-3 first:ml-0">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={`Avatar ${index}`}
                                className="w-9 h-9 rounded-full border-2 border-white"
                            />
                        ) : (
                            <div
                                className="w-9 h-9 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-gray-600">
                                <LuUser className="w-5 h-5"/>
                            </div>
                        )}

                        {/* кастомный tooltip */}
                        {name && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2
                            bg-black text-white text-xs rounded px-2 py-1
                            opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
                            >
                                {name}
                            </div>
                        )}
                    </div>
                );
            })}


            {avatars.length > maxVisible && (
                <div
                    className="w-9 h-9 flex items-center justify-center bg-blue-50 text-sm font-medium rounded-full border-2 border-white -ml-3">
                    +{avatars.length - maxVisible}
                </div>
            )}
        </div>
    );
};
