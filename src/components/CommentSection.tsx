import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../configs/firebase";
import { useAuth } from "../contexts/AuthContexts";

interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: Timestamp;
}

interface CommentSectionProps {
  articleId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ articleId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const commentsRef = collection(db, "articles", articleId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedComments = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Comment)
        );
        setComments(fetchedComments);
      },
      (error) => {
        console.error(
          "Erreur lors de la récupération des commentaires:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, [articleId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      await addDoc(collection(db, "articles", articleId, "comments"), {
        text: newComment.trim(),
        userId: user.uid,
        userName: user.email || "Anonyme",
        createdAt: serverTimestamp(),
      });
      setNewComment("");
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Commentaires</h3>
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Écrivez un commentaire..."
            rows={3}
          />
          <button
            type="submit"
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Poster le commentaire
          </button>
        </form>
      ) : (
        <p className="mb-4">Veuillez vous connecter pour commenter.</p>
      )}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-100 p-3 rounded">
            <p className="font-semibold">{comment.userName}</p>
            <p>{comment.text}</p>
            <p className="text-sm text-gray-500">
              {comment.createdAt && comment.createdAt.toDate
                ? comment.createdAt.toDate().toLocaleString()
                : "Date non disponible"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
