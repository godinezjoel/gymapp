import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Bitte eine gültige E-Mail angeben"),
  password: z.string().min(1, "Passwort erforderlich"),
});
export type LoginInput = z.infer<typeof loginSchema>;
