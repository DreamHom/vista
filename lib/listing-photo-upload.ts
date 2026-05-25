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
      else reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Upload network error"));
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
