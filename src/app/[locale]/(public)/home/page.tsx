import { redirect, RedirectType } from "next/navigation";

export default function HomeRedirectPage() {
  redirect("/", RedirectType.replace);
}
