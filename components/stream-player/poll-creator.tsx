"use client";

import { useState } from "react";
import { onCreatePoll } from "@/actions/poll";

interface PollCreatorProps {
    streamId: string;
}

export const PollCreator = ({ streamId }: PollCreatorProps) => {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [duration, setDuration] = useState(60);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const updateOption = (index: number, value: string) => {
        setOptions((current) =>
            current.map((option, i) =>
                i === index ? value : option
            )
        );
    };

    const addOption = () => {
        if (options.length >= 4) return;

        setOptions((current) => [...current, ""]);
    };

    const removeOption = (index: number) => {
        if (options.length <= 2) return;

        setOptions((current) =>
            current.filter((_, i) => i !== index)
        );
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setLoading(true);
        setMessage("");

        try {
            await onCreatePoll(question, options, duration);

            setQuestion("");
            setOptions(["", ""]);
            setDuration(60);
            setMessage("🔥 Poll started!");
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

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-xl space-y-5 rounded-lg border p-6"
        >
            <div>
                <h2 className="text-lg font-semibold">
                    Create a Live Poll
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Ask your Campfire viewers a question.
                </p>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">
                    Question
                </label>

                <input
                    value={question}
                    onChange={(event) =>
                        setQuestion(event.target.value)
                    }
                    placeholder="What should we play next?"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    maxLength={200}
                    required
                />
            </div>

            <div className="space-y-3">
                <label className="text-sm font-medium">
                    Options
                </label>

                {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                        <input
                            value={option}
                            onChange={(event) =>
                                updateOption(
                                    index,
                                    event.target.value
                                )
                            }
                            placeholder={`Option ${index + 1}`}
                            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                            maxLength={100}
                            required
                        />

                        {options.length > 2 && (
                            <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="rounded-md border px-3 text-sm hover:bg-muted"
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}

                {options.length < 4 && (
                    <button
                        type="button"
                        onClick={addOption}
                        className="text-sm text-primary hover:underline"
                    >
                        + Add option
                    </button>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">
                    Poll Duration
                </label>

                <select
                    value={duration}
                    onChange={(event) =>
                        setDuration(Number(event.target.value))
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value={30}>30 seconds</option>
                    <option value={60}>1 minute</option>
                    <option value={300}>5 minutes</option>
                </select>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading ? "Starting poll..." : "🔥 Start Poll"}
            </button>

            {message && (
                <p className="text-sm text-muted-foreground">
                    {message}
                </p>
            )}
        </form>
    );
};