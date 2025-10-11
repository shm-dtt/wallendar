import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

function GithubButton() {
  async function StarsCount() {
    const data = await fetch("https://api.github.com/repos/shm-dtt/wallendar", {
      next: { revalidate: 86400 }, // Cache for 1 day (86400 seconds)
    });
    const json = await data.json();
    return json.stargazers_count >= 1000
      ? `${(json.stargazers_count / 1000).toFixed(1)}k`
      : json.stargazers_count.toLocaleString();
  }

  return (
    <Link href="https://github.com/shm-dtt/wallendar" target="_blank">
      <Button variant="outline" className="cursor-pointer">
        <Github aria-hidden="true" /> 
        <span className="text-muted-foreground text-xs">
          {StarsCount()}
        </span>
      </Button>
    </Link>
  );
}

export default GithubButton;
