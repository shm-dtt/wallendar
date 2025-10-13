import Link from "next/link";

export function Footer() {
  return (
    <footer className="text-xs text-secondary-foreground/60 text-center">
      made by{" "}
      <Link
        href="https://sohamdutta.in"
        target="_blank"
        className="hover:text-secondary-foreground"
      >
        [soham]
      </Link>
    </footer>
  );
}
