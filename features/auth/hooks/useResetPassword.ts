import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export function useResetPassword(token: string) {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: ResetPasswordInput) => {
      const res = await authClient.resetPassword({
        newPassword: data.newPassword,
        token,
      });
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      router.push("/sign-in");
    },
  });
}
