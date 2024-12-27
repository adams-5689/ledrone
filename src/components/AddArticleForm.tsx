import React, { useState, useEffect, ChangeEvent } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../configs/firebase";
import { useAuth } from "../contexts/AuthContexts";
import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  comments: number;
  scope: string;
  tags: string[];
  imageUrl?: string;
  videoUrl?: string;
}

interface AddArticleFormProps {
  onArticleAdded: (newArticle: Article) => void;
}

const AddArticleForm: React.FC<AddArticleFormProps> = ({ onArticleAdded }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [scope, setScope] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const fetchedCategories = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setCategories(fetchedCategories);
      } catch (err) {
        console.error("Erreur lors de la récupération des catégories:", err);
        setError("Erreur lors de la récupération des catégories");
      }
    };

    fetchCategories();
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideo(e.target.files[0]);
    }
  };

  const handleTagChange = (e: ChangeEvent<HTMLInputElement>) => {
    const tagArray = e.target.value.split(",").map((tag) => tag.trim());
    setTags(tagArray);
  };

  const uploadFile = async (file: File, path: string) => {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (err) {
      console.error("Erreur lors de l'upload du fichier:", err);
      throw new Error("Erreur lors de l'upload du fichier");
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("");
    setScope("");
    setTags([]);
    setImage(null);
    setVideo(null);
    setError(null);
    setLoading(false); // Assurez-vous que l'état de chargement est réinitialisé
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Début de la soumission du formulaire");

    if (!user) {
      setError("Vous devez être connecté pour ajouter un article");
      return;
    }

    if (!title || !content || !category) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Préparation des données de l'article...");
      let imageUrl = "";
      let videoUrl = "";

      if (image) {
        console.log("Upload de l'image...");
        imageUrl = await uploadFile(
          image,
          `articles/${Date.now()}_${image.name}`
        );
      }

      if (video) {
        console.log("Upload de la vidéo...");
        videoUrl = await uploadFile(
          video,
          `articles/${Date.now()}_${video.name}`
        );
      }

      // Chercher le nom de la catégorie directement
      const selectedCategory = categories.find((cat) => cat.id === category);
      const categoryName = selectedCategory
        ? selectedCategory.name
        : "Non spécifiée";

      const articleData = {
        title,
        content,
        category: categoryName, // Utilisation du nom de la catégorie ici
        scope,
        tags,
        author: user.displayName || user.email || "Anonyme",
        date: new Date().toISOString(),
        imageUrl,
        videoUrl,
        likes: 0,
        views: 0,
        comments: 0,
      };

      console.log("Données de l'article préparées:", articleData);
      console.log("Ajout de l'article à Firestore...");

      const docRef = await addDoc(collection(db, "articles"), articleData);
      console.log("Article ajouté avec succès, ID:", docRef.id);

      const newArticle = {
        id: docRef.id,
        ...articleData,
      };

      onArticleAdded(newArticle);
      resetForm();
      console.log("Formulaire réinitialisé avec succès");
    } catch (e) {
      console.error("Erreur détaillée lors de l'ajout de l'article:", e);
      setError(`Une erreur est survenue lors de l'ajout de l'article: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-6"
    >
      <h2 className="text-2xl font-bold mb-4">Ajouter un nouvel article</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="title"
        >
          Titre *
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="title"
          type="text"
          placeholder="Titre de l'article"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="category"
        >
          Catégorie *
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Sélectionnez une catégorie</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="scope"
        >
          Portée
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="scope"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
        >
          <option value="">Sélectionnez la portée</option>
          <option value="national">National</option>
          <option value="regional">Régional</option>
          <option value="sub-regional">Sub-régional</option>
          <option value="international">International</option>
        </select>
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="tags"
        >
          Tags (séparés par des virgules)
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="tags"
          type="text"
          placeholder="Entrez les tags, séparés par des virgules"
          value={tags.join(", ")}
          onChange={handleTagChange}
        />
      </div>

      <div className="mb-6">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="content"
        >
          Contenu *
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          id="content"
          placeholder="Contenu de l'article"
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="image"
        >
          Image
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>

      <div className="mb-6">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="video"
        >
          Vidéo
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="video"
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
        />
      </div>

      <div className="flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Ajout en cours...
            </div>
          ) : (
            "Ajouter l'article"
          )}
        </motion.button>
      </div>
    </motion.form>
  );
};

export default AddArticleForm;
