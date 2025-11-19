import { Header } from "@/components/layout/header";
import { SponsorCard } from "@/components/misc/sponsor-card";
import { Instrument_Serif } from "next/font/google";
import { sponsors } from "@/lib/sponsors";
import { SupportPopover } from "@/components/misc/support-popover";
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
});

export default function Sponsors() {
  const totalAmount = sponsors.reduce(
    (sum, sponsor) => sum + sponsor.amount,
    0
  );
  const recurringAmount = sponsors
    .filter((s) => s.isRecurring)
    .reduce((sum, sponsor) => sum + sponsor.amount, 0);
  return (
    <main className="font-sans min-h-dvh">
      <div className="p-4 md:p-6">
        <Header />
        <div className="my-6 text-center space-y-4 ">
          <h1 className={`text-4xl ${instrumentSerif.className}`}>
            Our Sponsors
          </h1>
          <p className=" text-secondary-foreground/60">
            Thank you to our amazing supporters!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Raised</p>
            <p className="text-xl font-bold text-primary">
              ₹{totalAmount.toFixed(2)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Monthly Recurring
            </p>
            <p className="text-xl font-bold text-primary">
              ₹{recurringAmount.toFixed(2)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Sponsors</p>
            <p className="text-xl font-bold text-primary">{sponsors.length}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sponsors.slice(0, 12).map((sponsor) => (
            <SponsorCard key={sponsor.id} sponsor={sponsor} />
          ))}
        </div>
      </div><div className="fixed bottom-6 right-6">
        <SupportPopover variant="secondary"/>
      </div>
    </main>
  );
}
