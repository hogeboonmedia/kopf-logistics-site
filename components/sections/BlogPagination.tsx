import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Numbered pagination for the blog archive. Used on /blog/ (page 1) and on
 * /blog/page/N/ (pages 2+).
 *
 * Page 1 link points to /blog/ (no /page/1/), so URLs stay clean and the
 * canonical landing page never has a paginated URL form.
 *
 * Ellipsis collapsing: when there are more than 7 pages, the middle gets
 * collapsed to "…" so the row stays compact (e.g. `1 … 4 5 6 … 10`).
 *
 * Mobile: horizontal-scrollable so a 10-page row never wraps awkwardly.
 */
export default function BlogPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const pageHref = (n: number) => (n === 1 ? "/blog/" : `/blog/page/${n}/`);

  // Build the visible page-number list with ellipses when totalPages > 7.
  const items: Array<number | "ellipsis"> = [];
  const around = 1; // pages on each side of currentPage to always show
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) items.push(i);
  } else {
    items.push(1);
    if (currentPage - around > 2) items.push("ellipsis");
    const start = Math.max(2, currentPage - around);
    const end = Math.min(totalPages - 1, currentPage + around);
    for (let i = start; i <= end; i++) items.push(i);
    if (currentPage + around < totalPages - 1) items.push("ellipsis");
    items.push(totalPages);
  }

  return (
    <nav
      aria-label="Blog pagination"
      className="mt-14 pt-10"
      style={{ borderTop: "1px solid var(--hairline-strong)" }}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Page-of-page summary — also a screen-reader hint */}
        <div
          className="font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em]"
          style={{ color: "var(--text-concrete)" }}
        >
          Page {currentPage} of {totalPages}
        </div>

        {/* Numbered controls — horizontal scroll on narrow viewports */}
        <ul
          className="flex items-center gap-1 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <li>
            <PaginationButton
              href={hasPrev ? pageHref(currentPage - 1) : undefined}
              ariaLabel="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </PaginationButton>
          </li>

          {items.map((item, idx) =>
            item === "ellipsis" ? (
              <li
                key={`ell-${idx}`}
                className="px-2 font-[var(--font-jetbrains)] text-xs"
                style={{ color: "var(--text-concrete)" }}
                aria-hidden="true"
              >
                …
              </li>
            ) : (
              <li key={item}>
                <PaginationButton
                  href={item === currentPage ? undefined : pageHref(item)}
                  active={item === currentPage}
                  ariaLabel={`Go to page ${item}`}
                  ariaCurrent={item === currentPage ? "page" : undefined}
                >
                  {item}
                </PaginationButton>
              </li>
            ),
          )}

          <li>
            <PaginationButton
              href={hasNext ? pageHref(currentPage + 1) : undefined}
              ariaLabel="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </PaginationButton>
          </li>
        </ul>
      </div>
    </nav>
  );
}

/**
 * Single pagination cell — Link when href is set, disabled span otherwise.
 * Active state uses the orange accent.
 */
function PaginationButton({
  href,
  active,
  ariaLabel,
  ariaCurrent,
  children,
}: {
  href?: string;
  active?: boolean;
  ariaLabel?: string;
  ariaCurrent?: "page";
  children: React.ReactNode;
}) {
  const baseStyle: React.CSSProperties = {
    border: "1px solid var(--hairline-strong)",
    color: "var(--text-muted)",
    background: "transparent",
    minWidth: "2.5rem",
    height: "2.5rem",
  };
  const activeStyle: React.CSSProperties = {
    ...baseStyle,
    border: "1px solid var(--accent)",
    background: "var(--accent)",
    color: "var(--on-accent)",
  };
  const disabledStyle: React.CSSProperties = {
    ...baseStyle,
    opacity: 0.35,
    cursor: "not-allowed",
  };

  const className =
    "inline-grid place-items-center px-3 text-sm font-[var(--font-jetbrains)] tabular-nums transition";

  if (!href) {
    return (
      <span
        className={className}
        style={active ? activeStyle : disabledStyle}
        aria-label={ariaLabel}
        aria-current={ariaCurrent}
        aria-disabled={!active}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`${className} hover:border-[var(--accent)] hover:text-[var(--text)]`}
      style={baseStyle}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
}
