import mongoose, {Schema} from "mongoose";

import {VISIT_TYPES} from "@/lib/visitTypes";

const PersonalVisitSchema = new Schema(
  {
    userId: {
      type: String,
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
      enum: [...VISIT_TYPES],
      default: "health",
      index: true,
    },

    providerName: {
      type: String,
      default: "",
      trim: true,
    },

    lastVisitAt: {
      type: Date,
      default: null,
    },

    nextDueAt: {
      type: Date,
      required: true,
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
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.PersonalVisit) {
  delete mongoose.models.PersonalVisit;
}

const PersonalVisit = mongoose.model("PersonalVisit", PersonalVisitSchema);

export default PersonalVisit;
