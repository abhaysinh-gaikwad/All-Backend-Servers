const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
    {
        email: { type: String, required: true },
        password: { type: String },
        name: { type: String },
        bio:{type: String},
        phone:{type: Number},
        image:{type: String},
    },
    {
      versionKey: false,
    }
  );

const UserModel = mongoose.model("users", userSchema);

module.exports={
    UserModel
} 