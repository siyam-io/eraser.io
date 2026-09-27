import fs from "fs";
import mongoose from "mongoose";

const env = fs.readFileSync(".env", "utf8");
const uri = env.split("\n").find((l) => l.startsWith("MONGODB_URI=")).split("=")[1].trim();

await mongoose.connect(uri);
const res = await mongoose.connection.db.collection("files").updateMany(
  { publicAccess: "private" },
  { $set: { publicAccess: "edit" } }
);
console.log("Updated files to edit access:", res.modifiedCount);
await mongoose.disconnect();
