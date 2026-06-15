import { useCallback } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function useContinueAs(
  searchParams: ReadonlyURLSearchParams,
  onRedirecting?: () => void,
) {
  return useCallback(async () => {
    if (!searchParams.get("client_id")) {
      window.location.href = "/";
      return;
    }
    onRedirecting?.();
    await authClient.$fetch("/oauth2/continue", {
      method: "POST",
      body: { selected: true },
    });
  }, [searchParams, onRedirecting]);
}
