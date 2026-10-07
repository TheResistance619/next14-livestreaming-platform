"use client";

import { Actions } from "./actions";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import { useCreatorSidebar } from "@/store/use-creator-sidebar";

export const Navbar = () => {
    const { collapsed } = useCreatorSidebar((state) => state);

    return (
        <nav
            className={cn(
                "fixed top-0 right-0 z-[40] h-20",
                "bg-[#15151b]/95 backdrop-blur-xl",
                "border-b border-white/[0.06]",
                "shadow-sm",
                "px-4 lg:px-6",
                "flex items-center justify-between",
                "transition-[left] duration-300 ease-in-out",
                collapsed
                    ? "left-[70px]"
                    : "left-[70px] lg:left-60"
            )}
        >
            <Logo />

            <Actions />
        </nav>
    );
};