import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { announcementInfo } from "@/lib/utils";

const AnnouncementBanner = () => {
  return (
    <Link href={announcementInfo.link} className="w-fit mb-12">
      <Button
        variant="outline"
        className="rounded-full cursor-pointer text-xs shadow-md"
        size="sm"
      >
        <span className="w-2 h-2 bg-[#00A000] rounded-full animate-pulse">
        </span>
        <span>{announcementInfo.title}</span>
        <ArrowRight aria-hidden="true" />
      </Button>
    </Link>
  );
};

export default AnnouncementBanner;
