import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../configs/firebase";
import { useAuth } from "../contexts/AuthContexts";


interface FavoriteButtonProps {
  articleId: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ articleId }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user) {
        const favoriteDoc = await getDoc(doc(db, 'users', user.uid, 'favorites', articleId));
        setIsFavorite(favoriteDoc.exists());
      }
    };
    checkFavoriteStatus();
  }, [articleId, user]);

  const toggleFavorite = async () => {
    if (!user) return;

    const favoriteRef = doc(db, 'users', user.uid, 'favorites', articleId);

    if (isFavorite) {
      await deleteDoc(favoriteRef);
    } else {
      await setDoc(favoriteRef, { articleId });
    }

    setIsFavorite(!isFavorite);
  };

  if (!user) return null;

  return (
    <button
      onClick={toggleFavorite}
      className={`flex items-center space-x-1 ${isFavorite ? 'text-yellow-500' : 'text-gray-500'}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
    </button>
  );
};

export default FavoriteButton;
