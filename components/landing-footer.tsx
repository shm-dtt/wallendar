import Link from "next/link";

export function Footer() {
  return (
    <footer className="pb-4 text-gray-600">
      made by{" "}
      <Link
        href="https://sohamdutta.in"
        target="_blank"
        className="text-gray-600 hover:text-gray-900"
      >
        [@shm-dtt]
      </Link>{" "}
      with{" "}
      <Link
        href="https://v0.dev"
        target="_blank"
        className="text-gray-600 hover:text-gray-900"
      >
        [v0.dev]
      </Link>
    </footer>
  );
}
