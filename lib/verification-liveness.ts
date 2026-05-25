import { api } from "@/lib/api";

export interface LivenessCheckResponse {
  id: number;
  status: "PASSED" | "FAILED";
  score: number;
  provider: string;
  checkedAt: string;
  _mocked?: boolean;
}

export function runLivenessCheck() {
  return api.post<LivenessCheckResponse>("/verifications/liveness-check", {});
}
