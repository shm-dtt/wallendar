"use client";

import { Coffee, Copy, DollarSign, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SUPPORT_CONFIG } from "@/lib/support";
import QRCode from "react-qr-code";
import { useState } from "react";

export function SupportPopover() {
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
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="lg"
          className="cursor-pointer text-red-500 hover:text-red-500 size-10"
        >
          <Heart aria-hidden="true" fill="currentColor" className="size-5"/>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2">
        <p className="text-sm mb-2">Support the project :)</p>
        <a href={SUPPORT_CONFIG.PAYPAL_URL} target="_blank" rel="noopener noreferrer">
          <Button className="w-full cursor-pointer">
            <DollarSign aria-hidden="true" />
            Paypal
          </Button>
        </a>
        <a href={SUPPORT_CONFIG.BUY_ME_COFFEE_URL} target="_blank" rel="noopener noreferrer">
          <Button className="w-full cursor-pointer">
            <Coffee aria-hidden="true" className="text-brown-500" />
            Buy me a coffee
          </Button>
        </a>
        <div className="flex justify-center items-center flex-col">
          <p className="text-sm mb-2">Scan to pay with any UPI app</p>
          <div className="flex justify-center items-center bg-white p-1">
            <QRCode
              value={upiUrl}
              size={120}
              bgColor="#fff"
              fgColor="#222"
            />
          </div>

          <p className="text-sm mb-2">or</p>
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleCopyUpiId();
            }}
            className="w-full cursor-pointer"
          >
            <Copy aria-hidden="true" />
            {copied ? "Copied!" : "Copy UPI ID"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
