import React from "react";
import { InteractiveGridPattern } from "../auth/interactive-grid-pattern.jsx";

const LEFT_DESCRIPTION =
    "Контролируйте выполнение задач, сроки и ответственность участников в едином рабочем пространстве.";

export const AuthLayout = ({ children, wideFormCard = false }) => {
    const cardShell =
        "mx-auto w-full space-y-6 rounded-xl border border-slate-200/85 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.045)] md:rounded-2xl";
    const cardSize = wideFormCard
        ? "max-w-xl px-7 py-9 md:px-9 md:py-10"
        : "max-w-md px-6 py-8 md:px-8 md:py-9";

    return (
        <div className="flex min-h-svh flex-col md:flex-row">
            <div className="relative hidden min-h-0 w-full shrink-0 flex-col overflow-hidden border-r border-zinc-800/60 bg-zinc-950 text-white md:flex md:min-h-svh md:w-1/3 md:min-w-[17rem]">
                <div className="pointer-events-none absolute inset-0 bg-zinc-900" aria-hidden />
                <InteractiveGridPattern
                    width={52}
                    height={52}
                    squares={[18, 18]}
                    className="pointer-events-auto inset-x-0 inset-y-0 skew-y-12 border-0 mask-[radial-gradient(420px_circle_at_center,white,transparent)]"
                />

                <div className="relative z-20 flex h-full min-h-0 flex-col px-8 py-10 md:px-9 md:py-11 lg:px-10 lg:py-12">
                    <p className="shrink-0 text-sm font-semibold tracking-tight text-white">
                        Про-Контроль
                    </p>

                    <div className="flex min-h-0 flex-1 flex-col justify-center py-8">
                        <h2 className="max-w-sm text-2xl font-semibold leading-snug tracking-tight text-zinc-50 md:text-[1.65rem]">
                            Управление задачами и командой
                        </h2>
                        <p className="mt-5 max-w-sm text-sm leading-relaxed text-zinc-400">
                            {LEFT_DESCRIPTION}
                        </p>
                    </div>
                </div>
            </div>

            <div className="auth-form-scope flex min-h-svh min-w-0 flex-1 flex-col justify-center bg-zinc-50/80 px-6 py-10 md:px-10 lg:px-14">
                <div className={`${cardShell} ${cardSize}`}>
                    <p className="text-sm font-semibold tracking-tight text-zinc-900 md:hidden">
                        Про-Контроль
                    </p>
                    {children}
                </div>
            </div>
        </div>
    );
};
