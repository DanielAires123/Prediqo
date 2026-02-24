import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(2).max(30).regex(/^[a-zA-Z0-9_]+$/),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createPredictionSchema = z.object({
  matchId: z.string().cuid(),
  selectedOutcome: z.enum(["HOME_WIN", "DRAW", "AWAY_WIN"]),
  confidenceUsed: z.number().int().min(5).max(50),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePredictionInput = z.infer<typeof createPredictionSchema>;
