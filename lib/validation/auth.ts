import { z } from "zod";

export const loginSchema = z.object({
  passphrase: z.string().min(1, "Passwort erforderlich"),
});
export type LoginInput = z.infer<typeof loginSchema>;
