import Link from "next/link";

export async function Footer() {
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
        &copy; {new Date().getFullYear()}
      </div>
    </footer>
  );
}
