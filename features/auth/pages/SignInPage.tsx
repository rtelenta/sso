"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
import { authClient } from "@/lib/auth-client";
import { useSignIn, signInSchema, type SignInInput } from "@/features/auth/hooks/useSignIn";
import { useContinueAs } from "@/features/auth/hooks/useContinueAs";
import { useSwitchAccount } from "@/features/auth/hooks/useSwitchAccount";
import { AccountPickerCard } from "@/features/auth/components/AccountPickerCard";
import { t } from "@/utils/t";

type InitialSession = { user: { name: string | null; email: string } } | null;

type Props = {
  initialSession: InitialSession;
};

export function SignInPage({ initialSession }: Props) {
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const signUpHref = search ? `/sign-up?${search}` : "/sign-up";

  const { data: liveSession } = authClient.useSession();
  const session = liveSession ?? initialSession;
  const [forceForm, setForceForm] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const continueAs = useContinueAs(searchParams, () => setIsRedirecting(true));
  const switchAccount = useSwitchAccount({ onSuccess: () => setForceForm(true) });
  const signIn = useSignIn({ onRedirect: () => setIsRedirecting(true) });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = handleSubmit((data) => {
    signIn.mutate(data);
  });

  if (isRedirecting) return null;

  if (session && !forceForm) {
    return (
      <AccountPickerCard
        user={{ name: session.user.name ?? "", email: session.user.email }}
        onContinue={continueAs}
        onSwitch={() => switchAccount.mutate()}
        isSwitching={switchAccount.isPending}
        switchError={
          switchAccount.isError
            ? (switchAccount.error?.message ?? t("auth.account_picker.switch_error"))
            : null
        }
      />
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t("auth.sign_in.title")}</CardTitle>
        <CardDescription>{t("auth.sign_in.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="sign-in-form" onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("auth.sign_in.email_label")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("auth.sign_in.email_placeholder")}
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t("auth.sign_in.password_label")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("auth.sign_in.password_placeholder")}
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          {signIn.isError && (
            <p className="text-sm text-destructive">
              {signIn.error?.message ?? t("auth.errors.generic")}
            </p>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button
          type="submit"
          form="sign-in-form"
          className="w-full"
          disabled={signIn.isPending}
        >
          {signIn.isPending ? t("auth.sign_in.submitting") : t("auth.sign_in.submit")}
        </Button>
        <p className="text-sm text-muted-foreground">
          {t("auth.sign_in.no_account")}{" "}
          <Link href={signUpHref} className="underline underline-offset-4">
            {t("auth.sign_in.sign_up_link")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
