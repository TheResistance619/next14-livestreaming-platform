import { headers } from "next/headers";
import { WebhookReceiver } from "livekit-server-sdk";
import { db } from "@/lib/db";

const receiver = new WebhookReceiver(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: Request) {
    try {
        const body = await req.text();

        const headerPayload = headers();
        const authorization = headerPayload.get("Authorization");

        if (!authorization) {
            return new Response("No authorization header", {
                status: 400,
            });
        }

        const event = await receiver.receive(body, authorization);

        console.log("LIVEKIT WEBHOOK:", event.event);

        const ingressId = event.ingressInfo?.ingressId;

        if (!ingressId) {
            console.log("LIVEKIT WEBHOOK: No ingress ID");
            return new Response("OK", {
                status: 200,
            });
        }

        if (event.event === "ingress_started") {
            const result = await db.stream.updateMany({
                where: {
                    ingressId: ingressId,
                },
                data: {
                    isLive: true,
                },
            });

            console.log(
                `LIVEKIT: ingress started, streams updated: ${result.count}`
            );
        }

        if (event.event === "ingress_ended") {
    const result = await db.stream.updateMany({
        where: {
            ingressId: ingressId,
            isLive: true,
        },
        data: {
            isLive: false,
        },
    });

    console.log(
        `LIVEKIT: ingress ended, streams updated: ${result.count}`
    );
}

        return new Response("OK", {
            status: 200,
        });
    } catch (error) {
        console.error("LIVEKIT WEBHOOK ERROR:", error);

        return new Response("Webhook Error", {
            status: 400,
        });
    }
}