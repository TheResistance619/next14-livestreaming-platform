import { getStreams } from "@/lib/feed-service";
import { ResultCard, ResultCardSkeleton } from "./result-card";
import { Skeleton } from "@/components/ui/skeleton";

export const Results = async () => {
    const data = await getStreams();

    const followedLiveStreams = data.filter(
        (stream) => stream.isFollowed && stream.isLive
    );

    const exploreStreams = data.filter(
        (stream) => !(stream.isFollowed && stream.isLive)
    );

    const StreamGrid = ({
        streams,
    }: {
        streams: typeof data;
    }) => (
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {streams.map((result) => (
                <ResultCard key={result.id} data={result} />
            ))}
        </div>
    );

    return (
        <div className="space-y-10">
            <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#17171d] via-[#111116] to-[#0b0b0f] px-8 py-10">
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-500/[0.10] blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 left-1/3 h-56 w-56 rounded-full bg-amber-500/[0.05] blur-3xl" />

                <div className="relative max-w-2xl">
                    <div className="mb-3 flex items-center gap-x-2">
                        <span className="text-xl">🔥</span>
                        <span className="text-sm font-medium text-orange-400">
                            Welcome to Campfire
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
                        Find something worth watching.
                    </h1>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground lg:text-base">
                        Discover creators, games, music, coding and more...
                        there&apos;s always something happening around the
                        Campfire.
                    </p>
                </div>
            </section>

            {followedLiveStreams.length > 0 && (
                <section className="space-y-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">❤️</span>
                            <h2 className="text-xl font-semibold tracking-tight">
                                Following
                            </h2>
                            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                                LIVE
                            </span>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Creators you follow, streaming right now
                        </p>
                    </div>

                    <StreamGrid streams={followedLiveStreams} />
                </section>
            )}

            <section className="space-y-5">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🔥</span>
                            <h2 className="text-xl font-semibold tracking-tight">
                                Explore the Campfire
                            </h2>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {exploreStreams.length > 0
                                ? "Discover live creators and more channels"
                                : "You're all caught up with the live creators you follow"}
                        </p>
                    </div>

                    {exploreStreams.length > 0 && (
                        <span className="hidden text-xs text-muted-foreground sm:block">
                            {exploreStreams.length}{" "}
                            {exploreStreams.length === 1 ? "stream" : "streams"}
                        </span>
                    )}
                </div>

                {exploreStreams.length === 0 && followedLiveStreams.length === 0 && (
                    <div className="rounded-xl border border-dashed border-white/[0.08] px-6 py-12 text-center">
                        <div className="text-3xl">🔥</div>
                        <p className="mt-3 text-sm font-medium">
                            The Campfire is quiet...
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            No creators are streaming right now.
                        </p>
                    </div>
                )}

                {exploreStreams.length > 0 && (
                    <StreamGrid streams={exploreStreams} />
                )}
            </section>
        </div>
    );
};

export const ResultsSkeleton = () => {
    return (
        <div className="space-y-10">
            <div className="rounded-2xl border border-white/[0.06] bg-[#111116] px-8 py-10">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-4 h-10 w-96 max-w-full" />
                <Skeleton className="mt-4 h-5 w-[500px] max-w-full" />
            </div>

            <div>
                <Skeleton className="h-7 w-52" />
                <Skeleton className="mt-2 h-4 w-40" />
                <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {[...Array(5)].map((_, i) => (
                        <ResultCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
};