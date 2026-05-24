import { ApiError, NetworkError } from "@/lib/api";
import type { ProblemDetail } from "@/lib/types";

function fieldErrorsFromProblem(problem: ProblemDetail | null): string[] {
  if (!problem) return [];

  const errors = problem.errors;
  if (errors && typeof errors === "object" && !Array.isArray(errors)) {
    return Object.entries(errors as Record<string, unknown>).flatMap(([field, value]) => {
      if (typeof value === "string") return [`${field}: ${value}`];
      if (Array.isArray(value)) {
        return value.filter((v): v is string => typeof v === "string").map((v) => `${field}: ${v}`);
      }
      return [];
    });
  }

  const violations = problem.violations;
  if (Array.isArray(violations)) {
    return violations
      .map((v) => {
        if (!v || typeof v !== "object") return null;
        const row = v as Record<string, unknown>;
        const field = typeof row.field === "string" ? row.field : typeof row.propertyPath === "string" ? row.propertyPath : null;
        const message = typeof row.message === "string" ? row.message : null;
        if (field && message) return `${field}: ${message}`;
        return message;
      })
      .filter((line): line is string => Boolean(line));
  }

  return [];
}

/** Human-readable copy for inline forms and {@link toast.error}. */
export function apiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof ApiError) {
    const fields = fieldErrorsFromProblem(error.problem);
    if (fields.length > 0) {
      return fields.join(" ");
    }

    const detail = error.problem?.detail?.trim();
    if (detail) return detail;

    const title = error.problem?.title?.trim();
    if (title && title.toLowerCase() !== "forbidden") return title;

    if (error.status === 403) {
      return "Access was denied (403). If this keeps happening, a firewall may be blocking the request before it reaches our API.";
    }

    if (error.status === 429) {
      const retry = error.problem?.retryAfterSeconds;
      if (typeof retry === "number" && retry > 0) {
        return `Too many attempts. Try again in about ${retry} seconds.`;
      }
      return "Too many attempts. Please wait a moment and try again.";
    }

    if (error.status === 409) {
      return "This record changed or can't move to that state. Refresh and try again.";
    }

    if (error.message && error.message !== "Forbidden") {
      return error.message;
    }

    return fallback;
  }

  if (error instanceof NetworkError) {
    return "We could not reach the server. Check your connection and try again.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
