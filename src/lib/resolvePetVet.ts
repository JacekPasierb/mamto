import mongoose from "mongoose";

import Vet from "@/models/Vet";

export type PetVetInput = {
  vetId?: string | null;
  vetName?: string | null;
};

export type ResolvedPetVet = {
  vetId: mongoose.Types.ObjectId | null;
  vetName: string;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Zapisuje / aktualizuje weterynarię użytkownika i zwraca ID + nazwę. */
export async function resolvePetVet(
  userId: string,
  input: PetVetInput
): Promise<ResolvedPetVet> {
  const name = input.vetName?.trim() || "";

  if (!name) {
    return {vetId: null, vetName: ""};
  }

  const now = new Date();

  if (input.vetId && mongoose.Types.ObjectId.isValid(input.vetId)) {
    const existing = await Vet.findOne({
      _id: input.vetId,
      userId,
    });

    if (existing) {
      existing.lastUsedAt = now;
      await existing.save();

      return {
        vetId: existing._id,
        vetName: existing.name,
      };
    }
  }

  let vet = await Vet.findOne({
    userId,
    name: {$regex: new RegExp(`^${escapeRegex(name)}$`, "i")},
  });

  if (!vet) {
    vet = await Vet.create({
      userId,
      name,
      lastUsedAt: now,
    });
  } else {
    vet.lastUsedAt = now;
    await vet.save();
  }

  return {
    vetId: vet._id,
    vetName: vet.name,
  };
}
