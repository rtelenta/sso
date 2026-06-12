import { redirect } from "next/navigation";
import { SignUpPage } from "@/features/auth/pages/SignUpPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const redirectUri = params["redirect_uri"];

  if (typeof redirectUri === "string" && redirectUri) {
    const qs = new URLSearchParams();
    qs.set("redirect_uri", redirectUri);
    if (typeof params["state"] === "string") qs.set("state", params["state"]);
    if (typeof params["client_id"] === "string") qs.set("client_id", params["client_id"]);
    redirect(`/api/oauth/start?${qs.toString()}`);
  }

  return <SignUpPage />;
}
