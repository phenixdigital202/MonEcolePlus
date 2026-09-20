"use client"

/**
 * Downloads a DOM element directly as a clean PDF file using html2pdf.js.
 * Uses bundled html2pdf.js with fallback to guarantee offline & CDN-independent PDF generation.
 */
export async function downloadDocumentAsPdf({
  elementId,
  filename,
  format = "a4",
  orientation = "portrait"
}: {
  elementId: string
  filename: string
  format?: "a5" | "a4" | "letter"
  orientation?: "portrait" | "landscape"
}) {
  if (typeof window === "undefined") return false

  const element = document.getElementById(elementId)
  if (!element) {
    console.error(`[downloadDocumentAsPdf] Element #${elementId} not found in DOM`)
    return false
  }

  let html2pdfModule: any = (window as any).html2pdf
  if (!html2pdfModule) {
    try {
      const mod = await import("html2pdf.js")
      html2pdfModule = mod.default || mod
    } catch (importErr) {
      console.warn("[downloadDocumentAsPdf] Dynamic import of html2pdf.js failed, trying script injection:", importErr)
      try {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script")
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
          script.onload = () => resolve()
          script.onerror = (e) => reject(e)
          document.body.appendChild(script)
        })
        html2pdfModule = (window as any).html2pdf
      } catch (err) {
        console.error("[downloadDocumentAsPdf] Failed to load html2pdf script:", err)
        return false
      }
    }
  }

  if (!html2pdfModule) {
    console.error("[downloadDocumentAsPdf] html2pdf module unavailable")
    return false
  }

  const cleanFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`

  const options = {
    margin: [4, 4, 4, 4],
    filename: cleanFilename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowWidth: format === "a5" ? 600 : 800
    },
    jsPDF: {
      unit: "mm",
      format: format,
      orientation: orientation,
      compress: true
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] }
  }

  try {
    await html2pdfModule().set(options).from(element).save()
    return true
  } catch (error) {
    console.error("[downloadDocumentAsPdf] Error generating PDF:", error)
    return false
  }
}

