import React from "react";

export const AuthLayout = ({ children }) => {
    return (
        <div className="flex min-h-svh flex-col md:flex-row">
            <div
                className="relative hidden min-h-0 md:flex md:min-h-svh md:w-[42%] lg:w-[40%] flex-col justify-between overflow-hidden bg-zinc-950 px-8 py-10 text-white md:px-10 md:py-12"
            >
                <div
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_20%,rgba(59,130,246,0.16),transparent),radial-gradient(ellipse_60%_50%_at_80%_60%,rgba(99,102,241,0.1),transparent)]"
                    aria-hidden
                />
                <div className="relative z-[1]">
                    <p className="text-sm font-semibold tracking-tight text-white">Про-Контроль</p>
                    <p className="mt-6 max-w-sm text-2xl font-semibold leading-snug tracking-tight md:text-[1.65rem]">
                        Управление задачами и командой
                    </p>
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">
                        Вход и регистрация в рабочую область приложения.
                    </p>
                </div>
                <p className="relative z-[1] text-[11px] text-zinc-500">ProControl</p>
            </div>

            <div className="flex flex-1 flex-col justify-center bg-white px-6 py-10 md:px-10 lg:px-14">
                <div className="mx-auto w-full max-w-md">
                    <p className="mb-6 text-sm font-semibold text-zinc-900 md:hidden">Про-Контроль</p>
                    {children}
                </div>
            </div>
        </div>
    );
};
