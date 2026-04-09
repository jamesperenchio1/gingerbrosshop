import { defineMiddlewares } from "@medusajs/medusa"
import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"
import sharp from "sharp"

const IMAGE_MIMETYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/tiff",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/avif",
  "image/gif",
  "image/bmp",
])

interface UploadedFile {
  buffer: Buffer
  mimetype: string
  originalname: string
  size: number
}

/**
 * Middleware that converts uploaded images to WebP format
 * Runs after multer parses the multipart form data
 */
async function convertImagesToWebP(
  req: MedusaRequest,
  _res: MedusaResponse,
  next: MedusaNextFunction
) {
  try {
    const files = (req as any).files as UploadedFile[] | undefined

    if (!files?.length) {
      return next()
    }

    const convertedFiles = await Promise.all(
      files.map(async (file: UploadedFile) => {
        // Only convert image files
        if (!IMAGE_MIMETYPES.has(file.mimetype.toLowerCase())) {
          return file
        }

        // Already WebP and under 2MB — skip conversion
        if (file.mimetype === "image/webp" && file.buffer.length < 2 * 1024 * 1024) {
          return file
        }

        try {
          const converted = await sharp(file.buffer)
            .webp({ quality: 85, effort: 4 })
            .toBuffer()

          // Replace the file data in-place
          file.buffer = converted
          file.mimetype = "image/webp"
          file.originalname = file.originalname.replace(/\.[^.]+$/, ".webp")
          file.size = converted.length

          return file
        } catch (err) {
          // If conversion fails (corrupt file, etc.), pass through original
          console.warn(`Image conversion failed for ${file.originalname}:`, err)
          return file
        }
      })
    )

    ;(req as any).files = convertedFiles
  } catch (err) {
    console.error("Image conversion middleware error:", err)
  }

  next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/uploads",
      method: "POST",
      middlewares: [convertImagesToWebP],
    },
  ],
})
