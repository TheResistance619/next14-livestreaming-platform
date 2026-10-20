
"use client";

import { Bookmark, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatBookmarks } from "@/store/use-chat-bookmarks";
import { format } from "date-fns";

interface ChatBookmarksProps {
    streamId: string;
}

export const ChatBookmarks = ({ streamId }: ChatBookmarksProps) => {
    const { bookmarks, removeBookmark } = useChatBookmarks();

    const savedMessages = bookmarks
        .filter((bookmark) => bookmark.streamId === streamId)
        .sort((a, b) => b.savedAt - a.savedAt);

    return (
        <div className="border-b p-3">
            <div className="mb-2 flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Saved messages</h3>
                <span className="text-xs text-muted-foreground">
                    ({savedMessages.length})
                </span>
            </div>

            {savedMessages.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                    No bookmarks yet. Save a chat message using its bookmark icon.
                </p>
            ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto">
                    {savedMessages.map((bookmark) => (
                        <div
                            key={bookmark.id}
                            className="flex items-start gap-2 rounded-md bg-muted/40 p-2"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-muted-foreground">
                                    {bookmark.senderName} ·{" "}
                                    {format(bookmark.timestamp, "HH:mm")}
                                </p>

                                <p className="break-words text-sm">
                                    {bookmark.message}
                                </p>
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                aria-label={`Remove bookmark from ${bookmark.senderName}`}
                                title="Remove bookmark"
                                onClick={() => removeBookmark(bookmark.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
