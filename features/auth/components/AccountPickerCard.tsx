import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { t } from "@/utils/t";

function getInitials(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.split(/[\s@]+/);
  if (parts.length >= 2 && name.trim()) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

type Props = {
  user: { name: string; email: string };
  onContinue: () => void;
  onSwitch: () => void;
  isSwitching: boolean;
  switchError: string | null;
};

export function AccountPickerCard({
  user,
  onContinue,
  onSwitch,
  isSwitching,
  switchError,
}: Props) {
  const displayName = user.name || user.email;
  const initials = getInitials(user.name, user.email);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t("auth.account_picker.title")}</CardTitle>
        <CardDescription>{t("auth.account_picker.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <button
          type="button"
          onClick={onContinue}
          className="flex w-full items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-left transition-colors hover:bg-accent"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{displayName}</p>
            {user.name && (
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>
        </button>
        {switchError && (
          <p className="mt-2 text-sm text-destructive">{switchError}</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button
          type="button"
          className="w-full"
          onClick={onContinue}
        >
          {t("auth.account_picker.continue_as")} {displayName}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onSwitch}
          disabled={isSwitching}
        >
          {isSwitching
            ? t("auth.account_picker.switch_account_loading")
            : t("auth.account_picker.switch_account")}
        </Button>
      </CardFooter>
    </Card>
  );
}
