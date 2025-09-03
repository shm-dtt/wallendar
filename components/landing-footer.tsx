import Link from "next/link";

export function Footer() {
  return (
    <footer className="pb-4 text-xs text-gray-600">
      made by{" "}
      <Link
        href="https://sohamdutta.in"
        target="_blank"
        className="text-gray-600 hover:text-gray-900 underline"
      >
        @shm-dtt
      </Link>{" "}
      with{" "}
      <Link
        href="https://v0.dev"
        target="_blank"
        className="text-gray-600 hover:text-gray-900 underline"
      >
        v0.dev
      </Link>
    </footer>
  );
}
