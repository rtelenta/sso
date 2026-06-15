import { redirect } from "next/navigation";
import { SignUpPage } from "@/features/auth/pages/SignUpPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  if (!params.client_id || !params.redirect_uri) {
    redirect("/");
  }

  return <SignUpPage />;
}
