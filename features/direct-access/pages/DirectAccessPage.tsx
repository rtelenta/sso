import { t } from "@/utils/t";

export function DirectAccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("direct_access.title")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("direct_access.description")}
        </p>
      </div>
    </div>
  );
}
