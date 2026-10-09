
"use client";

import { Participant, RoomEvent, Track } from "livekit-client";
import { useRef, useState, useEffect } from "react";
import { useTracks, useRoomContext } from "@livekit/components-react";
import { FullscreenControl } from "./fullscreen-control";
import { useEventListener } from "usehooks-ts";
import { VolumeControl } from "./volume-control";

interface LiveVideoProps {
    participant: Participant;
}

interface CampfireSpark {
    id: string;
    emoji: string;
    x: number;
}

interface SparkMessage {
    type: "campfire-spark";
    emoji: string;
    id: string;
}

const SPARKS = ["🔥", "❤️", "😂", "👏", "😍", "💯"];

export const LiveVideo = ({ participant }: LiveVideoProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const room = useRoomContext();

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [volume, setVolume] = useState(0);
    const [sparks, setSparks] = useState<CampfireSpark[]>([]);
    const [isSending, setIsSending] = useState(false);

    const addSpark = (emoji: string, id: string) => {
        const spark: CampfireSpark = {
            id,
            emoji,
            x: 10 + Math.random() * 80,
        };

        setSparks((current) => [...current.slice(-19), spark]);

        window.setTimeout(() => {
            setSparks((current) =>
                current.filter((item) => item.id !== id)
            );
        }, 2500);
    };

    useEffect(() => {
        const handleData = (payload: Uint8Array) => {
            try {
                const message = JSON.parse(
                    new TextDecoder().decode(payload)
                ) as Partial<SparkMessage>;

                if (
                    message.type !== "campfire-spark" ||
                    typeof message.emoji !== "string" ||
                    !SPARKS.includes(message.emoji) ||
                    typeof message.id !== "string"
                ) {
                    return;
                }

                addSpark(message.emoji, message.id);
            } catch {
                // Ignore unrelated or malformed room messages.
            }
        };

        room.on(RoomEvent.DataReceived, handleData);

        return () => {
            room.off(RoomEvent.DataReceived, handleData);
        };
    }, [room]);

    const sendSpark = async (emoji: string) => {
        if (isSending) return;

        setIsSending(true);

        const message: SparkMessage = {
            type: "campfire-spark",
            emoji,
            id: `${room.localParticipant.identity}-${Date.now()}-${Math.random()}`,
        };

        try {
            await room.localParticipant.publishData(
                new TextEncoder().encode(JSON.stringify(message)),
                0
            );

            addSpark(message.emoji, message.id);
        } catch (error) {
            console.error("[CAMPFIRE_SPARK]", error);
        } finally {
            window.setTimeout(() => setIsSending(false), 350);
        }
    };

    const onVolumeChange = (value: number) => {
        setVolume(+value);

        if (videoRef.current) {
            videoRef.current.muted = value === 0;
            videoRef.current.volume = +value * 0.01;
        }
    };

    const toggleMute = () => {
        const isMuted = volume === 0;
        setVolume(isMuted ? 50 : 0);

        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            videoRef.current.volume = isMuted ? 0.5 : 0;
        }
    };

    useEffect(() => {
        onVolumeChange(0);
    }, []);

    const toggleFullscreen = () => {
        if (isFullscreen) {
            document.exitFullscreen();
        } else if (wrapperRef.current) {
            wrapperRef.current.requestFullscreen();
        }
    };

    const handleFullscreenChange = () => {
        setIsFullscreen(document.fullscreenElement !== null);
    };

    useEventListener("fullscreenchange", handleFullscreenChange, wrapperRef);

    useTracks([Track.Source.Camera, Track.Source.Microphone])
        .filter((track) => track.participant.identity === participant.identity)
        .forEach((track) => {
            if (videoRef.current) {
                track.publication.track?.attach(videoRef.current);
            }
        });

    return (
        <div ref={wrapperRef} className="relative flex h-full overflow-hidden">
            <video ref={videoRef} width="100%" className="object-contain" />

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {sparks.map((spark) => (
                    <div
                        key={spark.id}
                        className="campfire-spark absolute bottom-16 text-3xl drop-shadow-lg"
                        style={{ left: `${spark.x}%` }}
                    >
                        {spark.emoji}
                    </div>
                ))}
            </div>

            <div className="absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/60 p-1.5 opacity-0 backdrop-blur-md transition-opacity hover:opacity-100 focus-within:opacity-100">
                {SPARKS.map((emoji) => (
                    <button
                        key={emoji}
                        type="button"
                        onClick={() => void sendSpark(emoji)}
                        disabled={isSending}
                        aria-label={`Send ${emoji} reaction`}
                        className="rounded-full p-2 text-xl transition hover:scale-125 hover:bg-white/10 disabled:opacity-50"
                    >
                        {emoji}
                    </button>
                ))}
            </div>

            <div className="absolute inset-0 opacity-0 transition-opacity hover:opacity-100">
                <div className="absolute bottom-0 flex h-14 w-full items-center justify-between bg-gradient-to-r from-neutral-900 px-4">
                    <VolumeControl
                        onChange={onVolumeChange}
                        value={volume}
                        onToggle={toggleMute}
                    />
                    <FullscreenControl
                        isFullscreen={isFullscreen}
                        onToggle={toggleFullscreen}
                    />
                </div>
            </div>
        </div>
    );
};
