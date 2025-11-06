import { Pickaxe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Header } from "@/components/layout/header";

export default function Community() {
  return (
    <main className="font-sans">
      <div className="p-4 md:p-6">
        <Header />
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Pickaxe />
            </EmptyMedia>
            <EmptyTitle className="text-2xl font-bold font-sans">
              Community Wallpapers
            </EmptyTitle>
            <EmptyDescription>
              Share your wallpapers with the community and get inspired by
              others.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex flex-col gap-12">
              <p className="text-lg font-bold font-sans">Coming Soon...</p>
              <Link href="/create">
                <Button variant="default">Create Your Own</Button>
              </Link>
            </div>
          </EmptyContent>
        </Empty>
      </div>
    </main>
  );
}
