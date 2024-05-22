"use client";

import { onBlock, onUnblock } from "@/actions/block";
import { onFollow, onUnfollow } from "@/actions/follow";
import { Button } from "@/components/ui/button";
import { followUser } from "@/lib/follow-service";
import { useTransition } from "react";
import { toast } from "sonner";

interface ActionsProps {
    isFollowing:boolean;
    userId: string;
};

export const Actions = ({
    isFollowing,
    userId,
}: ActionsProps) => {
const [isPending, startTransiton] = useTransition();

    const handleFollow = () => {
        startTransiton (()  => {
        onFollow(userId)
        .then((data) => toast.success(`You are now following ${data.following.username}`))
        .catch(() => toast.error("Something went wrong"));

    });
};

const handleUnfollow = () => {
    startTransiton (()  => {
    onUnfollow(userId)
    .then((data) => toast.success(`You have unfollowed ${data.following.username}`))
    .catch(() => toast.error("Something went wrong"));

});
};

const onClick = () => {
    if (isFollowing) {
        handleUnfollow();
    } else {
        handleFollow();
    }
}

const handleBlock = () => {
  startTransiton(() => {
    onBlock(userId)
    .then((data) => toast.success(`Blocked the user ${data.blocked.username}`))
    .catch(() => toast.error("Something went wrong"));
  });
};

    return(
        <>
        <Button 
        disabled={isPending}
        onClick={onClick}
        variant="primary"
        >
            {isFollowing ? "Unfollow" : "Follow"}
            </Button>
            <Button onClick={handleBlock} disabled={isPending}>
                Block
            </Button>
            </>
    );
};