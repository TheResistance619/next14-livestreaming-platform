
"use client";

import {
    ConnectionQuality,
    ConnectionState,
    RoomEvent,
    Track,
} from "livekit-client";
import {
    useConnectionState,
    useRemoteParticipant,
    useRoomContext,
    useTracks,
} from "@livekit/components-react";
import { useEffect, useState } from "react";
import { Wifi, WifiOff, Signal, Loader2 } from "lucide-react";

import { OfflineVideo } from "./offline-video";
import { LoadingVideo } from "./loading-video";
import { LiveVideo } from "./live-video";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoProps {
    hostName: string;
    hostIdentity: string;
}

export const Video = ({
    hostName,
    hostIdentity,
}: VideoProps) => {
    const connectionState = useConnectionState();
    const room = useRoomContext();
    const participant = useRemoteParticipant(hostIdentity);

    const tracks = useTracks([
        Track.Source.Camera,
        Track.Source.Microphone,
    ]).filter(
        (track) => track.participant.identity === hostIdentity
    );

    const [quality, setQuality] = useState<ConnectionQuality>(
        room.localParticipant.connectionQuality
    );

    useEffect(() => {
        setQuality(room.localParticipant.connectionQuality);

        const handleQualityChange = (
            nextQuality: ConnectionQuality,
            changedParticipant: {
                identity: string;
            }
        ) => {
            if (
                changedParticipant.identity ===
                room.localParticipant.identity
            ) {
                setQuality(nextQuality);
            }
        };

        room.on(
            RoomEvent.ConnectionQualityChanged,
            handleQualityChange
        );

        return () => {
            room.off(
                RoomEvent.ConnectionQualityChanged,
                handleQualityChange
            );
        };
    }, [room]);

    const isConnected =
        connectionState === ConnectionState.Connected;

    const isReconnecting =
        connectionState === ConnectionState.Reconnecting;

    const qualityLabel =
        quality === ConnectionQuality.Excellent
            ? "Excellent"
            : quality === ConnectionQuality.Good
              ? "Good"
              : quality === ConnectionQuality.Poor
                ? "Poor"
                : "Checking";

    const statusLabel = !isConnected
        ? isReconnecting
            ? "Reconnecting"
            : "Connecting"
        : qualityLabel;

    const statusColor = !isConnected
        ? "text-amber-400"
        : quality === ConnectionQuality.Poor
          ? "text-red-400"
          : quality === ConnectionQuality.Excellent ||
              quality === ConnectionQuality.Good
            ? "text-green-400"
            : "text-amber-400";

    let content;

    if (
        !participant &&
        connectionState === ConnectionState.Connected
    ) {
        content = <OfflineVideo username={hostName} />;
    } else if (!participant || tracks.length === 0) {
        content = <LoadingVideo label={connectionState} />;
    } else {
        content = <LiveVideo participant={participant} />;
    }

    return (
        <div className="aspect-video border-b group relative">
            {content}

            <div
                className="absolute right-3 top-3 z-30 flex items-center gap-2 rounded-full border border-white/10 bg-black/75 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md"
                title="Your connection to Campfire"
            >
                {!isConnected ? (
                    isReconnecting ? (
                        <Loader2
                            className="h-3.5 w-3.5 animate-spin text-amber-400"
                        />
                    ) : (
                        <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                    )
                ) : quality === ConnectionQuality.Poor ? (
                    <WifiOff className="h-3.5 w-3.5 text-red-400" />
                ) : quality === ConnectionQuality.Excellent ? (
                    <Signal className="h-3.5 w-3.5 text-green-400" />
                ) : (
                    <Wifi className="h-3.5 w-3.5 text-green-400" />
                )}

                <span className={statusColor}>
                    {statusLabel}
                </span>
            </div>
        </div>
    );
};

export const VideoSkeleton = () => {
    return (
        <div className="aspect-video border-x border-background">
            <Skeleton className="h-full w-full rounded-none" />
        </div>
    );
};
