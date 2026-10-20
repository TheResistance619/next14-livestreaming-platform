
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export enum ChatVariant {
    CHAT = "CHAT",
    COMMUNITY = "COMMUNITY",
}

type ChatTextSize = "small" | "medium" | "large";

interface ChatSidebarStore {
    collapsed: boolean;
    variant: ChatVariant;
    textSize: ChatTextSize;
    compactMode: boolean;
    autoScrollPaused: boolean;

    onExpand: () => void;
    onCollapse: () => void;
    onChangeVariant: (variant: ChatVariant) => void;
    setTextSize: (size: ChatTextSize) => void;
    toggleCompactMode: () => void;
    toggleAutoScrollPaused: () => void;
}

export const useChatSidebar = create<ChatSidebarStore>()(
    persist(
        (set) => ({
            collapsed: false,
            variant: ChatVariant.CHAT,
            textSize: "medium",
            compactMode: false,
            autoScrollPaused: false,

            onExpand: () => set({ collapsed: false }),
            onCollapse: () => set({ collapsed: true }),
            onChangeVariant: (variant) => set({ variant }),
            setTextSize: (textSize) => set({ textSize }),
            toggleCompactMode: () =>
                set((state) => ({ compactMode: !state.compactMode })),
            toggleAutoScrollPaused: () =>
                set((state) => ({
                    autoScrollPaused: !state.autoScrollPaused,
                })),
        }),
        {
            name: "campfire-chat-preferences",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                collapsed: state.collapsed,
                variant: state.variant,
                textSize: state.textSize,
                compactMode: state.compactMode,
                autoScrollPaused: state.autoScrollPaused,
            }),
        }
    )
);
