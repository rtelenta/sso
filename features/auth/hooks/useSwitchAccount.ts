import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export function useSwitchAccount({ onSuccess }: { onSuccess: () => void }) {
  return useMutation({
    mutationFn: async () => {
      const res = await authClient.signOut();
      if (res.error) throw new Error(res.error.message ?? "Sign out failed");
    },
    onSuccess,
  });
}
