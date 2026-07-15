interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalItems === 0) return null;

  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const isFirst = safeCurrentPage <= 1;
  const isLast = safeCurrentPage >= totalPages;
  const start = (safeCurrentPage - 1) * pageSize + 1;
  const end = Math.min(safeCurrentPage * pageSize, totalItems);

  function goPrev() {
    if (isFirst) return;
    onPageChange(safeCurrentPage - 1);
  }

  function goNext() {
    if (isLast) return;
    onPageChange(safeCurrentPage + 1);
  }

  return (
    <nav
      aria-label="Paginación de productos"
      className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Mostrando {start}–{end} de {totalItems}
      </p>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground sm:text-center">
          Página {safeCurrentPage} de {totalPages}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={isFirst}
            aria-label="Página anterior"
            className="flex h-10 flex-1 items-center justify-center gap-2 border border-foreground bg-background px-4 text-xs font-bold uppercase tracking-wider text-foreground transition hover:bg-muted active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
          >
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="h-3 w-3"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.79 5.23a.75.75 0 010 1.06L9.06 10l3.73 3.71a.75.75 0 11-1.06 1.06l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0z"
                clipRule="evenodd"
              />
            </svg>
            Anterior
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={isLast}
            aria-label="Página siguiente"
            className="flex h-10 flex-1 items-center justify-center gap-2 border border-foreground bg-foreground px-4 text-xs font-bold uppercase tracking-wider text-background transition hover:bg-primary hover:border-primary hover:text-primary-foreground active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
          >
            Siguiente
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="h-3 w-3"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 010-1.06L10.94 10 7.21 6.29a.75.75 0 111.06-1.06l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}