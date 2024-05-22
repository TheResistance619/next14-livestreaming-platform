"use server";

import { getSelf } from "@/lib/auth-service";
import { blockUser, unblockUser } from "@/lib/block-service"
import { RoomServiceClient } from "livekit-server-sdk";
import { revalidatePath } from "next/cache";

const roomService = new RoomServiceClient(
    process.env.LIVEKIT_API_URL!,
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    );


    export const onBlock = async (id: string) => {
        const self = await getSelf();
      
        const blockedUser = await blockUser(id);
      
        try {
          await roomService.removeParticipant(self.id, id);
        } catch (error) {
          console.error("Error removing user from room:", error);
          // Handle error gracefully, e.g., log the error
        }
      
        revalidatePath(`/u/${self.username}/community`);
      
        return blockedUser;
      };
      


export const onUnblock = async (id: string) => {
   const self = await getSelf();
   const unblockedUser = await unblockUser(id);

    revalidatePath(`/u/${self.username}/community`);
    return unblockedUser;
};