"use client";

import { useEffect, useState } from "react";
import { onEndPoll } from "@/actions/poll";

interface PollOption {
    id: string;
    text: string;
    votes: number;
}

interface PollData {
    id: string;
    question: string;
    isActive: boolean;
    options: PollOption[];
}

interface PollManagerProps {
    streamId: string;
}

export const PollManager = ({ streamId }: PollManagerProps) => {
    const [poll, setPoll] = useState<PollData | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const fetchPoll = async () => {
        try {
            const response = await fetch(
                `/api/poll?streamId=${streamId}`,
                {
                    cache: "no-store",
                }
            );

            if (!response.ok) return;

            const data = await response.json();
            setPoll(data);
        } catch (error) {
            console.error("[POLL_MANAGER_FETCH]", error);
        }
    };

    useEffect(() => {
        fetchPoll();

        const interval = setInterval(fetchPoll, 3000);

        return () => clearInterval(interval);
    }, [streamId]);

    const handleEndPoll = async () => {
        if (!poll || loading) return;

        const confirmed = window.confirm(
            "End this poll?\n\nThis will stop voting and remove the poll from the stream."
        );

        if (!confirmed) return;

        try {
            setLoading(true);
            setMessage("");

            await onEndPoll(poll.id);

            setPoll(null);
            setMessage("Poll ended.");
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    if (!poll || !poll.isActive) {
        return null;
    }

    const totalVotes = poll.options.reduce(
        (total, option) => total + option.votes,
        0
    );

    return (
        <div className="mb-6 max-w-xl rounded-lg border p-6">
            <div className="mb-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            🔴 Active Poll
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {poll.question}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleEndPoll}
                        disabled={loading}
                        className="rounded-md border border-destructive px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Ending..." : "End Poll"}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                {poll.options.map((option) => {
                    const percentage =
                        totalVotes === 0
                            ? 0
                            : Math.round(
                                  (option.votes / totalVotes) * 100
                              );

                    return (
                        <div
                            key={option.id}
                            className="relative overflow-hidden rounded-md border p-3"
                        >
                            <div
                                className="absolute inset-y-0 left-0 bg-primary/10 transition-all"
                                style={{
                                    width: `${percentage}%`,
                                }}
                            />

                            <div className="relative flex items-center justify-between gap-2">
                                <span className="text-sm">
                                    {option.text}
                                </span>

                                <span className="text-xs text-muted-foreground">
                                    {option.votes}{" "}
                                    {option.votes === 1
                                        ? "vote"
                                        : "votes"}{" "}
                                    ({percentage}%)
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
                {totalVotes}{" "}
                {totalVotes === 1 ? "total vote" : "total votes"}
            </p>

            {message && (
                <p className="mt-2 text-sm text-muted-foreground">
                    {message}
                </p>
            )}
        </div>
    );
};