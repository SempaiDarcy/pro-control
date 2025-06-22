import React from 'react';
// import UI_IMG from "*.png";

export const AuthLayout = ({children}) => {
    return (
        <div className="flex">
            <div className="w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12">
                <h2 className="text-lg text-black" style={{ fontWeight: 600 }}>Про-Контроль</h2>
                {children}
            </div>

            <div className="hidden md:flex w-[40vw] h-screen items-center justify-center bg-blue-50 bg-[url('/bg-img.png')] bg-cover bg-no-repeat bg-center overflow-hidden p-8">
            </div>
        </div>
    );
};

