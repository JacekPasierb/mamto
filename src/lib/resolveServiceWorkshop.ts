import mongoose from "mongoose";

import type {PerformedBy} from "@/lib/workshopTypes";
import Workshop from "@/models/Workshop";

export type ServiceWorkshopInput = {
  performedBy?: PerformedBy | string | null;
  workshopId?: string | null;
  workshopName?: string | null;
};

export type ResolvedServiceWorkshop = {
  performedBy: PerformedBy;
  workshopId: mongoose.Types.ObjectId | null;
  workshopName: string | null;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizePerformedBy(value?: string | null): PerformedBy {
  if (value === "workshop" || value === "self" || value === "other") {
    return value;
  }

  return "other";
}

export async function resolveServiceWorkshop(
  userId: string,
  input: ServiceWorkshopInput
): Promise<ResolvedServiceWorkshop> {
  const performedBy = normalizePerformedBy(input.performedBy);

  if (performedBy !== "workshop") {
    return {
      performedBy,
      workshopId: null,
      workshopName: null,
    };
  }

  const name = input.workshopName?.trim();

  if (!name) {
    throw new Error("Podaj nazwę warsztatu");
  }

  const now = new Date();

  if (input.workshopId && mongoose.Types.ObjectId.isValid(input.workshopId)) {
    const existing = await Workshop.findOne({
      _id: input.workshopId,
      userId,
    });

    if (existing) {
      existing.lastUsedAt = now;
      await existing.save();

      return {
        performedBy: "workshop",
        workshopId: existing._id,
        workshopName: existing.name,
      };
    }
  }

  let workshop = await Workshop.findOne({
    userId,
    name: {$regex: new RegExp(`^${escapeRegex(name)}$`, "i")},
  });

  if (!workshop) {
    workshop = await Workshop.create({
      userId,
      name,
      lastUsedAt: now,
    });
  } else {
    workshop.lastUsedAt = now;
    await workshop.save();
  }

  return {
    performedBy: "workshop",
    workshopId: workshop._id,
    workshopName: workshop.name,
  };
}
