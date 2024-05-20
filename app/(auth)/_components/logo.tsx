import Image from "next/image";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

const font = Poppins({
    subsets:["latin"],
    weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const Logo = () => {
    return (
        <div className="flex flex-col items-center gap-y-4">
            <div className="bg-white rounded-full p-1">
                <Image 
                src="/spooky.svg"
                alt="PlayNexus"
                height="80"
                width="80"
              />
            </div>
            <div className={cn(
                "flex flex-col items-center",
               )}>
                <p className="text-xl font-semibold">
                    PlayNexus
                </p>
                <p className="text-sm text-muted-foreground">
                  Stream your world !  
                </p>
            </div>
        </div>
    );
};