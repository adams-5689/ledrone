import React from "react";
import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
}

interface CategoryListProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-3">Catégories</h2>
      <div className="flex flex-wrap gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-full ${
            selectedCategory === null
              ? "bg-orange-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => onSelectCategory(null)}
        >
          Toutes
        </motion.button>
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === category.id
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => onSelectCategory(category.id)}
          >
            {category.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
