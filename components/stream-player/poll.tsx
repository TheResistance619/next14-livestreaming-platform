"use client";

import { useEffect, useState } from "react";
import {
    RoomEvent,
    type Room,
} from "livekit-client";
import { onVotePoll } from "@/actions/poll";

interface PollOption {
    id: string;
    text: string;
    votes: number;
}

interface PollData {
    id: string;
    question: string;
    isActive: boolean;
    duration: number;
    endsAt: string;
    options: PollOption[];
}

interface PollVoteMessage {
    type: "poll-vote";
    pollId: string;
    optionId: string;
}

interface PollProps {
    streamId: string;
    room?: Room;
}

export const Poll = ({
    streamId,
    room,
}: PollProps) => {
    const [poll, setPoll] =
        useState<PollData | null>(null);
    const [voted, setVoted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    const fetchPoll = async () => {
        try {
            const response = await fetch(
                `/api/poll?streamId=${streamId}`,
                { cache: "no-store" }
            );

            if (!response.ok) return;

            const data = await response.json();

            setPoll(data);

            if (data?.endsAt) {
                setTimeLeft(
                    Math.max(
                        0,
                        Math.ceil(
                            (new Date(
                                data.endsAt
                            ).getTime() -
                                Date.now()) /
                                1000
                        )
                    )
                );
            }
        } catch (error) {
            console.error(
                "[POLL_FETCH]",
                error
            );
        }
    };

    useEffect(() => {
        fetchPoll();

        const interval = setInterval(
            fetchPoll,
            3000
        );

        return () =>
            clearInterval(interval);
    }, [streamId]);

    useEffect(() => {
        if (!room) return;

        const handleData = (
            payload: Uint8Array
        ) => {
            try {
                const message =
                    JSON.parse(
                        new TextDecoder().decode(
                            payload
                        )
                    ) as PollVoteMessage;

                if (
                    message.type !==
                    "poll-vote"
                ) {
                    return;
                }

                setPoll((currentPoll) => {
                    if (
                        !currentPoll ||
                        currentPoll.id !==
                            message.pollId
                    ) {
                        return currentPoll;
                    }

                    return {
                        ...currentPoll,
                        options:
                            currentPoll.options.map(
                                (option) =>
                                    option.id ===
                                    message.optionId
                                        ? {
                                              ...option,
                                              votes:
                                                  option.votes +
                                                  1,
                                          }
                                        : option
                            ),
                    };
                });
            } catch (error) {
                console.error(
                    "[POLL_DATA_MESSAGE]",
                    error
                );
            }
        };

        room.on(
            RoomEvent.DataReceived,
            handleData
        );

        return () => {
            room.off(
                RoomEvent.DataReceived,
                handleData
            );
        };
    }, [room]);

    useEffect(() => {
        if (!poll?.endsAt) return;

        const updateCountdown = () => {
            const remaining = Math.max(
                0,
                Math.ceil(
                    (new Date(
                        poll.endsAt
                    ).getTime() -
                        Date.now()) /
                        1000
                )
            );

            setTimeLeft(remaining);
        };

        updateCountdown();

        const interval = setInterval(
            updateCountdown,
            1000
        );

        return () =>
            clearInterval(interval);
    }, [poll?.endsAt]);

    const handleVote = async (
        optionId: string
    ) => {
        if (
            !poll ||
            voted ||
            loading ||
            timeLeft <= 0
        ) {
            return;
        }

        try {
            setLoading(true);

            await onVotePoll(
                poll.id,
                optionId
            );

            setVoted(true);

            if (room) {
                const message: PollVoteMessage =
                    {
                        type: "poll-vote",
                        pollId: poll.id,
                        optionId,
                    };

                const encoded =
                    new TextEncoder().encode(
                        JSON.stringify(message)
                    );

                await room.localParticipant.publishData(
                    encoded,
                    0
                );
            }

            // Refresh from the database so
            // our own UI always uses the
            // authoritative vote count.
            await fetchPoll();
        } catch (error) {
            console.error(
                "[POLL_VOTE]",
                error
            );

            await fetchPoll();
        } finally {
            setLoading(false);
        }
    };

    if (!poll || !poll.isActive) {
        return null;
    }

    const totalVotes =
        poll.options.reduce(
            (total, option) =>
                total + option.votes,
            0
        );

    const isExpired =
        timeLeft <= 0;

    return (
        <div className="border-b bg-background p-3">
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold">
                        🔥 Live Poll
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {poll.question}
                    </p>
                </div>

                <span
                    className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
                        isExpired
                            ? "bg-red-500/10 text-red-500"
                            : timeLeft <= 10
                            ? "bg-orange-500/10 text-orange-500"
                            : "bg-primary/10 text-primary"
                    }`}
                >
                    {isExpired
                        ? "Ended"
                        : `${timeLeft}s`}
                </span>
            </div>

            <div className="space-y-2">
                {poll.options.map(
                    (option) => {
                        const percentage =
                            totalVotes ===
                            0
                                ? 0
                                : Math.round(
                                      (option.votes /
                                          totalVotes) *
                                          100
                                  );

                        return (
                            <button
                                key={option.id}
                                onClick={() =>
                                    handleVote(
                                        option.id
                                    )
                                }
                                disabled={
                                    voted ||
                                    loading ||
                                    isExpired
                                }
                                className="relative w-full overflow-hidden rounded-md border p-2 text-left transition hover:bg-muted disabled:cursor-not-allowed"
                            >
                                <div
                                    className="absolute inset-y-0 left-0 bg-primary/10 transition-all"
                                    style={{
                                        width: `${percentage}%`,
                                    }}
                                />

                                <div className="relative flex items-center justify-between gap-2">
                                    <span className="text-sm">
                                        {
                                            option.text
                                        }
                                    </span>

                                    <span className="text-xs text-muted-foreground">
                                        {
                                            percentage
                                        }
                                        %
                                    </span>
                                </div>
                            </button>
                        );
                    }
                )}
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
                {totalVotes} vote
                {totalVotes === 1
                    ? ""
                    : "s"}

                {voted &&
                    " • You voted"}

                {isExpired &&
                    " • Poll ended"}
            </p>
        </div>
    );
};