import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface NewsArticleProps {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: string;
  scope: string;
  imageUrl?: string;
}

const NewsArticle: React.FC<NewsArticleProps> = ({
  id,
  title,
  content,
  author,
  date,
  category,
  scope,
  imageUrl,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/news/${id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-md rounded-lg p-6 mb-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={handleClick}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}
      <h2 className="text-2xl font-bold mb-2 text-blue-600 hover:text-blue-800 transition-colors">
        {title}
      </h2>
      <div className="flex items-center text-sm text-gray-600 mb-2">
        <span className="mr-2">{category}</span>
        <span className="mr-2">•</span>
        <span>{scope}</span>
      </div>
      <p className="text-gray-600 mb-4">{content.substring(0, 150)}...</p>
      <div className="flex justify-between text-sm text-gray-500">
        <span>By {author}</span>
        <span>{new Date(date).toLocaleDateString()}</span>
      </div>
    </motion.div>
  );
};

export default NewsArticle;
