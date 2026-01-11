/**
 * Sanitizes a filename to prevent directory traversal and ensure safe S3 keys.
 * 
 * Rules:
 * 1. Removes any sequence of dots (..) to prevent directory traversal
 * 2. Replaces non-alphanumeric characters (except . _ -) with underscores
 * 3. Truncates to 100 characters max
 * 4. Ensures the filename is not empty
 * 
 * @param filename - The raw filename from user input
 * @returns A safe, sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== "string") {
    return "wallpaper.png";
  }

  // 1. Remove leading/trailing whitespace
  let sanitized = filename.trim();

  // 2. Remove directory traversal sequences (../, ..\, etc.) and any path separators
  //    We replace them with underscores to break the path structure.
  sanitized = sanitized.replace(/(\.\.[\/\\])+/g, "_"); // Remove ../ ..\
  sanitized = sanitized.replace(/[\/\\]/g, "_"); // Remove / and \

  // 3. Keep only alphanumeric, dots, underscores, and hyphens
  //    This whitelist approach is safer than blacklisting.
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, "_");

  // 4. Remove multiple consecutive dots or underscores to keep it clean
  sanitized = sanitized.replace(/\.{2,}/g, ".");
  sanitized = sanitized.replace(/_{2,}/g, "_");

  // 5. Ensure it doesn't start with a dot (hidden file)
  sanitized = sanitized.replace(/^\.+/, "");

  // 6. Truncate to reasonable length (S3 limit is 1024, but 100 is safe for us)
  if (sanitized.length > 100) {
    const extIndex = sanitized.lastIndexOf(".");
    if (extIndex > -1 && extIndex > sanitized.length - 10) {
      // Keep extension if possible
      const ext = sanitized.substring(extIndex);
      sanitized = sanitized.substring(0, 100 - ext.length) + ext;
    } else {
      sanitized = sanitized.substring(0, 100);
    }
  }

  // 7. Final fallback if sanitization stripped everything
  if (!sanitized || sanitized === "." || sanitized === "..") {
    return `wallpaper-${Date.now()}.png`;
  }

  return sanitized;
}
