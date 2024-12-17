import React, { useState } from "react";
import { db } from "../configs/firebase";
import { useAuth } from "../contexts/AuthContexts";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { addDoc, collection } from "firebase/firestore";
import { Button } from "./ui/button";

interface ListingFormProps {
  onListingAdded: (newListing: any) => void;
}

const ListingForm: React.FC<ListingFormProps> = ({ onListingAdded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const listingRef = await addDoc(collection(db, "listings"), {
        title,
        description,
        price: parseFloat(price),
        category,
        createdAt: new Date().toISOString(),
        userId: user.uid,
        views: 0,
      });

      const newListing = {
        id: listingRef.id,
        title,
        description,
        price: parseFloat(price),
        category,
        createdAt: new Date(),
        views: 0,
      };

      onListingAdded(newListing);
      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("");
    } catch (error) {
      console.error("Error adding listing:", error);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <Input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <Input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />
      <Button type="submit">Create Listing</Button>
    </form>
  );
};

export default ListingForm;
