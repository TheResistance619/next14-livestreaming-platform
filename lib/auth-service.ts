import { currentUser } from "@clerk/nextjs";

import { db } from "@/lib/db";

export const getSelf = async () => {
    const self = await currentUser();

    if (!self) {
        throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
        where: {
            externalUserId: self.id,
        },
    });

    if (!user) {
        throw new Error("Not Found");
    }

    return user;
};

export const getSelfByUsername = async (username: string) => {
    const self = await currentUser();

    if (!self) {
        throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
        where: {
            username,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Verify that the requested database user belongs to
    // the currently authenticated Clerk user.
    if (self.id !== user.externalUserId) {
        throw new Error("Unauthorized");
    }

    return user;
};