import React, { useState, useEffect, ChangeEvent } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../configs/firebase';
import { useAuth } from '../contexts/AuthContexts';
import { motion } from 'framer-motion';

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
  imageUrl: string;
  videoUrl: string;
}

interface AddArticleFormProps {
  onArticleAdded: (newArticle: Article) => void;
}

const AddArticleForm: React.FC<AddArticleFormProps> = ({ onArticleAdded }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [scope, setScope] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const fetchedCategories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
      setCategories(fetchedCategories);
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
    const tagArray = e.target.value.split(',').map(tag => tag.trim());
    setTags(tagArray);
  };

  const uploadFile = async (file: File, path: string) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let imageUrl = '';
      let videoUrl = '';

      if (image) {
        imageUrl = await uploadFile(image, `articles/${Date.now()}_${image.name}`);
      }

      if (video) {
        videoUrl = await uploadFile(video, `articles/${Date.now()}_${video.name}`);
      }

      const docRef = await addDoc(collection(db, 'articles'), {
        title,
        content,
        category,
        scope,
        tags,
        author: user.displayName || user.email || 'Anonymous',
        date: new Date().toISOString(),
        imageUrl,
        videoUrl,
        likes: 0,
        views: 0,
        comments: 0,
      });

      const newArticle = {
        id: docRef.id,
        title,
        content,
        category,
        author: user.displayName || user.email || 'Anonymous',
        date: new Date().toISOString(),
        views: 0,
        likes: 0,
        comments: 0,
        scope,
        tags,
        imageUrl,
        videoUrl
      };

      onArticleAdded(newArticle);

      setTitle('');
      setContent('');
      setCategory('');
      setScope('');
      setTags([]);
      setImage(null);
      setVideo(null);
    } catch (error) {
      console.error('Error adding article: ', error);
      alert('Failed to add article');
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
      <h2 className="text-2xl font-bold mb-4">Add New Article</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
          Title
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="title"
          type="text"
          placeholder="Article Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
          Category
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="scope">
          Scope
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="scope"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          required
        >
          <option value="">Select scope</option>
          <option value="national">National</option>
          <option value="regional">Regional</option>
          <option value="sub-regional">Sub-regional</option>
          <option value="international">International</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tags">
          Tags (comma-separated)
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="tags"
          type="text"
          placeholder="Enter tags, separated by commas"
          value={tags.join(', ')}
          onChange={handleTagChange}
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
          Content
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          id="content"
          placeholder="Article Content"
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
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
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="video">
          Video
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
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Adding Article...' : 'Add Article'}
        </motion.button>
      </div>
    </motion.form>
  );
};

export default AddArticleForm;

