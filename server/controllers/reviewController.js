import Review from "../models/Review.js";

// GET /api/reviews
export const getReviews = async (req, res) => {
  try {
    const docs = await Review.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'name image');

    const reviews = docs.map((doc) => ({
      _id: doc._id,
      user: doc.user?._id,
      name: doc.user?.name || doc.name,
      image: doc.user?.image || doc.image || "",
      location: doc.location,
      rating: doc.rating,
      comment: doc.comment,
      createdAt: doc.createdAt,
    }));

    res.json({ success: true, reviews });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const { rating, comment, location } = req.body;

    if (!rating || !comment) {
      return res.json({ success: false, message: "Rating and comment are required." });
    }

    const userId = req.user?._id;

    if (!userId) {
      return res.json({ success: false, message: "Unauthorized." });
    }

    const review = await Review.create({
      user: userId,
      name: req.user.name,
      image: req.user.image || "",
      location: location || "",
      rating,
      comment,
    });

    res.json({ success: true, review });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
