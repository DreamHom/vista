import { api } from "@/lib/api";
import type { PhotoResponse } from "@/lib/owner-dashboard";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function validateListingPhotoFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return "Pick a JPEG, PNG, or WebP under 10 MB.";
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return "Pick a JPEG, PNG, or WebP under 10 MB.";
  }
  return null;
}

interface MintUploadUrlResponse {
  uploadUrl: string;
  fileKey: string;
  expiresAt: string;
  maxSizeBytes: number;
  allowedContentTypes: string[];
}

/**
 * Thrown when the PUT to R2 fails for browser-side reasons (CORS preflight
 * rejection, network drop, status non-2xx from R2). Wraps the underlying cause
 * so callers can render a specific message instead of a generic "upload
 * failed". CORS in particular is a backend/infra config issue, not the user's
 * file, so it deserves its own surface.
 */
export class PresignedR2UploadError extends Error {
  readonly r2Status: number | null;
  readonly likelyCors: boolean;

  constructor(message: string, options: { r2Status?: number | null; likelyCors?: boolean } = {}) {
    super(message);
    this.name = "PresignedR2UploadError";
    this.r2Status = options.r2Status ?? null;
    this.likelyCors = options.likelyCors ?? false;
  }
}

export function putFileToPresignedUrl(
  uploadUrl: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress((event.loaded / event.total) * 100);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new PresignedR2UploadError(`R2 rejected the upload (HTTP ${xhr.status})`, { r2Status: xhr.status }));
    };
    // `xhr.onerror` fires for both CORS-blocked preflights and genuine network
    // drops. We can't distinguish them at this layer, but CORS is by far the
    // most likely cause in production (R2 doesn't allow our origin by default).
    xhr.onerror = () =>
      reject(
        new PresignedR2UploadError(
          "Browser couldn't reach R2 (likely a CORS preflight rejection on the bucket, or a dropped connection)",
          { likelyCors: true },
        ),
      );
    xhr.onabort = () => reject(new PresignedR2UploadError("Upload aborted"));
    xhr.send(file);
  });
}

export async function uploadListingPhotoDirect(
  listingId: number,
  file: File,
  options?: { caption?: string; onProgress?: (pct: number) => void },
): Promise<PhotoResponse> {
  const validation = validateListingPhotoFile(file);
  if (validation) throw new Error(validation);

  const mint = await api.post<MintUploadUrlResponse>(`/listings/${listingId}/photos/upload-url`, {
    contentType: file.type,
    sizeBytes: file.size,
    originalFilename: file.name,
  });

  await putFileToPresignedUrl(mint.uploadUrl, file, options?.onProgress);

  return api.post<PhotoResponse>(`/listings/${listingId}/photos/confirm`, {
    fileKey: mint.fileKey,
    contentType: file.type,
    sizeBytes: file.size,
    caption: options?.caption?.trim() || undefined,
  });
}
