"use client";

import { cn } from "@/lib/utils";
import { useCreatorSidebar } from "@/store/use-creator-sidebar";

interface WrapperProps {
    children: React.ReactNode;
}

export const Wrapper = ({
    children,
}: WrapperProps) => {
    const { collapsed } = useCreatorSidebar((state) => state);

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-50 flex h-full flex-col",
                "w-[70px] lg:w-60",
                "bg-[#0b0b0f]/95 backdrop-blur-xl",
                "border-r border-white/[0.06]",
                "shadow-[8px_0_30px_rgba(0,0,0,0.18)]",
                "transition-[width] duration-300 ease-in-out",
                collapsed && "lg:w-[70px]"
            )}
        >
            {/* Subtle Campfire glow */}
            <div
                className={cn(
                    "pointer-events-none absolute -left-20 top-24",
                    "h-48 w-48 rounded-full",
                    "bg-orange-500/[0.06] blur-3xl",
                    "transition-opacity duration-300",
                    collapsed ? "opacity-50" : "opacity-100"
                )}
            />

            {/* Sidebar content */}
            <div className="relative flex h-full flex-col">
                {children}
            </div>
        </aside>
    );
};