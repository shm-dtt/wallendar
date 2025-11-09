"use client";

import { LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { signOut } from "@/lib/actions/auth-actions";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
type Session = typeof auth.$Infer.Session;

export function UserMenu({ session }: { session: Session }) {
  const user = session?.user;
  const router = useRouter();
  const handleSignOut = async () => {
    await signOut();
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
    <Button
      variant="ghost"
      size="icon-sm"
      className="cursor-pointer"
      onClick={() => router.push("/auth")}
    >
      <LogIn className="h-5 w-5" />
    </Button>
  );
}
