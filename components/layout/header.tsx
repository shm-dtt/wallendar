import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import GithubButton from "@/components/misc/github-stars";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { SideMenu } from "@/components/layout/side-menu";
import { UserMenu } from "@/components/layout/user-menu";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type Session = typeof auth.$Infer.Session;

export async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="pb-2 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <SideMenu />
        <Link href="/">
          <Button variant="ghost" size="icon-sm" className="cursor-pointer">
            <Image src="/favicon.ico" alt="Wallendar" width={50} height={50} />
          </Button>
        </Link>
      </div>
      <div className="flex items-center gap-1 h-5 ">
        <GithubButton />
        <Separator orientation="vertical" />
        <UserMenu session={session as Session} />
        <Separator orientation="vertical" />
        <ModeToggle />
      </div>
    </header>
  );
}
