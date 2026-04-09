import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { execFileSync } from "child_process"
import { writeFileSync, readFileSync, unlinkSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"
import sharp from "sharp"

interface UploadedFile {
  buffer: Buffer
  mimetype: string
  originalname: string
  size: number
}

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

const HEIC_MIMETYPES = new Set(["image/heic", "image/heif"])

/**
 * Convert HEIC/HEIF buffer to JPEG buffer using heif-convert CLI tool,
 * since sharp's bundled libvips doesn't include the HEIC decoder.
 */
function heicToJpeg(buffer: Buffer): Buffer {
  const tmp = join(tmpdir(), `heic-${Date.now()}`)
  const inputPath = `${tmp}.heic`
  const outputPath = `${tmp}.jpg`
  try {
    writeFileSync(inputPath, buffer)
    execFileSync("heif-convert", [inputPath, outputPath], { timeout: 30000 })
    return readFileSync(outputPath)
  } finally {
    try { unlinkSync(inputPath) } catch {}
    try { unlinkSync(outputPath) } catch {}
  }
}

/**
 * Custom upload route that converts images to WebP before saving.
 * Overrides the default Medusa /admin/uploads POST handler.
 * Medusa's default middleware already runs multer, so req.files is populated.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const files = (req as any).files as UploadedFile[]

  if (!files?.length) {
    return res.status(400).json({ message: "No files uploaded" })
  }

  const processedFiles = await Promise.all(
    files.map(async (file) => {
      let buffer = file.buffer
      let mimetype = file.mimetype
      let filename = file.originalname

      if (IMAGE_MIMETYPES.has(mimetype.toLowerCase())) {
        if (mimetype === "image/webp" && buffer.length < 2 * 1024 * 1024) {
          // Already WebP and small enough — keep as-is
        } else {
          try {
            // HEIC/HEIF needs a two-step conversion: heif-convert -> JPEG, then sharp -> WebP
            if (HEIC_MIMETYPES.has(mimetype.toLowerCase())) {
              buffer = heicToJpeg(buffer)
            }
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
