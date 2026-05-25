import { ApiError, NetworkError } from "@/lib/api";
import { PresignedR2UploadError } from "@/lib/listing-photo-upload";

/**
 * Map errors from `uploadOwnerListingPhoto` / `submitPropertyDocumentsVerification`
 * to per-file human messages. Different statuses are different stories: 413 is
 * "your file's too big", 415 is "wrong format", 5xx is "haven is having a bad
 * day". The generic "upload failed" is reserved for truly unknown errors.
 *
 * Note on R2 CORS: when the presigned PUT to R2 fails, the browser only gives
 * us a generic "network error" because CORS preflight rejections hide the
 * underlying response. We assume CORS first because that's the default
 * misconfiguration; a real network drop is rare.
 */
export function describePhotoUploadError(err: unknown, fileName: string): string {
  if (err instanceof PresignedR2UploadError) {
    if (err.likelyCors) {
      return `${fileName}: blocked uploading to R2 (CORS not configured on the bucket for this origin). Ask backend to allow our origin.`;
    }
    if (err.r2Status) {
      return `${fileName}: R2 rejected the file (HTTP ${err.r2Status})`;
    }
    return `${fileName}: ${err.message}`;
  }
  if (err instanceof ApiError) {
    switch (err.status) {
      case 401:
        return `${fileName}: session expired, sign in again`;
      case 403:
        return `${fileName}: not permitted to attach photos here`;
      case 413:
        return `${fileName}: too large, try compressing below ~10 MB`;
      case 415:
        return `${fileName}: unsupported format (use JPG, PNG, or WEBP)`;
      case 422:
        return `${fileName}: ${err.problem?.detail ?? "rejected by haven"}`;
      case 429:
        return `${fileName}: too many uploads at once, try again in a moment`;
      default:
        if (err.status >= 500) {
          return `${fileName}: haven couldn't store this one (status ${err.status})`;
        }
        return `${fileName}: ${err.problem?.detail ?? err.message}`;
    }
  }
  if (err instanceof NetworkError) {
    return `${fileName}: lost connection during upload`;
  }
  if (err instanceof Error) {
    return `${fileName}: ${err.message}`;
  }
  return `${fileName}: upload failed`;
}
