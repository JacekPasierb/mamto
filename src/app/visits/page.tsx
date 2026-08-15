import {auth} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";

import VisitsPage from "@/components/visits/VisitsPage";
import {connectDB} from "@/lib/mongodb";
import UserSettings from "@/models/UserSettings";

export default async function Page() {
  const {userId} = await auth();

  if (!userId) {
    redirect("/login");
  }

  await connectDB();

  const settings = await UserSettings.findOne({
    userId,
  }).lean();

  if (settings?.modules?.beauty === false) {
    redirect("/settings");
  }

  return <VisitsPage />;
}
