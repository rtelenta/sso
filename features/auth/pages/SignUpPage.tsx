"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
import { useSignUp, signUpSchema, type SignUpInput } from "@/features/auth/hooks/useSignUp";
import { t } from "@/utils/t";

export function SignUpPage() {
  const signUp = useSignUp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = handleSubmit((data) => {
    signUp.mutate(data);
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t("auth.sign_up.title")}</CardTitle>
        <CardDescription>{t("auth.sign_up.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="sign-up-form" onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">{t("auth.sign_up.name_label")}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("auth.sign_up.name_placeholder")}
              autoComplete="name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("auth.sign_up.email_label")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("auth.sign_up.email_placeholder")}
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t("auth.sign_up.password_label")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("auth.sign_up.password_placeholder")}
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          {signUp.isError && (
            <p className="text-sm text-destructive">
              {signUp.error?.message ?? t("auth.errors.generic")}
            </p>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button
          type="submit"
          form="sign-up-form"
          className="w-full"
          disabled={signUp.isPending}
        >
          {signUp.isPending ? t("auth.sign_up.submitting") : t("auth.sign_up.submit")}
        </Button>
        <p className="text-sm text-muted-foreground">
          {t("auth.sign_up.have_account")}{" "}
          <Link href="/sign-in" className="underline underline-offset-4">
            {t("auth.sign_up.sign_in_link")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
