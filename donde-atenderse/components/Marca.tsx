import Link from "next/link";

export function Marca() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 text-ink">
      <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" className="shrink-0">
        <circle cx="18" cy="18" r="18" fill="#14b5a8" />
        <path d="M18 9.5v17M9.5 18h17" stroke="white" strokeWidth="3.4" strokeLinecap="round" />
      </svg>
      <span className="text-[1.45rem] font-bold leading-none tracking-[-0.045em]">cercalud</span>
    </Link>
  );
}
