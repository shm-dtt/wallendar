import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { SupportPopover } from "@/components/misc/support-popover";
import GithubButton from "@/components/misc/github-button";
import { Button } from "../ui/button";
import Image from "next/image";

export function Header() {
  return (
    <header className="pb-2 flex justify-between items-center">
      <Link href="/">
        <Button
          variant="ghost"
          size="icon-sm"
           className="cursor-pointer"
        >
          <Image src="/favicon.ico" alt="Wallendar" width={50} height={50} />
        </Button>
      </Link>
      <div className="flex items-center gap-2">
        <GithubButton />
        <SupportPopover />
        <ModeToggle />
      </div>
    </header>
  );
}
