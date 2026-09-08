/**
 * Compresses an image file (e.g. from file input) using HTML Canvas.
 * Resizes large image files (up to 15MB) to max 500x500px JPEG quality 0.85,
 * producing a tiny Base64 payload (~30KB-60KB) that uploads instantaneously over Server Actions.
 */
export function compressImage(file: File, maxWidth = 500, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height)
            height = maxWidth
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          return resolve(event.target?.result as string)
        }

        ctx.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality)
        resolve(compressedDataUrl)
      }
      img.onerror = (err) => resolve(event.target?.result as string)
    }
    reader.onerror = (err) => reject(err)
  })
}
