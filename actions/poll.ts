"use server";

import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";
import { createPoll } from "@/lib/poll-service";

export const onCreatePoll = async (
    question: string,
    options: string[],
    duration: number
) => {
    const self = await getSelf();

    if (options.length < 2 || options.length > 4) {
        throw new Error("Polls must have between 2 and 4 options");
    }

    const cleanQuestion = question.trim();

    const cleanOptions = options
        .map((option) => option.trim())
        .filter(Boolean);

    if (!cleanQuestion) {
        throw new Error("Poll question is required");
    }

    if (cleanOptions.length < 2 || cleanOptions.length > 4) {
        throw new Error("Polls must have between 2 and 4 valid options");
    }

    if (![30, 60, 300].includes(duration)) {
        throw new Error("Invalid poll duration");
    }

    const stream = await db.stream.findUnique({
        where: {
            userId: self.id,
        },
    });

    if (!stream) {
        throw new Error("Stream not found");
    }

    // End any currently active poll before starting a new one.
    await db.poll.updateMany({
        where: {
            streamId: stream.id,
            isActive: true,
        },
        data: {
            isActive: false,
        },
    });

    return createPoll(
        stream.id,
        cleanQuestion,
        cleanOptions,
        duration
    );
};

export const onVotePoll = async (
    pollId: string,
    optionId: string
) => {
    const self = await getSelf();

    const poll = await db.poll.findUnique({
        where: {
            id: pollId,
        },
        include: {
            options: true,
        },
    });

    if (!poll || !poll.isActive) {
        throw new Error("Poll is not active");
    }

    if (poll.endsAt && poll.endsAt <= new Date()) {
        await db.poll.update({
            where: {
                id: poll.id,
            },
            data: {
                isActive: false,
            },
        });

        throw new Error("Poll has ended");
    }

    const option = poll.options.find(
        (option) => option.id === optionId
    );

    if (!option) {
        throw new Error("Invalid poll option");
    }

    const existingVote = await db.pollVote.findUnique({
        where: {
            pollId_userId: {
                pollId,
                userId: self.id,
            },
        },
    });

    if (existingVote) {
        throw new Error("You have already voted");
    }

    await db.$transaction([
        db.pollVote.create({
            data: {
                pollId,
                optionId,
                userId: self.id,
            },
        }),

        db.pollOption.update({
            where: {
                id: optionId,
            },
            data: {
                votes: {
                    increment: 1,
                },
            },
        }),
    ]);

    return true;
};

export const onEndPoll = async (pollId: string) => {
    const self = await getSelf();

    const poll = await db.poll.findUnique({
        where: {
            id: pollId,
        },
        include: {
            stream: true,
        },
    });

    if (!poll) {
        throw new Error("Poll not found");
    }

    if (poll.stream.userId !== self.id) {
        throw new Error("Unauthorized");
    }

    if (!poll.isActive) {
        return poll;
    }

    return db.poll.update({
        where: {
            id: pollId,
        },
        data: {
            isActive: false,
        },
    });
};