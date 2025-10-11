import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { SupportPopover } from "@/components/misc/support-popover";
import GithubButton from "@/components/misc/github-button";

export function Header() {
  return (
    <header className="pb-2 flex justify-between items-center">
      <Link href="/">
        <span className="text-xl font-semibold">Wallendar</span>
      </Link>
      <div className="flex items-center gap-2">
        <GithubButton />
        <SupportPopover />
        <ModeToggle />
      </div>
    </header>
  );
}
