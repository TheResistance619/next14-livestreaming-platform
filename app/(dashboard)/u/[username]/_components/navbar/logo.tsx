import Link from "next/link";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

const font = Poppins({
    subsets: ["latin"],
    weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const Logo = () => {
    return (
        <Link href="/">
            <div className="flex items-center gap-x-3 hover:opacity-80 transition">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/10 border border-orange-500/20 shrink-0">
                    <svg
                        viewBox="0 0 24 24"
                        className="h-6 w-6 text-orange-500"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path d="M12.8 2.2c.3 3.1-1.2 4.8-2.8 6.2-1.3 1.1-2.5 2.2-2.5 4.5 0 1.4.5 2.6 1.4 3.5-.1-1.9 1-3.1 2.3-4.2 1.1-.9 2.1-1.8 2.1-3.6 2.3 1.9 3.7 4.1 3.7 6.8 0 1.1-.3 2.2-.8 3.1 2.3-1 3.8-3.2 3.8-5.8 0-4.5-3.1-8-7.2-10.5Z" />
                        <path d="M7.4 17.1c-.4.5-.6 1.1-.6 1.8 0 1.9 1.8 3.2 5.2 3.2s5.2-1.3 5.2-3.2c0-.4-.1-.8-.2-1.2-.8 1.2-2.2 2-3.8 2-2.4 0-4.4-1.1-5.8-2.6-1.4Z" />
                    </svg>
                </div>

                <div
                    className={cn(
                        "hidden lg:block",
                        font.className
                    )}
                >
                    <p className="text-lg font-semibold">
                        Campfire
                    </p>

                    <p className="text-xs text-muted-foreground">
                        Creator dashboard
                    </p>
                </div>
            </div>
        </Link>
    );
};