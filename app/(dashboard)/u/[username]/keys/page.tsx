import { UrlCard } from "./_components/url-card";
import { getSelf } from "@/lib/auth-service";
import { getStreamByUserId } from "@/lib/stream-service";
import { KeyCard } from "./_components/key-card";
import { ConnectModal } from "./_components/connect-modal";

const KeysPage = async () => {
    const self = await getSelf();
    const stream = await getStreamByUserId(self.id);

    if (!stream) {
        throw new Error("Stream not found");
    }

    return (
        <div className="p-6 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">
                    Set Up Your Stream
                </h1>

                <p className="text-sm text-muted-foreground mt-2">
                    Connect OBS or another streaming application to
                    broadcast on PlayNexus.
                </p>
            </div>

            <div className="rounded-xl border border-[#2D2E35] bg-background p-6 mb-6">
                <div className="mb-5">
                    <h2 className="text-lg font-semibold">
                        1. Generate your streaming connection
                    </h2>

                    <p className="text-sm text-muted-foreground mt-1">
                        Generate a connection and PlayNexus will provide
                        the Server URL and Stream Key you need in OBS.
                    </p>
                </div>

                <ConnectModal />
            </div>

            <div className="rounded-xl border border-[#2D2E35] bg-background p-6">
                <div className="mb-5">
                    <h2 className="text-lg font-semibold">
                        2. Connect your streaming software
                    </h2>

                    <p className="text-sm text-muted-foreground mt-1">
                        In OBS Studio, go to Settings → Stream, select
                        Custom service, then enter the details below.
                    </p>
                </div>

                <div className="space-y-4">
                    <UrlCard value={stream.serverUrl} />
                    <KeyCard value={stream.streamKey} />
                </div>
            </div>

            <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                <p className="text-sm font-medium">
                    🔐 Keep your Stream Key private
                </p>

                <p className="text-sm text-muted-foreground mt-1">
                    Anyone with your Stream Key may be able to stream to
                    your channel. Never share it publicly.
                </p>
            </div>
        </div>
    );
};

export default KeysPage;