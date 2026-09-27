import mongoose, {Schema} from "mongoose";

import {INFECTIOUS_DISEASES, PET_CARE_TYPES} from "@/lib/petTypes";

const PetCareSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    petId: {
      type: Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [...PET_CARE_TYPES],
      default: "rabies",
      index: true,
    },

    /** Wybrane choroby przy typie `infectious`. */
    diseases: {
      type: [
        {
          type: String,
          enum: [...INFECTIOUS_DISEASES],
        },
      ],
      default: [],
    },

    providerName: {
      type: String,
      default: "",
      trim: true,
    },

    lastDoneAt: {
      type: Date,
      default: null,
    },

    /** null = wpis historyczny (wykonany), bez kolejnego terminu. */
    nextDueAt: {
      type: Date,
      default: null,
      index: true,
    },

    intervalMonths: {
      type: Number,
      default: null,
    },

    notes: {
      type: String,
      default: "",
    },

    /** Po „Oznacz wykonane” — bez badge/powiadomienia, daty bez zmian. */
    reminderDismissed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.PetCare) {
  delete mongoose.models.PetCare;
}

const PetCare = mongoose.model("PetCare", PetCareSchema);

export default PetCare;
