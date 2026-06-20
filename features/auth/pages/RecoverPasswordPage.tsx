"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  useForgotPassword,
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/features/auth/hooks/useForgotPassword";
import { t } from "@/utils/t";

export function RecoverPasswordPage() {
  const [sent, setSent] = useState(false);
  const forgotPassword = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = handleSubmit((data) => {
    forgotPassword.mutate(data, { onSuccess: () => setSent(true) });
  });

  if (sent) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("auth.recover_password.success_title")}</CardTitle>
          <CardDescription>
            {t("auth.recover_password.success_message")}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t("auth.recover_password.title")}</CardTitle>
        <CardDescription>{t("auth.recover_password.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="recover-password-form"
          onSubmit={onSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">
              {t("auth.recover_password.email_label")}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t("auth.recover_password.email_placeholder")}
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          {forgotPassword.isError && (
            <p className="text-sm text-destructive">
              {forgotPassword.error?.message ?? t("auth.errors.generic")}
            </p>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form="recover-password-form"
          className="w-full"
          disabled={forgotPassword.isPending}
        >
          {forgotPassword.isPending
            ? t("auth.recover_password.submitting")
            : t("auth.recover_password.submit")}
        </Button>
      </CardFooter>
    </Card>
  );
}
