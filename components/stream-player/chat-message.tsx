
"use client";

import { format } from "date-fns";
import { ReceivedChatMessage } from "@livekit/components-react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { stringToColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useChatBookmarks } from "@/store/use-chat-bookmarks";

type ChatTextSize = "small" | "medium" | "large";

interface ChatMessageProps {
    data: ReceivedChatMessage;
    textSize?: ChatTextSize;
    compactMode?: boolean;
    streamId?: string;
}

export const ChatMessage = ({
    data,
    textSize = "medium",
    compactMode = false,
    streamId = "",
}: ChatMessageProps) => {
    const color = stringToColor(data.from?.name || "");
    const { isBookmarked, toggleBookmark } = useChatBookmarks();

    const textSizeClass = {
        small: "text-xs",
        medium: "text-sm",
        large: "text-base",
    }[textSize];

    const bookmarked = isBookmarked(streamId, data);

    return (
        <div
            className={[
                "group flex gap-2 rounded-md hover:bg-white/5",
                compactMode ? "px-1 py-0.5" : "p-2",
            ].join(" ")}
        >
            <p className="text-xs text-white/40 shrink-0 pt-1">
                {format(data.timestamp, "HH:mm")}
            </p>

            <div className="flex flex-wrap items-baseline gap-1 grow min-w-0">
                <p className={`${textSizeClass} font-semibold whitespace-nowrap`}>
                    <span className="truncate" style={{ color }}>
                        {data.from?.name}
                    </span>
                    :
                </p>

                <p className={`${textSizeClass} break-all`}>
                    {data.message}
                </p>
            </div>

            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 opacity-70 hover:opacity-100"
                title={bookmarked ? "Remove bookmark" : "Bookmark message"}
                aria-label={bookmarked ? "Remove bookmark" : "Bookmark message"}
                aria-pressed={bookmarked}
                onClick={() => toggleBookmark(streamId, data)}
            >
                {bookmarked ? (
                    <BookmarkCheck className="h-4 w-4" />
                ) : (
                    <Bookmark className="h-4 w-4" />
                )}
            </Button>
        </div>
    );
};
