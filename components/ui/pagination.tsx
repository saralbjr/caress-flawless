"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  baseUrl: string;
}

export function Pagination({ totalPages, currentPage, baseUrl }: PaginationProps) {
  // Generate page range with ellipsis
  const generatePageRange = () => {
    const range = [];
    const maxVisiblePages = 5;
    
    // Always show first page
    range.push(1);
    
    if (totalPages <= maxVisiblePages) {
      // If there are fewer pages than max visible, show all
      for (let i = 2; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      // Show pages with ellipsis for large page counts
      if (currentPage > 3) {
        range.push("ellipsis-start");
      }
      
      // Pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        range.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        range.push("ellipsis-end");
      }
      
      // Always show last page if more than 1 page
      if (totalPages > 1) {
        range.push(totalPages);
      }
    }
    
    return range;
  };

  const pageRange = generatePageRange();
  
  // Create URL with page parameter
  const getPageUrl = (page: number) => {
    // Check if baseUrl already has query parameters
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}page=${page}`;
  };

  return (
    <nav className="mx-auto flex w-full justify-center">
      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <PaginationLink
          href={currentPage > 1 ? getPageUrl(currentPage - 1) : "#"}
          disabled={currentPage <= 1}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous</span>
        </PaginationLink>
        
        {/* Page numbers */}
        {pageRange.map((page, index) => {
          if (page === "ellipsis-start" || page === "ellipsis-end") {
            return (
              <div
                key={`ellipsis-${index}`}
                className="flex h-10 w-10 items-center justify-center"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More pages</span>
              </div>
            );
          }
          
          return (
            <PaginationLink
              key={`page-${page}`}
              href={getPageUrl(page as number)}
              isActive={page === currentPage}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </PaginationLink>
          );
        })}
        
        {/* Next button */}
        <PaginationLink
          href={currentPage < totalPages ? getPageUrl(currentPage + 1) : "#"}
          disabled={currentPage >= totalPages}
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next</span>
        </PaginationLink>
      </div>
    </nav>
  );
}

interface PaginationLinkProps extends ButtonProps {
  href: string;
  isActive?: boolean;
  disabled?: boolean;
}

function PaginationLink({
  href,
  children,
  isActive,
  disabled,
  className,
  ...props
}: PaginationLinkProps) {
  if (disabled) {
    return (
      <div
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-10 w-10 cursor-not-allowed opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
  
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: isActive ? "default" : "outline", size: "icon" }),
        "h-10 w-10",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}