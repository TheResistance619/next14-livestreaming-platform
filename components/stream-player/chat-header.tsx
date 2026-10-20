
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChatToggle } from "./chat-toggle";
import { VariantToggle } from "./variant-toggle";
import { useChatSidebar } from "@/store/use-chat-sidebar";
import { Minus, Plus, Pause, Play, AlignJustify } from "lucide-react";

export const ChatHeader = () => {
    const {
        textSize,
        setTextSize,
        compactMode,
        toggleCompactMode,
        autoScrollPaused,
        toggleAutoScrollPaused,
    } = useChatSidebar((state) => state);

    const sizes = ["small", "medium", "large"] as const;

    const cycleTextSize = () => {
        const currentIndex = sizes.indexOf(textSize);
        setTextSize(sizes[(currentIndex + 1) % sizes.length]);
    };

    return (
        <div className="border-b">
            <div className="relative p-3">
                <div className="absolute left-2 top-2 hidden lg:block">
                    <ChatToggle />
                </div>

                <p className="font-semibold text-primary text-center">
                    Stream Chat
                </p>

                <div className="absolute right-2 top-2">
                    <VariantToggle />
                </div>
            </div>

            <div className="flex items-center justify-center gap-1 px-2 pb-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    title={`Text size: ${textSize}. Click to change`}
                    aria-label={`Change chat text size, currently ${textSize}`}
                    onClick={cycleTextSize}
                    className="h-8 px-2"
                >
                    <span className="font-semibold">A</span>
                    <Plus className="ml-1 h-3 w-3" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    title={compactMode ? "Disable compact mode" : "Enable compact mode"}
                    aria-label="Toggle compact chat mode"
                    aria-pressed={compactMode}
                    onClick={toggleCompactMode}
                    className="h-8 px-2"
                >
                    <AlignJustify className="mr-1 h-4 w-4" />
                    <span className="text-xs">Compact</span>
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    title={autoScrollPaused ? "Resume chat scrolling" : "Pause chat scrolling"}
                    aria-label={autoScrollPaused ? "Resume chat scrolling" : "Pause chat scrolling"}
                    aria-pressed={autoScrollPaused}
                    onClick={toggleAutoScrollPaused}
                    className="h-8 px-2"
                >
                    {autoScrollPaused
                        ? <Play className="mr-1 h-4 w-4" />
                        : <Pause className="mr-1 h-4 w-4" />}
                    <span className="text-xs">
                        {autoScrollPaused ? "Resume" : "Pause"}
                    </span>
                </Button>
            </div>
        </div>
    );
};

export const ChatHeaderSkeleton = () => (
    <div className="relative border-b p-3 hidden md:block">
        <Skeleton className="absolute h-6 w-6 left-3 top-3" />
        <Skeleton className="w-28 h-6 mx-auto" />
    </div>
);
