import { z } from "zod";
import type { StringValue } from "ms";


const envSchema = z.object({
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(1),

  JWT_EXPIRES_IN: z.string().default("7d") as z.ZodType<StringValue>,
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables");
  console.error(parsed.error.format());

  process.exit(1);
}

export const env = parsed.data;