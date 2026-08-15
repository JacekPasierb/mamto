import mongoose, {Schema} from "mongoose";

import {
  INSURANCE_PAYMENT_FREQUENCIES,
  INSURANCE_TYPES,
} from "@/lib/insuranceTypes";

const InsurancePolicySchema = new Schema(
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
      enum: [...INSURANCE_TYPES],
      default: "vehicle",
      index: true,
    },

    insurer: {
      type: String,
      default: "",
      trim: true,
    },

    policyNumber: {
      type: String,
      default: "",
      trim: true,
    },

    startsAt: {
      type: Date,
      default: null,
    },

    endsAt: {
      type: Date,
      required: true,
      index: true,
    },

    premium: {
      type: Number,
      default: null,
    },

    paymentFrequency: {
      type: String,
      enum: [...INSURANCE_PAYMENT_FREQUENCIES],
      default: "yearly",
    },

    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
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

// W dev Mongoose trzyma stary schemat — wymuszamy odświeżenie enumów.
if (mongoose.models.InsurancePolicy) {
  delete mongoose.models.InsurancePolicy;
}

const InsurancePolicy = mongoose.model(
  "InsurancePolicy",
  InsurancePolicySchema
);

export default InsurancePolicy;
