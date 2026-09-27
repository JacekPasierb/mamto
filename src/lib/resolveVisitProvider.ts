import mongoose from "mongoose";

import {
  normalizeVisitType,
  type VisitFormType,
  type VisitType,
} from "@/lib/visitTypes";
import VisitProvider from "@/models/VisitProvider";

export type VisitProviderInput = {
  category: VisitType | VisitFormType;
  providerId?: string | null;
  providerName?: string | null;
};

export type ResolvedVisitProvider = {
  providerId: mongoose.Types.ObjectId | null;
  providerName: string;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Zapisuje / aktualizuje usługodawcę wizyt i zwraca ID + nazwę. */
export async function resolveVisitProvider(
  userId: string,
  input: VisitProviderInput
): Promise<ResolvedVisitProvider> {
  const name = input.providerName?.trim() || "";
  const category = normalizeVisitType(input.category as VisitType);

  if (!name) {
    return {providerId: null, providerName: ""};
  }

  const now = new Date();

  if (input.providerId && mongoose.Types.ObjectId.isValid(input.providerId)) {
    const existing = await VisitProvider.findOne({
      _id: input.providerId,
      userId,
      category,
    });

    if (existing) {
      existing.lastUsedAt = now;
      await existing.save();

      return {
        providerId: existing._id,
        providerName: existing.name,
      };
    }
  }

  let provider = await VisitProvider.findOne({
    userId,
    category,
    name: {$regex: new RegExp(`^${escapeRegex(name)}$`, "i")},
  });

  if (!provider) {
    provider = await VisitProvider.create({
      userId,
      category,
      name,
      lastUsedAt: now,
    });
  } else {
    provider.lastUsedAt = now;
    await provider.save();
  }

  return {
    providerId: provider._id,
    providerName: provider.name,
  };
}
