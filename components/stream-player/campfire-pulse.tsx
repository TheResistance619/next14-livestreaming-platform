
"use client";

import { useEffect, useState } from "react";
import { RoomEvent, type Room } from "livekit-client";
import { Activity, Flame, Radio } from "lucide-react";

interface CampfirePulseProps {
    room: Room;
    viewerCount: number;
    isHost: boolean;
}

interface SparkMessage {
    type: "campfire-spark";
    emoji: string;
    id: string;
}

export const CampfirePulse = ({
    room,
    viewerCount,
    isHost,
}: CampfirePulseProps) => {
    const [reactionCount, setReactionCount] = useState(0);

    useEffect(() => {
        if (!isHost) return;

        const handleData = (payload: Uint8Array) => {
            try {
                const message = JSON.parse(
                    new TextDecoder().decode(payload)
                ) as Partial<SparkMessage>;

                if (
                    message.type !== "campfire-spark" ||
                    typeof message.emoji !== "string" ||
                    typeof message.id !== "string"
                ) {
                    return;
                }

                setReactionCount((count) => count + 1);
            } catch {
                // Ignore unrelated room messages.
            }
        };

        room.on(RoomEvent.DataReceived, handleData);

        return () => {
            room.off(RoomEvent.DataReceived, handleData);
        };
    }, [room, isHost]);

    if (!isHost) return null;

    return (
        <section className="mx-4 rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-background to-background p-4">
            <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-orange-500/15 p-2">
                    <Activity className="h-5 w-5 text-orange-400" />
                </div>

                <div>
                    <h3 className="font-semibold">Campfire Pulse</h3>
                    <p className="text-xs text-muted-foreground">
                        Live audience activity
                    </p>
                </div>

                <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                    LIVE
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/60 bg-background/70 p-3">
                    <Radio className="mb-2 h-4 w-4 text-orange-400" />
                    <p className="text-2xl font-bold tabular-nums">
                        {viewerCount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Connected viewers
                    </p>
                </div>

                <div className="rounded-lg border border-border/60 bg-background/70 p-3">
                    <Flame className="mb-2 h-4 w-4 text-orange-400" />
                    <p className="text-2xl font-bold tabular-nums">
                        {reactionCount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Reactions received
                    </p>
                </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
                Reaction totals count messages received during this session.
            </p>
        </section>
    );
};
