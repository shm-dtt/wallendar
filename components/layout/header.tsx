"use client";

import Link from "next/link";
import { Coffee, Copy, DollarSign, Github, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SUPPORT_CONFIG } from "@/lib/support";
import QRCode from "react-qr-code";
import { useState } from "react";
import { ModeToggle } from "../ui/mode-toggle";

export function Header() {
  const [copied, setCopied] = useState(false);
  const upiUrl = `upi://pay?pa=${SUPPORT_CONFIG.UPI_ID}&pn=${encodeURIComponent(
    SUPPORT_CONFIG.PAYEE_NAME
  )}&tn=${encodeURIComponent(SUPPORT_CONFIG.UPI_MSG)}&cu=INR`;

  async function handleCopyUpiId() {
    try {
      await navigator.clipboard.writeText(SUPPORT_CONFIG.UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      // no-op: clipboard may be unavailable; leave button text unchanged
    }
  }

  return (
    <header className="pb-2 flex justify-between items-center">
      <Link href="/">
        <span className="text-xl font-semibold">Wallendar</span>
      </Link>
      <div className="flex items-center gap-2">
        <Link href="https://github.com/shm-dtt/wallendar" target="_blank">
          <Button variant="outline" className="cursor-pointer">
            <Github aria-hidden="true" />4
          </Button>
        </Link>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer text-red-500 hover:text-red-500"
            >
              <Heart aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-2">
            <p className="text-sm mb-2">
              Support the project :)
            </p>
            <Link href={SUPPORT_CONFIG.PAYPAL_URL} target="_blank">
              <Button className="w-full cursor-pointer">
                <DollarSign aria-hidden="true" />
                Paypal
              </Button>
            </Link>
            <Link href={SUPPORT_CONFIG.BUY_ME_COFFEE_URL} target="_blank">
              <Button className="w-full cursor-pointer" >
                <Coffee aria-hidden="true" className="text-brown-500 " />
                Buy me a coffee
              </Button>
            </Link>
            <div className="flex justify-center items-center flex-col">
              <p className="text-sm mb-2">
                Scan to pay with any UPI app
              </p>
              <div className="flex justify-center items-center bg-white p-1">
                <QRCode value={upiUrl} size={120} bgColor="#fff" fgColor="#222" />
              </div>

              <p className="text-sm mb-2">or</p>
              <Button onClick={handleCopyUpiId} className="w-full cursor-pointer">
                <Copy aria-hidden="true" />
                {copied ? "Copied!" : "Copy UPI ID"}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <ModeToggle />
      </div>
    </header>
  );
}
