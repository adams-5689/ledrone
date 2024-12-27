import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContexts";
import LikeButton from "./LikeButton";
import { MessageCircle, Share2 } from "lucide-react";

interface NewsArticleProps {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  categoryId: string;
  categoryName?: string;
  scope: string;
  imageUrl?: string;
  videoUrl?: string;
  likes: number;
  comments: number;
}

const NewsArticle: React.FC<NewsArticleProps> = ({
  id,
  title,
  content,
  author,
  date,
  categoryId,
  categoryName,
  scope,
  imageUrl,
  videoUrl,
  likes,
  comments,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = () => {
    navigate(`/news/${id}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: title,
          text: content.substring(0, 100) + "...",
          url: `${window.location.origin}/news/${id}`,
        })
        .then(() => {
          console.log("Successful share");
        })
        .catch((error) => {
          console.log("Error sharing", error);
        });
    } else {
      // Fallback for browsers that don't support navigator.share
      const url = `${window.location.origin}/news/${id}`;
      navigator.clipboard
        .writeText(url)
        .then(() => {
          alert("Link copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-md rounded-lg overflow-hidden mb-6"
    >
      {imageUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {videoUrl && (
        <div className="w-full h-48 overflow-hidden">
          <video
            src={videoUrl}
            className="w-full h-full object-cover"
            controls
          />
        </div>
      )}
      <div className="p-6">
        <h2
          onClick={handleClick}
          className="text-2xl font-bold mb-2 text-orange-600 hover:text-orange-800 transition-colors cursor-pointer"
        >
          {title}
        </h2>
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <span className="mr-2">{categoryName || "Uncategorized"}</span>
          <span className="mr-2">•</span>
          <span>{scope}</span>
        </div>
        <p className="text-gray-600 mb-4">{content.substring(0, 150)}...</p>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <span>By {author}</span>
            <span className="mx-2">•</span>
            <span>{new Date(date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <LikeButton
                  articleId={id}
                  initialLikes={likes}
                  initialDislikes={0}
                />
                <button
                  onClick={() => navigate(`/news/${id}#comments`)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>{comments}</span>
                </button>
              </>
            )}
            <button
              onClick={handleShare}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
            >
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewsArticle;
