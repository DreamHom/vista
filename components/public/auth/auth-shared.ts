/** Shared class names for auth surfaces (matches public form shell). */
export const AUTH_INPUT_CHROME = "rounded-none";

export const SIGNUP_SUCCESS_STEPS = [
  "Your account details are saved",
  "Your role and DreamHomes workspace are ready for you",
  "Sign in once to open your dashboard",
] as const;

export function passwordStrengthLabel(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: "Weak", width: "w-1/4", color: "bg-destructive" };
  if (score === 2) return { label: "Fair", width: "w-2/4", color: "bg-amber-500" };
  if (score === 3) return { label: "Good", width: "w-3/4", color: "bg-primary/70" };
  return { label: "Strong", width: "w-full", color: "bg-primary" };
}
