
"use client";

import { ReceivedChatMessage } from "@livekit/components-react";
import { useCallback, useLayoutEffect, useRef } from "react";
import { ChatMessage } from "./chat-message";
import { Skeleton } from "../ui/skeleton";
import { useChatSidebar } from "@/store/use-chat-sidebar";

interface ChatListProps {
    messages: ReceivedChatMessage[];
    isHidden: boolean;
    streamId: string;
}

export const ChatList = ({
    messages,
    isHidden,
    streamId,
}: ChatListProps) => {
    const { textSize, compactMode, autoScrollPaused } = useChatSidebar(
        (state) => state
    );

    const listRef = useRef<HTMLDivElement>(null);
    const savedScrollTop = useRef(0);
    const wasPaused = useRef(autoScrollPaused);

    const rememberScroll = useCallback(() => {
        const element = listRef.current;

        if (element && autoScrollPaused) {
            savedScrollTop.current = element.scrollTop;
        }
    }, [autoScrollPaused]);

    useLayoutEffect(() => {
        const element = listRef.current;
        if (!element) return;

        if (autoScrollPaused) {
            if (!wasPaused.current) {
                // Capture the current position when Pause is enabled.
                savedScrollTop.current = element.scrollTop;
            } else {
                // Preserve the reading position as messages arrive.
                element.scrollTop = savedScrollTop.current;
            }
        } else {
            // Resume normal auto-scrolling.
            element.scrollTop = 0;
            savedScrollTop.current = 0;
        }

        wasPaused.current = autoScrollPaused;
    }, [messages.length, autoScrollPaused]);

    if (isHidden || !messages || messages.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    {isHidden ? "Chat is disabled" : "Welcome to the chat!"}
                </p>
            </div>
        );
    }

    return (
        <div
            ref={listRef}
            onScroll={rememberScroll}
            className={[
                "flex flex-1 flex-col-reverse overflow-y-auto h-full",
                compactMode ? "p-1 gap-0" : "p-3 gap-1",
            ].join(" ")}
            data-auto-scroll-paused={autoScrollPaused}
        >
            {messages.map((message) => (
                <ChatMessage
                    key={`${message.timestamp}-${message.from?.identity ?? "unknown"}`}
                    data={message}
                    textSize={textSize}
                    compactMode={compactMode}
                    streamId={streamId}
                />
            ))}
        </div>
    );
};

export const ChatListSkeleton = () => (
    <div className="flex h-full items-center justify-center">
        <Skeleton className="w-1/2 h-6" />
    </div>
);
