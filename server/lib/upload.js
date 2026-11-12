import path from "node:path";
import multer from "multer";
import { HttpError } from "./errors.js";

const ALLOWED = new Map([
  [".pdf", ["application/pdf"]],
  [".doc", ["application/msword", "application/octet-stream"]],
  [
    ".docx",
    [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream",
    ],
  ],
]);

const INVALID = "Upload your resume as a PDF, DOC or DOCX file.";

/** Multipart parser for a single `resume` file, held in memory and capped in size. */
export function createUpload(maxBytes) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxBytes, files: 1, fields: 20, fieldSize: 20_000, parts: 25 },
    fileFilter(_req, file, callback) {
      const extension = path.extname(file.originalname || "").toLowerCase();
      const mimeTypes = ALLOWED.get(extension);
      if (file.fieldname !== "resume" || !mimeTypes || !mimeTypes.includes(file.mimetype)) {
        return callback(new HttpError(400, "invalid_file_type", INVALID));
      }
      return callback(null, true);
    },
  });
}

const OLE_MAGIC = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);

/**
 * The extension and MIME type come from the client; the bytes do not. Identify
 * the real format from the file signature and return its extension (or null).
 */
export function sniffExtension(buffer) {
  if (!buffer || buffer.length < 8) return null;
  if (buffer.subarray(0, 5).toString("latin1") === "%PDF-") return ".pdf";
  if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) return ".docx";
  if (buffer.subarray(0, 8).equals(OLE_MAGIC)) return ".doc";
  return null;
}

export const INVALID_FILE_MESSAGE = INVALID;
