import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const reviewSchema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    location: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
