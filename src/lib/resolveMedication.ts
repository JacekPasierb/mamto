import mongoose from "mongoose";

import Medication from "@/models/Medication";

export type MedicationInput = {
  medicationId?: string | null;
  medicationName?: string | null;
};

export type ResolvedMedication = {
  medicationId: mongoose.Types.ObjectId | null;
  medicationName: string;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Zapisuje / aktualizuje lek użytkownika i zwraca ID + nazwę. */
export async function resolveMedication(
  userId: string,
  input: MedicationInput
): Promise<ResolvedMedication> {
  const name = input.medicationName?.trim() || "";

  if (!name) {
    return {medicationId: null, medicationName: ""};
  }

  const now = new Date();

  if (
    input.medicationId &&
    mongoose.Types.ObjectId.isValid(input.medicationId)
  ) {
    const existing = await Medication.findOne({
      _id: input.medicationId,
      userId,
    });

    if (existing) {
      existing.lastUsedAt = now;
      await existing.save();

      return {
        medicationId: existing._id,
        medicationName: existing.name,
      };
    }
  }

  let medication = await Medication.findOne({
    userId,
    name: {$regex: new RegExp(`^${escapeRegex(name)}$`, "i")},
  });

  if (!medication) {
    medication = await Medication.create({
      userId,
      name,
      lastUsedAt: now,
    });
  } else {
    medication.lastUsedAt = now;
    await medication.save();
  }

  return {
    medicationId: medication._id,
    medicationName: medication.name,
  };
}
