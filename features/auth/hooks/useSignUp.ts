import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

export const signUpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export function useSignUp() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: SignUpInput) => {
      const res = await authClient.signUp.email(data);
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      router.push("/");
    },
  });
}
