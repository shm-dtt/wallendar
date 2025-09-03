import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="pb-2 flex justify-between items-center">
      <Link href="/">
        <span className="text-xl font-semibold">Wallendar</span>
      </Link>
      <Link href="https://github.com/shm-dtt/wallendar" target="_blank">
        <Button variant="ghost" size="icon" className="size-8 cursor-pointer">
          <Github aria-hidden="true" />
        </Button>
      </Link>
    </header>
  );
}
