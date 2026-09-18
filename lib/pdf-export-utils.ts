"use client"

/**
 * Downloads a DOM element directly as a clean PDF file using html2pdf.js.
 * This guarantees ZERO browser headers, ZERO footers, ZERO Vercel URLs.
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
  if (typeof window === "undefined") return

  const element = document.getElementById(elementId)
  if (!element) {
    console.error(`[downloadDocumentAsPdf] Element #${elementId} not found in DOM`)
    return false
  }

  // Load html2pdf dynamically from cdnjs if not present on window
  if (!(window as any).html2pdf) {
    try {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script")
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
        script.onload = () => resolve()
        script.onerror = (e) => reject(e)
        document.body.appendChild(script)
      })
    } catch (err) {
      console.error("[downloadDocumentAsPdf] Failed to load html2pdf script:", err)
      return false
    }
  }

  const cleanFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`

  // Options optimized for high resolution crisp text and exact paper boundaries
  const options = {
    margin: [6, 6, 6, 6], // 6mm margins
    filename: cleanFilename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2.5, // Crisp retina quality rendering
      useCORS: true,
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
    await (window as any).html2pdf().set(options).from(element).save()
    return true
  } catch (error) {
    console.error("[downloadDocumentAsPdf] Error generating PDF:", error)
    return false
  }
}
