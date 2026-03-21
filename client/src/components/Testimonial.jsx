import React, { useEffect, useState } from 'react'
import Title from './Title'
import { assets } from '../assets/assets';
import {motion} from 'motion/react'
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Testimonial = () => {

    const { axios } = useAppContext();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchReviews = async () => {
        try{
            setLoading(true);
            const {data} = await axios.get('/api/reviews');
            if(data.success){
                setReviews(data.reviews);
            }
        }
        catch(error){
            console.log(error.message);
        }
        finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchReviews();
    },[]);

  return (
      <div className="py-28 px-6 md:px-16 ld:px-24 xl:px-44">
            
        <Title title="What our Customers Say" subTitle="Real feedback from customers who booked with us."/>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-18">
                {loading && reviews.length === 0 && (
                    <p className="col-span-full text-center text-gray-500">Loading feedback...</p>
                )}
                {!loading && reviews.length === 0 && (
                    <p className="col-span-full text-center text-gray-500">No feedback yet. Be the first to share your experience!</p>
                )}
                {reviews.slice(0,3).map((review, index) => (
                    <motion.div 
                    initial={{opacity:0, y:40}}
                    whileInView={{opacity:1, y:0}}
                    transition={{duration:0.6, delay:index*0.1,ease:"easeOut"}}
                    viewport={{once:true, amount:0.3}}
                    key={review._id || index} className="bg-white p-6 rounded-xl shadow-lg hover:-translate-y-1 transition-all duration-500">
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
                            {Array(review.rating || 5).fill(0).map((_, index) => (
                                <img key={index} src={assets.star_icon} alt="star-icon" />
                            ))}
                        </div>
                        <p className="text-gray-500 max-w-90 mt-4 font-light">"{review.comment}"</p>
                    </motion.div>
                ))}
            </div>
            <div className="mt-10 flex justify-center">
                <button 
                    onClick={() => navigate('/feedback')}
                    className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dull transition-colors"
                >
                    View all feedback
                </button>
            </div>
        </div>
  )
}

export default Testimonial
