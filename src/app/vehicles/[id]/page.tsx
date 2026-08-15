import {auth} from "@clerk/nextjs/server";
import {redirect, notFound} from "next/navigation";

import AppShell from "@/components/dashboard/AppShell";
import VehicleDetail from "@/components/vehicles/VehicleDetail";
import {connectDB} from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";
import UserSettings from "@/models/UserSettings";

type VehiclePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VehiclePage({params}: VehiclePageProps) {
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

  const {id} = await params;

  const vehicle = await Vehicle.findOne({
    _id: id,
    userId,
  }).lean();

  if (!vehicle) {
    notFound();
  }

  return (
    <AppShell>
      <VehicleDetail
        vehicle={{
          _id: String(vehicle._id),
          name: vehicle.name,
          brand: vehicle.brand || "",
          model: vehicle.model || "",
          year: vehicle.year ?? null,
          vin: vehicle.vin || "",
          plateNumber: vehicle.plateNumber || "",
          mileage: vehicle.mileage || 0,
          type: vehicle.type || "car",
        }}
      />
    </AppShell>
  );
}
