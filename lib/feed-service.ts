import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

export const getStreams = async () => {
  let userId: string | null = null;

  try {
    const self = await getSelf();
    userId = self.id;
  } catch {
    userId = null;
  }

  const streams = await db.stream.findMany({
    where: userId
      ? {
          user: {
            NOT: {
              blocking: {
                some: {
                  blockedId: userId,
                },
              },
            },
          },
        }
      : undefined,
    select: {
      id: true,
      user: true,
      thumbnailUrl: true,
      name: true,
      isLive: true,
      updatedAt: true,
      userId: true,
    },
    orderBy: [
      { isLive: "desc" },
      { updatedAt: "desc" },
    ],
  });

  if (!userId) {
    return streams.map((stream) => ({
      ...stream,
      isFollowed: false,
    }));
  }

  const followedUsers = await db.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followedUserIds = new Set(
    followedUsers.map((follow) => follow.followingId)
  );

  return streams
    .map((stream) => ({
      ...stream,
      isFollowed: followedUserIds.has(stream.userId),
    }))
    .sort((a, b) => {
      const aPriority = a.isLive && a.isFollowed ? 1 : 0;
      const bPriority = b.isLive && b.isFollowed ? 1 : 0;

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
};
