import Link from "next/link";

export function Footer() {
  return (
    <footer className="pb-4 text-secondary-foreground/60">
      made by{" "}
      <Link
        href="https://sohamdutta.in"
        target="_blank"
        className="hover:text-secondary-foreground"
      >
        [@shm-dtt]
      </Link>{" "}
      with{" "}
      <Link
        href="https://v0.app"
        target="_blank"
        className="hover:text-secondary-foreground"
      >
        [v0.app]
      </Link>
    </footer>
  );
}
