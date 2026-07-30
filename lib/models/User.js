import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:   { type: String, required: true, minlength: 6 },
    name:       { type: String, required: true, trim: true },
    role:       { type: String, enum: ["admin", "dealer"], default: "dealer" },

    // Dealer-specific location fields
    city:       { type: String, trim: true, default: "" },
    state:      { type: String, trim: true, default: "" },

    // Dealer meta
    phone:      { type: String, trim: true, default: "" },
    dealerCode: { type: String, trim: true, default: "" },
    isActive:   { type: Boolean, default: true },

    lastLogin:  { type: Date },

    // Increment to invalidate all existing tokens for this user (e.g. on logout or pw change)
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });
UserSchema.index({ city: 1, state: 1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);
