import {auth} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";
import ModuleSettings from "./ModuleSettings";

export default async function SettingsPage() {
  const {isAuthenticated} = await auth();

  if (!isAuthenticated) {
    redirect("/login");
  }

  return <ModuleSettings />;
}
