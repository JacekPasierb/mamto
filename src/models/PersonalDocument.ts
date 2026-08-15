import mongoose, {Schema} from "mongoose";

import {DOCUMENT_TYPES} from "@/lib/documentTypes";

const PersonalDocumentSchema = new Schema(
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
      enum: [...DOCUMENT_TYPES],
      default: "identity",
      index: true,
    },

    documentNumber: {
      type: String,
      default: "",
      trim: true,
    },

    issuer: {
      type: String,
      default: "",
      trim: true,
    },

    issuedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
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

if (mongoose.models.PersonalDocument) {
  delete mongoose.models.PersonalDocument;
}

const PersonalDocument = mongoose.model(
  "PersonalDocument",
  PersonalDocumentSchema
);

export default PersonalDocument;
