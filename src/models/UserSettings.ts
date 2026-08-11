import mongoose, {Schema, models} from "mongoose";

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

const UserSettings =
  models.UserSettings || mongoose.model("UserSettings", UserSettingsSchema);

export default UserSettings;
