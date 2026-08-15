import {redirect} from "next/navigation";

/** Stary adres /beauty → /visits */
export default function BeautyRedirectPage() {
  redirect("/visits");
}
