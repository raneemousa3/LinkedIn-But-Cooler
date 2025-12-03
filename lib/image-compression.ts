/**
 * Client-side image compression utility
 * Compresses images before upload to reduce file size and prevent HTTP 431 errors
 */

/**
 * Compress an image file using Canvas API
 * @param file - The image file to compress
 * @param maxWidth - Maximum width in pixels (default: 1920)
 * @param maxHeight - Maximum height in pixels (default: 1920)
 * @param quality - Compression quality 0-1 (default: 0.8)
 * @returns Promise<File> - Compressed image file
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      reject(new Error("File must be an image"))
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height

          if (width > height) {
            width = maxWidth
            height = width / aspectRatio
          } else {
            height = maxHeight
            width = height * aspectRatio
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Failed to get canvas context"))
          return
        }

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"))
              return
            }

            // Create new File object with original name
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })

            resolve(compressedFile)
          },
          file.type,
          quality
        )
      }

      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }

      // Set image source
      if (typeof e.target?.result === "string") {
        img.src = e.target.result
      } else {
        reject(new Error("Failed to read file"))
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    // Read file as data URL
    reader.readAsDataURL(file)
  })
}

