import { randomBytes } from "crypto";

export function generateId() {
  return randomBytes(6).toString("hex");
}