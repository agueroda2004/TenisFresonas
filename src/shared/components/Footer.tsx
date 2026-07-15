interface FooterProps {
  maxWidthClass?: string;
}

export function Footer({ maxWidthClass = "max-w-3xl lg:max-w-6xl" }: FooterProps) {
  return (
    <footer className="mt-12 border-t border-border bg-background sm:mt-16">
      <div
        className={`mx-auto flex flex-col items-center gap-2 px-4 py-6 text-center sm:px-6 ${maxWidthClass}`}
      >
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Catálogo desarrollado por{" "}
          <span className="text-foreground">Daniel Aguero</span>
        </p>
        <a
          href="https://www.agueroda.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-foreground transition hover:text-primary active:scale-95"
        >
          agueroda.dev
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="h-3 w-3"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.22 14.78a.75.75 0 010-1.06l7.22-7.22H8.75a.75.75 0 010-1.5h5.5a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0V6.56l-7.22 7.22a.75.75 0 01-1.06 0z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </div>
    </footer>
  );
}