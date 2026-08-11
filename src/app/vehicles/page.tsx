import {auth} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";

import VehiclesPage from "@/components/vehicles/VehiclesPage";
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

  if (!settings?.modules?.vehicles) {
    redirect("/settings");
  }

  return <VehiclesPage />;
}
