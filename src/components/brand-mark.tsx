import Image from "next/image";
import Link from "next/link";

// Icon plus live wordmark: the full logo SVG has a white wordmark that
// disappears on light backgrounds. Colour is inherited from the parent.
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-text ${className}`}
    >
      <Image
        src="/brand/thungatha-icon.svg"
        alt=""
        width={34}
        height={34}
        className="h-[34px] w-auto"
        priority
      />
      <span className="th-wordmark">THUNGATHA</span>
      <span className="sr-only">home</span>
    </Link>
  );
}
