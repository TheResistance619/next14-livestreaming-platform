import { db } from "@/lib/db";

export const createPoll = async (
    streamId: string,
    question: string,
    options: string[],
    duration: number
) => {
    const endsAt = new Date(
        Date.now() + duration * 1000
    );

    return db.poll.create({
        data: {
            question,
            streamId,
            duration,
            endsAt,
            isActive: true,
            options: {
                create: options.map((text) => ({
                    text,
                })),
            },
        },
        include: {
            options: true,
        },
    });
};

export const getActivePoll = async (streamId: string) => {
    const poll = await db.poll.findFirst({
        where: {
            streamId,
            isActive: true,
        },
        include: {
            options: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (!poll) {
        return null;
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

        return null;
    }

    return poll;
};

export const getPollHistory = async (streamId: string) => {
    return db.poll.findMany({
        where: {
            streamId,
            isActive: false,
        },
        include: {
            options: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 10,
    });
};

export const getPollAnalytics = async (streamId: string) => {
    const polls = await db.poll.findMany({
        where: {
            streamId,
            isActive: false,
        },
        include: {
            options: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const totalPolls = polls.length;

    const totalVotes = polls.reduce(
        (total, poll) =>
            total +
            poll.options.reduce(
                (pollTotal, option) =>
                    pollTotal + option.votes,
                0
            ),
        0
    );

    const averageVotesPerPoll =
        totalPolls === 0
            ? 0
            : Math.round(
                  (totalVotes / totalPolls) * 10
              ) / 10;

    const mostParticipatedPoll = polls.reduce(
        (best, poll) => {
            const votes = poll.options.reduce(
                (total, option) =>
                    total + option.votes,
                0
            );

            if (!best || votes > best.votes) {
                return {
                    question: poll.question,
                    votes,
                };
            }

            return best;
        },
        null as {
            question: string;
            votes: number;
        } | null
    );

    const mostPopularOption = polls.reduce(
        (best, poll) => {
            return poll.options.reduce(
                (currentBest, option) => {
                    if (
                        !currentBest ||
                        option.votes >
                            currentBest.votes
                    ) {
                        return {
                            text: option.text,
                            votes: option.votes,
                        };
                    }

                    return currentBest;
                },
                best
            );
        },
        null as {
            text: string;
            votes: number;
        } | null
    );

    return {
        totalPolls,
        totalVotes,
        averageVotesPerPoll,
        mostParticipatedPoll,
        mostPopularOption,
    };
};