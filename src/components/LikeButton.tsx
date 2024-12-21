import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../configs/firebase';
import { useAuth } from '../contexts/AuthContexts';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface LikeButtonProps {
  articleId: string;
  initialLikes: number;
  initialDislikes: number;
}

const LikeButton: React.FC<LikeButtonProps> = ({ articleId, initialLikes, initialDislikes }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userAction, setUserAction] = useState<'like' | 'dislike' | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserAction = async () => {
      if (user) {
        const actionDoc = await getDoc(doc(db, 'articles', articleId, 'userActions', user.uid));
        if (actionDoc.exists()) {
          setUserAction(actionDoc.data().action);
        }
      }
    };
    fetchUserAction();
  }, [articleId, user]);

  const handleAction = async (action: 'like' | 'dislike') => {
    if (!user) return;

    const articleRef = doc(db, 'articles', articleId);
    const userActionRef = doc(db, 'articles', articleId, 'userActions', user.uid);

    let likesChange = 0;
    let dislikesChange = 0;

    if (userAction === action) {
      // User is undoing their previous action
      if (action === 'like') {
        likesChange = -1;
      } else {
        dislikesChange = -1;
      }
      await setDoc(userActionRef, { action: null });
      setUserAction(null);
    } else {
      // User is performing a new action or changing their previous action
      if (action === 'like') {
        likesChange = 1;
        if (userAction === 'dislike') {
          dislikesChange = -1;
        }
      } else {
        dislikesChange = 1;
        if (userAction === 'like') {
          likesChange = -1;
        }
      }
      await setDoc(userActionRef, { action });
      setUserAction(action);
    }

    // Update the article document
    await updateDoc(articleRef, {
      likes: likes + likesChange,
      dislikes: dislikes + dislikesChange
    });

    // Update local state
    setLikes(likes + likesChange);
    setDislikes(dislikes + dislikesChange);
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => handleAction('like')}
        className={`flex items-center space-x-1 ${userAction === 'like' ? 'text-blue-500' : 'text-gray-500'}`}
        disabled={!user}
      >
        <ThumbsUp className="h-5 w-5" />
        <span>{likes}</span>
      </button>
      <button
        onClick={() => handleAction('dislike')}
        className={`flex items-center space-x-1 ${userAction === 'dislike' ? 'text-red-500' : 'text-gray-500'}`}
        disabled={!user}
      >
        <ThumbsDown className="h-5 w-5" />
        <span>{dislikes}</span>
      </button>
    </div>
  );
};

export default LikeButton;

