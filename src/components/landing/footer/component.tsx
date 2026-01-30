"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        {/* Disclaimer Section */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
            Disclaimer
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This betting platform is for entertainment purposes only. Please bet
            responsibly and within your means. Users must be of legal age to
            participate. The platform reserves the right to modify or cancel
            bets if necessary. Past performance does not guarantee future
            results.
          </p>
        </div>

        <Separator className="mb-8" />

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">Shoroot</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            {/* <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms & Conditions
            </Link> */}
            <Link
              href="/auth/signup"
              className="hover:text-foreground transition-colors"
            >
              Sign Up
            </Link>
            <Link
              href="/auth/login"
              className="hover:text-foreground transition-colors"
            >
              Login
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            © {currentYear} Shoroot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
