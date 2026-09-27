import mongoose, {Schema} from "mongoose";

const MedicationSchema = new Schema(
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

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

MedicationSchema.index({userId: 1, name: 1});

if (mongoose.models.Medication) {
  delete mongoose.models.Medication;
}

const Medication = mongoose.model("Medication", MedicationSchema);

export default Medication;
