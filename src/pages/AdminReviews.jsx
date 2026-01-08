import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { ref, onValue, remove } from "firebase/database";
import { MdDelete } from "react-icons/md";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reviewsRef = ref(db, "reviews/");
    onValue(reviewsRef, (snapshot) => {
      setLoading(false);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = [];

        Object.keys(data).forEach((orderId) => {
          Object.keys(data[orderId]).forEach((userId) => {
            const review = data[orderId][userId];
            list.push({
              orderId,
              userId,
              reviewId: `${orderId}_${userId}`,
              ...review,
            });
          });
        });

        setReviews(list.reverse()); // latest first
      } else {
        setReviews([]);
      }
    });
  }, []);

  const deleteReview = async (orderId, userId) => {
    try {
      await remove(ref(db, `reviews/${orderId}/${userId}`));
      alert("Review deleted successfully");
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review");
    }
  };

  const expandImage = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-5">
        <h1 className="text-2xl font-bold mb-5">All Reviews</h1>
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Reviews</h1>
        <div className="text-sm text-gray-600">
          Total Reviews: {reviews.length}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">No reviews yet.</p>
          <p className="text-gray-400 text-sm mt-2">Reviews will appear here when customers submit them.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {reviews.map((review) => {
            const images = review.images || (review.image ? [review.image] : []);
            
            return (
              <div
                key={review.reviewId}
                className="border rounded-lg p-6 shadow-sm bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-800">
                        Order: {review.orderId}
                      </h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {review.userId.substring(0, 8)}...
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>
                            ⭐
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {review.rating}/5 stars
                      </span>
                    </div>
                  </div>
                  
                  <button
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-full transition-colors"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this review?")) {
                        deleteReview(review.orderId, review.userId);
                      }
                    }}
                    title="Delete Review"
                  >
                    <MdDelete size={20} />
                  </button>
                </div>

                {/* Review Text */}
                <div className="mb-4">
                  <p className="text-gray-800 leading-relaxed">{review.review}</p>
                </div>

                {/* Review Images */}
                {images.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-3">
                      Review Images ({images.length})
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {images.map((img, index) => (
                        <div
                          key={index}
                          className="relative group cursor-pointer"
                          onClick={() => expandImage(img)}
                        >
                          <img
                            src={img}
                            alt={`Review image ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors"
                          />
                          <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Metadata */}
                <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">User ID:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {review.userId}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}