import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type SignInInput = z.infer<typeof signInSchema>;

function isRedirectResponse(data: unknown): data is { redirect: true; url: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "redirect" in data &&
    (data as { redirect: unknown }).redirect === true
  );
}

export function useSignIn({ onRedirect }: { onRedirect?: () => void } = {}) {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: SignInInput) => {
      const res = await authClient.signIn.email(data);
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: (data) => {
      if (isRedirectResponse(data)) {
        onRedirect?.();
        return;
      }
      router.push("/");
    },
  });
}
