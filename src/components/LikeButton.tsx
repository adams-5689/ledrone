import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../configs/firebase";
import { useAuth } from "../contexts/AuthContexts";

interface LikeButtonProps {
  articleId: string;
  initialLikes: number;
  initialDislikes: number;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  articleId,
  initialLikes,
  initialDislikes,
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userLikeStatus, setUserLikeStatus] = useState<
    "like" | "dislike" | null
  >(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserLikeStatus = async () => {
      if (user) {
        const likeStatusDoc = await getDoc(
          doc(db, "articles", articleId, "likeStatus", user.uid)
        );
        if (likeStatusDoc.exists()) {
          setUserLikeStatus(likeStatusDoc.data().status);
        }
      }
    };
    fetchUserLikeStatus();
  }, [articleId, user]);

  const handleLike = async () => {
    if (!user) return;

    const articleRef = doc(db, "articles", articleId);
    const userLikeStatusRef = doc(
      db,
      "articles",
      articleId,
      "likeStatus",
      user.uid
    );

    if (userLikeStatus === "like") {
      await updateDoc(articleRef, { likes: likes - 1 });
      await updateDoc(userLikeStatusRef, { status: null });
      setLikes(likes - 1);
      setUserLikeStatus(null);
    } else {
      if (userLikeStatus === "dislike") {
        await updateDoc(articleRef, {
          likes: likes + 1,
          dislikes: dislikes - 1,
        });
        setDislikes(dislikes - 1);
      } else {
        await updateDoc(articleRef, { likes: likes + 1 });
      }
      await updateDoc(userLikeStatusRef, { status: "like" });
      setLikes(likes + 1);
      setUserLikeStatus("like");
    }
  };

  const handleDislike = async () => {
    if (!user) return;

    const articleRef = doc(db, "articles", articleId);
    const userLikeStatusRef = doc(
      db,
      "articles",
      articleId,
      "likeStatus",
      user.uid
    );

    if (userLikeStatus === "dislike") {
      await updateDoc(articleRef, { dislikes: dislikes - 1 });
      await updateDoc(userLikeStatusRef, { status: null });
      setDislikes(dislikes - 1);
      setUserLikeStatus(null);
    } else {
      if (userLikeStatus === "like") {
        await updateDoc(articleRef, {
          likes: likes - 1,
          dislikes: dislikes + 1,
        });
        setLikes(likes - 1);
      } else {
        await updateDoc(articleRef, { dislikes: dislikes + 1 });
      }
      await updateDoc(userLikeStatusRef, { status: "dislike" });
      setDislikes(dislikes + 1);
      setUserLikeStatus("dislike");
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handleLike}
        className={`flex items-center space-x-1 ${
          userLikeStatus === "like" ? "text-blue-500" : "text-gray-500"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
        <span>{likes}</span>
      </button>
      <button
        onClick={handleDislike}
        className={`flex items-center space-x-1 ${
          userLikeStatus === "dislike" ? "text-red-500" : "text-gray-500"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
        </svg>
        <span>{dislikes}</span>
      </button>
    </div>
  );
};

export default LikeButton;
