
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ChatBookmark {
    id: string;
    streamId: string;
    senderName: string;
    senderIdentity: string;
    message: string;
    timestamp: number;
    savedAt: number;
}

interface ChatBookmarksStore {
    bookmarks: ChatBookmark[];
    isBookmarked: (streamId: string, message: {
        timestamp: number;
        message: string;
        from?: {
            name?: string;
            identity?: string;
        } | undefined;
    }) => boolean;
    toggleBookmark: (streamId: string, message: {
        timestamp: number;
        message: string;
        from?: {
            name?: string;
            identity?: string;
        } | undefined;
    }) => void;
    removeBookmark: (id: string) => void;
}

const createBookmarkId = (
    streamId: string,
    timestamp: number,
    senderIdentity: string,
    message: string
) =>
    `${streamId}:${timestamp}:${senderIdentity}:${message}`;

export const useChatBookmarks = create<ChatBookmarksStore>()(
    persist(
        (set, get) => ({
            bookmarks: [],

            isBookmarked: (streamId, message) => {
                const id = createBookmarkId(
                    streamId,
                    message.timestamp,
                    message.from?.identity ?? "",
                    message.message
                );

                return get().bookmarks.some((bookmark) => bookmark.id === id);
            },

            toggleBookmark: (streamId, message) => {
                const senderIdentity = message.from?.identity ?? "";
                const id = createBookmarkId(
                    streamId,
                    message.timestamp,
                    senderIdentity,
                    message.message
                );

                const existing = get().bookmarks.some(
                    (bookmark) => bookmark.id === id
                );

                if (existing) {
                    set((state) => ({
                        bookmarks: state.bookmarks.filter(
                            (bookmark) => bookmark.id !== id
                        ),
                    }));
                    return;
                }

                set((state) => ({
                    bookmarks: [
                        ...state.bookmarks,
                        {
                            id,
                            streamId,
                            senderName: message.from?.name ?? "Unknown viewer",
                            senderIdentity,
                            message: message.message,
                            timestamp: message.timestamp,
                            savedAt: Date.now(),
                        },
                    ],
                }));
            },

            removeBookmark: (id) =>
                set((state) => ({
                    bookmarks: state.bookmarks.filter(
                        (bookmark) => bookmark.id !== id
                    ),
                })),
        }),
        {
            name: "campfire-chat-bookmarks",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                bookmarks: state.bookmarks,
            }),
        }
    )
);
