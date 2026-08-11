import {auth} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";

import StockPage from "@/components/stock/StockPage";
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

  if (!settings?.modules?.stock) {
    redirect("/settings");
  }

  return <StockPage />;
}
