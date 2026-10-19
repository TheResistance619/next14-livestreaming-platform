
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { resetIngresses } from "@/actions/ingress";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return new Response("Webhook secret is not configured", {
      status: 500,
    });
  }

  // Read and validate the Svix webhook headers.
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing Svix headers", {
      status: 400,
    });
  }

  // Read the raw request body for signature verification.
  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (error) {
    console.error("Error verifying Clerk webhook:", error);
    return new Response("Invalid webhook signature", {
      status: 400,
    });
  }

  const eventType = evt.type;
  const data = evt.data;

  try {
    if (eventType === "user.created" || eventType === "user.updated") {
      const userData = data as {
        id: string;
        username: string | null;
        image_url: string;
        primary_email_address_id: string | null;
        email_addresses: Array<{
          id: string;
          email_address: string;
        }>;
      };

      const primaryEmail = userData.email_addresses?.find(
        (email) => email.id === userData.primary_email_address_id
      )?.email_address;

      const emailUsername = primaryEmail?.split("@")[0];

      const username =
        userData.username?.trim() ||
        emailUsername ||
        `user_${userData.id.slice(-8)}`;

      await db.user.upsert({
        where: {
          externalUserId: userData.id,
        },
        update: {
          username,
          imageUrl: userData.image_url,
        },
        create: {
          externalUserId: userData.id,
          username,
          imageUrl: userData.image_url,
          stream: {
            create: {
              name: `${username}'s stream`,
            },
          },
        },
      });
    }

    if (eventType === "user.deleted") {
      const userData = data as { id: string };

      await resetIngresses(userData.id);

      await db.user.deleteMany({
        where: {
          externalUserId: userData.id,
        },
      });
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(`Error processing Clerk webhook (${eventType}):`, error);

    return new Response("Error processing webhook event", {
      status: 500,
    });
  }
}
