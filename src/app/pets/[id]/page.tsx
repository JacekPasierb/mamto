import {auth} from "@clerk/nextjs/server";
import {redirect, notFound} from "next/navigation";

import AppShell from "@/components/dashboard/AppShell";
import PetDetail from "@/components/pets/PetDetail";
import {toDateInputValue} from "@/lib/calculateCurrentStock";
import {connectDB} from "@/lib/mongodb";
import Pet from "@/models/Pet";
import UserSettings from "@/models/UserSettings";

type PetPageProps = {
  params: Promise<{id: string}>;
};

export default async function PetPage({params}: PetPageProps) {
  const {userId} = await auth();

  if (!userId) {
    redirect("/login");
  }

  await connectDB();

  const settings = await UserSettings.findOne({userId}).lean();

  if (settings?.modules?.pets === false) {
    redirect("/settings");
  }

  const {id} = await params;

  const pet = await Pet.findOne({_id: id, userId}).lean();

  if (!pet) {
    notFound();
  }

  return (
    <AppShell>
      <PetDetail
        pet={{
          _id: String(pet._id),
          name: pet.name,
          species: pet.species || "dog",
          breed: pet.breed || "",
          birthDate: pet.birthDate
            ? toDateInputValue(pet.birthDate)
            : null,
          microchipId: pet.microchipId || "",
          vetName: pet.vetName || "",
          vetId: pet.vetId ? String(pet.vetId) : null,
          notes: pet.notes || "",
        }}
      />
    </AppShell>
  );
}
