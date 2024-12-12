import React, { useEffect, useContext, useState } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../configs/firebase";
import { useAuth } from "../contexts/AuthContexts";

interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

interface CommentSectionProps {
  articleId: string;
}
const CommentSection: React.FC<CommentSectionProps> = ({ articleId }) => {
  const [comment, setComment] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const commentsRef = collection(db, "article", articleId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          } as Comment)
      );
      setComment(fetchedComments);
    });
    return () => unsubscribe();
  }, [articleId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    try {
      await addDoc(collection(db, "articles", articleId, "comments"), {
        text: newComment.trim(),
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        createdAdt: new Date(),
      });
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Write a comment..."
            rows={3}
          />
          <button
            type="submit"
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Post Comment
          </button>
        </form>
      ) : (
        <p className="mb-4">Please log in to comment.</p>
      )}
      <div className="space-y-4">
        {comment.map((comment) => (
          <div key={comment.id} className="bg-gray-100 p-3 rounded">
            <p className="font-semibold">{comment.userName}</p>
            <p>{comment.text}</p>
            <p className="text-sm text-gray-500">
              {comment.createdAt.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default CommentSection;
