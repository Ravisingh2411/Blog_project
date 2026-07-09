const { createHmac, randomBytes } = require("crypto");
const mongoose = require("mongoose");
const { createTokenForUser } = require("../services/authentication");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageURL: {
      type: String,
      default: "/images/profile.png",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = randomBytes(16).toString("hex");

    const hashedPassword = createHmac("sha256", salt)
        .update(this.password)
        .digest("hex");

    this.salt = salt;
    this.password = hashedPassword;
});

// Login
userSchema.static(
  "matchPasswordAndGenerateToken",
  async function (email, password) {
    const user = await this.findOne({ email });

    if (!user) {
      throw new Error("User not found");
    }

    const userProvidedHash = createHmac("sha256", user.salt)
      .update(password)
      .digest("hex");

    if (userProvidedHash !== user.password) {
      throw new Error("Incorrect password");
    }

    const token = createTokenForUser(user);
    return token;
  }
);

const User = mongoose.model("user", userSchema);

module.exports = User;