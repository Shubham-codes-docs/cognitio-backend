import { model, Schema } from "mongoose";

export const UserSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    voted: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = model("user", UserSchema);
export default User;
