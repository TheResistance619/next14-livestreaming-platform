import { NextResponse } from "next/server";
import { getActivePoll } from "@/lib/poll-service";

export async function GET(
    request: Request
) {
    try {
        const { searchParams } = new URL(request.url);
        const streamId = searchParams.get("streamId");

        if (!streamId) {
            return NextResponse.json(
                { error: "Stream ID is required" },
                { status: 400 }
            );
        }

        const poll = await getActivePoll(streamId);

        return NextResponse.json(poll);
    } catch (error) {
        console.error("[POLL_GET]", error);

        return NextResponse.json(
            { error: "Internal Error" },
            { status: 500 }
        );
    }
}