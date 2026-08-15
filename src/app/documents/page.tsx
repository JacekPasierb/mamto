import {auth} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";

import DocumentsPage from "@/components/documents/DocumentsPage";
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

  if (settings?.modules?.documents === false) {
    redirect("/settings");
  }

  return <DocumentsPage />;
}
