import mongoose, {Schema} from "mongoose";

import {VISIT_FORM_TYPES} from "@/lib/visitTypes";

const VisitProviderSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    category: {
      type: String,
      enum: [...VISIT_FORM_TYPES],
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

VisitProviderSchema.index({userId: 1, category: 1, name: 1});

if (mongoose.models.VisitProvider) {
  delete mongoose.models.VisitProvider;
}

const VisitProvider = mongoose.model("VisitProvider", VisitProviderSchema);

export default VisitProvider;
