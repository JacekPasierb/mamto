import {auth} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";

import PoradnikPage from "@/components/poradnik/PoradnikPage";

export default async function PoradnikRoutePage() {
  const {isAuthenticated} = await auth();

  if (!isAuthenticated) {
    redirect("/login");
  }

  return <PoradnikPage />;
}
