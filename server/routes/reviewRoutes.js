import express from "express";
import { getReviews, createReview } from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";

const reviewRouter = express.Router();

reviewRouter.get("/", getReviews);
reviewRouter.post("/", protect, createReview);

export default reviewRouter;
