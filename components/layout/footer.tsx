import Link from "next/link";
import { getCachedDownloadCount } from "@/lib/redis";

export async function Footer() {
  const downloadCount = await getCachedDownloadCount();
  return (
    <footer className="text-xs text-secondary-foreground/60 flex justify-between">
      <div>
        made by{" "}
        <Link
          href="https://sohamdutta.in"
          target="_blank"
          className="hover:text-secondary-foreground"
        >
          [soham]
        </Link>
      </div>
      <div>
        {downloadCount.toLocaleString()} downloads
      </div>
    </footer>
  );
}
