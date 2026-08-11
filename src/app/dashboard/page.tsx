import {auth} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const {isAuthenticated} = await auth();

  if (!isAuthenticated) {
    redirect("/login");
  }

  return <DashboardContent />;
}
