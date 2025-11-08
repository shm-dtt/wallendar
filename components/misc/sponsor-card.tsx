import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Github, Twitter, Globe } from "lucide-react";

export interface Sponsor {
  id: string;
  name: string;
  avatar?: string;
  amount: number;
  isRecurring: boolean;
  links?: {
    github?: string;
    twitter?: string;
    website?: string;
  };
}

interface SponsorCardProps {
  sponsor: Sponsor;
}

export function SponsorCard({ sponsor }: SponsorCardProps) {
  const initials = sponsor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={sponsor.avatar} alt={sponsor.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-card-foreground">
              {sponsor.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {sponsor.isRecurring ? "Recurring" : "One-time"}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 pb-4 border-b border-border">
        <p className="text-2xl font-bold text-primary">
          ₹{sponsor.amount.toFixed(2)}
        </p>
      </div>

      {sponsor.links && Object.keys(sponsor.links).length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {sponsor.links.github && (
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <a
                href={sponsor.links.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
              >
                <Github className="h-4 w-4" />{" "}
                {sponsor.links.github.split("/").pop()}
              </a>
            </Button>
          )}
          {sponsor.links.twitter && (
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <a
                href={sponsor.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter profile"
              >
                <svg
                  width="1200"
                  height="1227"
                  viewBox="0 0 1200 1227"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"
                    fill="currentColor"
                  />
                </svg>{" "}
                {sponsor.links.twitter.split("/").pop()}
              </a>
            </Button>
          )}
          {sponsor.links.website && (
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <a
                href={sponsor.links.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Personal website"
              >
                <Globe className="h-4 w-4" />{" "}
                {sponsor.links.website.split("/").pop()}
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
