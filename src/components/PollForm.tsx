import React, { useState } from "react";
import { db } from "../configs/firebase";
import { useAuth } from "../contexts/AuthContexts";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { collection, addDoc } from "firebase/firestore";

interface PollFormProps {
  onPollAdded: (newPoll: any) => void;
}

const PollForm: React.FC<PollFormProps> = ({ onPollAdded }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const pollsCollection = collection(db, "polls"); // Récupère la référence à la collection "polls"
      const pollRef = await addDoc(pollsCollection, {
        question,
        options: options.map((option) => ({ text: option, votes: 0 })),
        createdAt: new Date().toISOString(),
        userId: user.uid,
      });
      const newPoll = {
        id: pollRef.id,
        question,
        options: options.map((option) => ({
          id: Math.random().toString(36).substr(2, 9),
          text: option,
          votes: 0,
        })),
      };
      onPollAdded(newPoll);
      setQuestion("");
      setOptions(["", ""]);
    } catch (error) {
      console.error("Error adding poll:", error);
    }
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        placeholder="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        required
      />
      {options.map((option, index) => (
        <Input
          key={index}
          type="text"
          placeholder={`Option ${index + 1}`}
          value={option}
          onChange={(e) => {
            const newOptions = [...options];
            newOptions[index] = e.target.value;
            setOptions(newOptions);
          }}
          required
        />
      ))}
      <Button type="button" onClick={addOption}>
        Add Option
      </Button>
      <Button type="submit">Create Poll</Button>
    </form>
  );
};

export default PollForm;
