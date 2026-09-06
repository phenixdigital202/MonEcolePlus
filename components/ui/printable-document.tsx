"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface PrintableDocumentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

/**
 * PrintableDocument wrapper component.
 * Wraps official documents (bulletins, certificates, report cards) 
 * ensuring strict CSS print isolation, page break handling, and standard A4 dimensions.
 */
export function PrintableDocument({ children, className, ...props }: PrintableDocumentProps) {
  return (
    <div
      id="printable-document"
      className={cn(
        "printable-area w-full mx-auto bg-white print:bg-white print:p-0 print:m-0 print:shadow-none print:w-full print:max-w-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
