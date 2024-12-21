import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../configs/firebase';
import NewsArticle from '../components/NewsArticle';
import AddArticleForm from '../components/AddArticleForm';
import CategoryList from '../components/CategoryList';
import { useAuth } from '../contexts/AuthContexts';
import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button"

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
  comments: number;
}

interface Category {
  id: string;
  name: string;
}

const Home: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  const fetchArticles = async () => {
    setLoading(true);
    const articlesCollection = collection(db, 'articles');
    let articlesQuery = query(articlesCollection, orderBy('date', 'desc'), limit(10));

    if (selectedCategory) {
      articlesQuery = query(
        articlesCollection, 
        where('category', '==', selectedCategory), 
        orderBy('date', 'desc'), 
        limit(10)
      );
    }

    const querySnapshot = await getDocs(articlesQuery);
    const fetchedArticles = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Article));
    setArticles(fetchedArticles);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const categoriesCollection = collection(db, 'categories');
    const querySnapshot = await getDocs(categoriesCollection);
    const fetchedCategories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name
    }));
    setCategories(fetchedCategories);
  };

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, [selectedCategory]);

  const handleArticleAdded = (newArticle: Article) => {
    setArticles([newArticle, ...articles]);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to AgoraNews</h1>
      
      {isAdmin && (
        <div className="mb-6">
          <Link to="/admin">
            <Button variant="outline">Go to Admin Dashboard</Button>
          </Link>
        </div>
      )}

      <CategoryList
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Latest News</h2>
        {articles.map(article => (
          <NewsArticle key={article.id} {...article} />
        ))}
      </div>
    </div>
  );
};

export default Home;

