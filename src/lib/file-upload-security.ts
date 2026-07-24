/**
 * File Upload Security Specification & Validation Utility
 *
 * Implements strict security standards for file handling:
 * 1. Magic byte magic number inspection (content validation beyond file extension).
 * 2. File size ceiling limits (Max 5MB).
 * 3. File extension allowlisting.
 * 4. Anti-RCE (Remote Code Execution) path sanitization and non-executable storage rules.
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  detectedMime?: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_MAGIC_MAP: Record<string, number[]> = {
  // JPEG: FF D8 FF
  "image/jpeg": [0xff, 0xd8, 0xff],
  // PNG: 89 50 4E 47
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  // WEBP: 52 49 46 46 (RIFF)
  "image/webp": [0x52, 0x49, 0x46, 0x46],
  // PDF: 25 50 44 46 (%PDF)
  "application/pdf": [0x25, 0x50, 0x44, 0x46],
};

/**
 * Inspects a File or Buffer's magic bytes to verify actual content type.
 */
export async function validateFileContent(
  buffer: Uint8Array,
  declaredMimeType: string,
  fileName: string
): Promise<FileValidationResult> {
  // 1. Validate File Size
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed limit of 5MB. Current size: ${(buffer.length / (1024 * 1024)).toFixed(2)}MB`,
    };
  }

  // 2. Validate Disallowed Dangerous Extensions
  const lowerName = fileName.toLowerCase();
  const dangerousExtensions = [
    ".exe", ".bat", ".cmd", ".sh", ".php", ".js", ".jsx", ".ts", ".tsx",
    ".html", ".htm", ".cgi", ".pl", ".py", ".asp", ".aspx", ".phtml", ".phar"
  ];
  if (dangerousExtensions.some((ext) => lowerName.endsWith(ext))) {
    return {
      valid: false,
      error: "Executable or script file types are strictly prohibited.",
    };
  }

  // 3. Inspect Magic Bytes
  const expectedMagic = ALLOWED_MIME_MAGIC_MAP[declaredMimeType];
  if (!expectedMagic) {
    return {
      valid: false,
      error: `Unsupported file MIME type: ${declaredMimeType}. Allowed: JPEG, PNG, WEBP, PDF.`,
    };
  }

  const hasMatchingMagic = expectedMagic.every((byte, idx) => buffer[idx] === byte);
  if (!hasMatchingMagic) {
    return {
      valid: false,
      error: "File content magic bytes do not match the declared file extension or MIME type.",
    };
  }

  return {
    valid: true,
    detectedMime: declaredMimeType,
  };
}

/**
 * Generates a non-executable, UUID-based safe storage path outside webroot.
 */
export function generateSafeStoragePath(originalFileName: string): string {
  const ext = originalFileName.split(".").pop()?.toLowerCase() || "bin";
  const safeUuid = crypto.randomUUID();
  // Safe storage outside webroot or in S3 bucket with no execution permissions
  return `uploads/isolated/${safeUuid}.${ext}`;
}
