import { redirect, RedirectType } from "next/navigation";

export default function ShopRedirectPage() {
  redirect("/blog", RedirectType.replace);
}
