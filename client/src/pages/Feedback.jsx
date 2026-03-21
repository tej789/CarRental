import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import { toast } from 'react-hot-toast';

const Feedback = () => {
  const { axios, user } = useAppContext();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [location, setLocation] = useState('');
  const [comment, setComment] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/reviews');
      if (data.success) {
        setReviews(data.reviews);
      } else if (data.message) {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error.message);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      const { data } = await axios.post('/api/reviews', { rating, comment, location });
      if (data.success && data.review) {
        setReviews((prev) => [data.review, ...prev]);
        setComment('');
        setLocation('');
        setRating(5);
        toast.success('Feedback submitted');
      } else if (!data.success && data.message) {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error.message);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="py-24 px-6 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="All Customer Feedback"
        subTitle="Read what our customers say and share your own experience."
      />

      {user && (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          onSubmit={handleSubmit}
          className="mt-8 mb-10 bg-white p-6 rounded-xl shadow-md flex flex-col gap-4 md:gap-5"
        >
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Rating</span>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="focus:outline-none"
                  aria-label={`${value} star rating`}
                >
                  <img
                    src={assets.star_icon}
                    alt="star"
                    className={`w-5 h-5 transition-opacity ${
                      value <= rating ? 'opacity-100' : 'opacity-30'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs text-gray-500">{rating} / 5</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Your city, country (optional)"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <textarea
              rows="3"
              placeholder="Share your experience with our service"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none mt-2"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="self-start mt-3 bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </motion.form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
        {loading && reviews.length === 0 && (
          <p className="col-span-full text-center text-gray-500">Loading feedback...</p>
        )}
        {!loading && reviews.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No feedback yet. Be the first to share your experience!
          </p>
        )}
        {reviews.map((review, index) => (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.3 }}
            key={review._id || index}
            className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 transition-all duration-500"
          >
            <div className="flex items-center gap-3">
              {review.image ? (
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg uppercase">
                  {review.name ? review.name.charAt(0) : 'U'}
                </div>
              )}
              <div>
                <p className="text-xl">{review.name}</p>
                {review.location && <p className="text-gray-500">{review.location}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4">
              {Array(review.rating || 5)
                .fill(0)
                .map((_, starIndex) => (
                  <img key={starIndex} src={assets.star_icon} alt="star-icon" />
                ))}
            </div>
            <p className="text-gray-500 max-w-90 mt-4 font-light">"{review.comment}"</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Feedback;
