export const dynamic = "force-dynamic";
export const revalidate = 43200;

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

async function GithubButton() {
  const data = await fetch("https://api.github.com/repos/shm-dtt/wallendar", {
    next: { revalidate: 43200 },
  });
  const json = await data.json();
  const stars =
    json.stargazers_count >= 1000
      ? `${(json.stargazers_count / 1000).toFixed(1)}k`
      : json.stargazers_count.toLocaleString();

  return (
    <Link href="https://github.com/shm-dtt/wallendar" target="_blank">
      <Button variant="ghost" className="cursor-pointer">
        <Github aria-hidden="true" />
        <span className="text-muted-foreground text-xs">{stars}</span>
      </Button>
    </Link>
  );
}

export default GithubButton;
