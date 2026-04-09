import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import multer from "multer"
import sharp from "sharp"

interface UploadedFile {
  buffer: Buffer
  mimetype: string
  originalname: string
  size: number
}

const upload = multer({ storage: multer.memoryStorage() })

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

/**
 * Custom upload route that converts images to WebP before saving.
 * Overrides the default Medusa /admin/uploads POST handler.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Manually run multer since we're overriding the default route
  await new Promise<void>((resolve, reject) => {
    upload.array("files")(req as any, res as any, (err: any) => {
      if (err) reject(err)
      else resolve()
    })
  })

  const files = (req as any).files as UploadedFile[]

  if (!files?.length) {
    return res.status(400).json({ message: "No files uploaded" })
  }

  // Convert images to WebP
  const processedFiles = await Promise.all(
    files.map(async (file) => {
      let buffer = file.buffer
      let mimetype = file.mimetype
      let filename = file.originalname

      if (IMAGE_MIMETYPES.has(mimetype.toLowerCase())) {
        // Skip conversion if already WebP and under 2MB
        if (mimetype === "image/webp" && buffer.length < 2 * 1024 * 1024) {
          // keep as-is
        } else {
          try {
            buffer = await sharp(buffer)
              .webp({ quality: 85, effort: 4 })
              .toBuffer()
            mimetype = "image/webp"
            filename = filename.replace(/\.[^.]+$/, ".webp")
          } catch (err) {
            console.warn(`WebP conversion failed for ${filename}, using original:`, err)
          }
        }
      }

      return {
        filename,
        mimeType: mimetype,
        content: buffer.toString("base64"),
        access: "public" as const,
      }
    })
  )

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: { files: processedFiles },
  })

  res.status(200).json({ files: result })
}
