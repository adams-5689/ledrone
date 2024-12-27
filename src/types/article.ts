export interface Article {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  author: string;
  date: string;
  tags: string[];
  likes: number;
  dislikes: number;
  imageUrl?: string;
  videoUrl?: string;
  scope: string;
}
