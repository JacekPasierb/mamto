import mongoose, {Schema} from "mongoose";

const PushSubscriptionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    endpoint: {
      type: String,
      required: true,
      unique: true,
    },

    keys: {
      p256dh: {type: String, required: true},
      auth: {type: String, required: true},
    },

    userAgent: {
      type: String,
      default: "",
    },

    /** Ostatni wysłany digest — unikamy spamu tego samego dnia. */
    lastDigest: {
      type: String,
      default: "",
    },

    lastNotifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

PushSubscriptionSchema.index({userId: 1, endpoint: 1});

if (mongoose.models.PushSubscription) {
  delete mongoose.models.PushSubscription;
}

const PushSubscription = mongoose.model(
  "PushSubscription",
  PushSubscriptionSchema
);

export default PushSubscription;
