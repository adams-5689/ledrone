import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  doc as firestoreDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../configs/firebase";
import NewsArticle from "../components/NewsArticle";
import CategoryList from "../components/CategoryList";
import { useAuth } from "../contexts/AuthContexts";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  categoryId: string; // Changed from category to categoryId
  categoryName?: string; // Added to store the category name
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

  const fetchCategories = async () => {
    try {
      const categoriesCollection = collection(db, "categories");
      const querySnapshot = await getDocs(categoriesCollection);
      const fetchedCategories = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      console.log("Fetched categories:", fetchedCategories);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const articlesCollection = collection(db, "articles");
      let articlesQuery;

      if (selectedCategory) {
        console.log("Fetching articles for category:", selectedCategory);
        articlesQuery = query(
          articlesCollection,
          where("categoryId", "==", selectedCategory), // Changed from category to categoryId
          orderBy("date", "desc"),
          limit(10)
        );
      } else {
        articlesQuery = query(
          articlesCollection,
          orderBy("date", "desc"),
          limit(10)
        );
      }

      const querySnapshot = await getDocs(articlesQuery);

      // Fetch and map category names to articles
      const fetchedArticles = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const articleData = doc.data();
          let categoryName = "";
          console.log("Article Data:", articleData);

          if (articleData.categoryId) {
            try {
              const categoryDoc = await getDoc(
                firestoreDoc(db, "categories", articleData.categoryId)
              );
              if (categoryDoc.exists()) {
                categoryName = categoryDoc.data().name;
                console.log("Category Name found:", categoryName);
              }
            } catch (error) {
              console.error("Error fetching category:", error);
            }
          }

          return {
            id: doc.id,
            ...articleData,
            categoryName,
          } as Article;
        })
      );

      console.log("Fetched articles with categories:", fetchedArticles);
      setArticles(fetchedArticles);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  const handleCategorySelect = (categoryId: string | null) => {
    console.log("Category selected:", categoryId);
    setSelectedCategory(categoryId);
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
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

        {articles.length > 0 ? (
          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.id}>
                <div className="text-sm text-gray-500 mb-2">
                  Category: {article.categoryName || "Uncategorized"}
                </div>
                <NewsArticle {...article} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No articles found in this category.
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;
