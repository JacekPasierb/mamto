import mongoose, {Schema} from "mongoose";

const UserSettingsSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },

    modules: {
      vehicles: {
        type: Boolean,
        default: true,
      },
      insurance: {
        type: Boolean,
        default: true,
      },
      documents: {
        type: Boolean,
        default: true,
      },
      beauty: {
        type: Boolean,
        default: false,
      },
      stock: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.UserSettings) {
  delete mongoose.models.UserSettings;
}

const UserSettings = mongoose.model("UserSettings", UserSettingsSchema);

export default UserSettings;
