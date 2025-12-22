import { z } from "zod";

export const SoaProcessingTypeSchema = z.enum(["SOA", "RL1", "RL2", "RL3"]);

export const SoaProcessingSchema = z.object({
  type: SoaProcessingTypeSchema,
  testMode: z.boolean().optional().default(false),
  skipAgingFilter: z.boolean().optional().default(false),
  skipDcNoteCheck: z.boolean().optional().default(false),
});

export type documentTypes = z.infer<typeof SoaProcessingSchema>;
