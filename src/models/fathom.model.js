import mongoose from "mongoose";

// Schema para estados OAuth temporales
const oauthStateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  state: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Expira en 10 minutos
  },
});

// Schema para tokens de Fathom de usuarios
const fathomTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    tokenType: {
      type: String,
      default: "Bearer",
    },
    expiresAt: {
      type: Date,
    },
    scope: {
      type: String,
      default: "read",
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const OAuthState = mongoose.model("OAuthState", oauthStateSchema);
export const FathomToken = mongoose.model("FathomToken", fathomTokenSchema);
