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
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });
UserSchema.index({ city: 1, state: 1 });

// Delete cached model so schema changes take effect on Next.js hot-reload
if (mongoose.models.User) mongoose.deleteModel("User");
export default mongoose.model("User", UserSchema);
