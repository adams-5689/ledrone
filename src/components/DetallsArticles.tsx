import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../configs/firebase";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContexts";
import CommentSection from "../components/CommentSection";
import LikeButton from "../components/LikeButton";
import FavoriteButton from "../components/FavoriteButtom";
import SocialShare from "../components/SocialShare";

interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: string;
  scope: string;
  imageUrl?: string;
  videoUrl?: string;
  likes: number;
  dislikes: number;
  tags: string[];
}

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      const docRef = doc(db, "articles", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setArticle({ id: docSnap.id, ...docSnap.data() } as Article);
      }
      setLoading(false);
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!article) {
    return <div className="text-center">Article not found</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden"
    >
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <span className="mr-2">{article.category}</span>
          <span className="mr-2">•</span>
          <span>{article.scope}</span>
        </div>
        <div className="flex items-center text-gray-600 mb-6">
          <span className="mr-4">By {article.author}</span>
          <span>{new Date(article.date).toLocaleDateString()}</span>
        </div>

        {article.imageUrl && (
          <div className="mb-6">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full rounded-lg"
            />
          </div>
        )}

        {article.videoUrl && (
          <div className="mb-6">
            <video
              src={article.videoUrl}
              controls
              className="w-full rounded-lg"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        <div className="prose max-w-none mb-6">
          {article.content.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags &&
            article.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-200 px-2 py-1 rounded-full text-sm text-gray-700"
              >
                {tag}
              </span>
            ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <LikeButton
            articleId={article.id}
            initialLikes={article.likes}
            initialDislikes={article.dislikes}
          />
          <FavoriteButton articleId={article.id} />
        </div>

        <SocialShare url={window.location.href} title={article.title} />

        <CommentSection articleId={article.id} />
      </div>
    </motion.div>
  );
};
export default ArticleDetail;
