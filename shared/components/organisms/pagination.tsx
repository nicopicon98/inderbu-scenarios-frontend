"use client"
import { Button } from "@/shared/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []

    // Always show first page
    pages.push(1)

    // Calculate range around current page
    const rangeStart = Math.max(2, currentPage - 2)
    const rangeEnd = Math.min(totalPages - 1, currentPage + 2)

    // Add ellipsis if needed before range
    if (rangeStart > 2) {
      pages.push("...")
    }

    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i)
    }

    // Add ellipsis if needed after range
    if (rangeEnd < totalPages - 1) {
      pages.push("...")
    }

    // Always show last page if not already included
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      <Button variant="outline" size="sm" disabled={currentPage === 1} className="px-3 border-gray-300" >
        Anterior
      </Button>

      {pageNumbers.map((page, index) =>
        typeof page === "number" ? (
          <Button
            key={index}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            className={`w-8 h-8 p-0 border-gray-300 ${currentPage === page ? "bg-lime-500 hover:bg-lime-600" : ""}`}
          >
            {page}
          </Button>
        ) : (
          <span key={index} className="px-1">
            ...
          </span>
        ),
      )}

      <Button variant="outline" size="sm" disabled={currentPage === totalPages} className="px-3 border-gray-300">
        Siguiente
      </Button>
    </div>
  )
}

