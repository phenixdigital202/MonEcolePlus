"use client"

import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface DocumentPrintContainerProps {
  children: React.ReactNode
  pageSize?: "a5" | "a4"
  orientation?: "portrait" | "landscape"
}

export function DocumentPrintContainer({
  children,
  pageSize = "a4",
  orientation = "portrait"
}: DocumentPrintContainerProps) {
  const [mounted, setMounted] = useState(false)
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setMounted(true)
    let node = document.getElementById("document-print-portal")
    if (!node) {
      node = document.createElement("div")
      node.id = "document-print-portal"
      document.body.appendChild(node)
    }
    setPortalNode(node)

    return () => {
      // Keep node in body for longevity or cleanup if empty
    }
  }, [])

  if (!mounted || !portalNode) {
    return null
  }

  return createPortal(
    <div
      data-page-size={pageSize}
      data-orientation={orientation}
      className={`document-print-wrapper format-${pageSize} ${orientation}`}
    >
      {children}
    </div>,
    portalNode
  )
}
