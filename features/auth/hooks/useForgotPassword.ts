import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordInput) => {
      const res = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: "/reset-password",
      });
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
  });
}
