"use client";

import { useState } from "react";
import { CircleX, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { signOut, signInSocial } from "@/lib/actions/auth-actions";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
type Session = typeof auth.$Infer.Session;

export function UserMenu({ session }: { session: Session }) {
  const user = session?.user;
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  const handleSocialAuth = async (provider: "google" | "github") => {
    setIsLoading(true);

    try {
      // Use current pathname as callback URL to stay on the same page after login
      await signInSocial(provider, pathname);
    } catch (err) {
      toast.error(
        `Error authenticating with ${provider}. ${
          err instanceof Error ? err.message : "Unknown error"
        } Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return session ? (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="cursor-pointer">
          {user?.image ? (
            <img
              src={user?.image}
              alt={user?.name || "User"}
              className="h-5 w-5 rounded-full"
            />
          ) : (
            <User className="h-5 w-5" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {user?.image ? (
              <img
                src={user?.image}
                alt={user?.name || "User"}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
            )}
            <div className="flex flex-col flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <Separator />
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ) : (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="cursor-pointer">
          <LogIn className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-1">Welcome Back</h2>
            <p className="text-sm ">Sign in to your account to continue</p>
          </div>

          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => handleSocialAuth("google")}
              disabled={isLoading}
              variant="default"
              className="flex items-center justify-center"
            >
              Google
            </Button>

            <Button
              onClick={() => handleSocialAuth("github")}
              disabled={isLoading}
              variant="default"
              className="flex items-center justify-center"
            >
              GitHub
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
