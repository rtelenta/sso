"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useResetPassword,
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/features/auth/hooks/useResetPassword";
import { t } from "@/utils/t";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const resetPassword = useResetPassword(token ?? "");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = handleSubmit((data) => {
    resetPassword.mutate(data);
  });

  if (!token) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("auth.reset_password.title")}</CardTitle>
          <CardDescription className="text-destructive">
            {t("auth.reset_password.invalid_link")}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t("auth.reset_password.title")}</CardTitle>
        <CardDescription>{t("auth.reset_password.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="reset-password-form"
          onSubmit={onSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">
              {t("auth.reset_password.password_label")}
            </Label>
            <Input
              id="newPassword"
              type="password"
              placeholder={t("auth.reset_password.password_placeholder")}
              autoComplete="new-password"
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>
          {resetPassword.isError && (
            <p className="text-sm text-destructive">
              {resetPassword.error?.message ?? t("auth.errors.generic")}
            </p>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form="reset-password-form"
          className="w-full"
          disabled={resetPassword.isPending}
        >
          {resetPassword.isPending
            ? t("auth.reset_password.submitting")
            : t("auth.reset_password.submit")}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
