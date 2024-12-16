import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContexts";
import { db } from "../configs/firebase";
import StatisticsCard from "../components/StatisticsCard";
import AdminChart from "../components/AdminChart";
import {
  UserIcon,
  NewspaperIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  ChatIcon,
  ThumbUpIcon,
  ClockIcon,
} from "@heroicons/react/outline";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getPageViewsForLastNDays,
  getUserActionsForLastNDays,
} from "../utils/analytics";
import AddArticleForm from "../components/AddArticleForm";
import ListingForm from "../components/ListingForm";
import PollForm from "../components/PollForm";

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
  videoUrl?: string;
  tags?: string[];
}

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  createdAt: Date;
  views: number;
}

interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
}

interface Statistics {
  totalUsers: number;
  totalArticles: number;
  totalListings: number;
  totalPolls: number;
  totalComments: number;
  totalLikes: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
}

interface DetailedStatistics {
  articleViewsPerDay: { [date: string]: number };
  listingViewsPerDay: { [date: string]: number };
  userRegistrationsPerDay: { [date: string]: number };
  commentsPerDay: { [date: string]: number };
  likesPerDay: { [date: string]: number };
}

const Admin: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalUsers: 0,
    totalArticles: 0,
    totalListings: 0,
    totalPolls: 0,
    totalComments: 0,
    totalLikes: 0,
    dailyActiveUsers: 0,
    monthlyActiveUsers: 0,
    averageSessionDuration: 0,
  });
  const [detailedStatistics, setDetailedStatistics] =
    useState<DetailedStatistics>({
      articleViewsPerDay: {},
      listingViewsPerDay: {},
      userRegistrationsPerDay: {},
      commentsPerDay: {},
      likesPerDay: {},
    });
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      // Fetch articles, listings, and polls
      const articlesSnapshot = await db.collection("articles").get();
      const fetchedArticles = articlesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Article[];
      setArticles(fetchedArticles);

      const listingsSnapshot = await db.collection("listings").get();
      const fetchedListings = listingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Listing[];
      setListings(fetchedListings);

      const pollsSnapshot = await db.collection("polls").get();
      const fetchedPolls = pollsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Poll[];
      setPolls(fetchedPolls);

      // Fetch basic statistics
      const usersCount = (await db.collection("users").get()).size;
      const articlesCount = articlesSnapshot.size;
      const listingsCount = listingsSnapshot.size;
      const pollsCount = pollsSnapshot.size;

      let totalComments = 0;
      let totalLikes = 0;

      for (const article of fetchedArticles) {
        const commentsSnapshot = await db
          .collection("articles")
          .doc(article.id)
          .collection("comments")
          .get();
        totalComments += commentsSnapshot.size;
        totalLikes += article.likes || 0;
      }

      // Fetch detailed statistics
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const userSnapshot = await db
        .collection("users")
        .where("lastLogin", ">=", thirtyDaysAgo)
        .get();

      const dailyActiveUsers = userSnapshot.docs.filter(
        (doc) =>
          doc.data().lastLogin >= new Date(now.getTime() - 24 * 60 * 60 * 1000)
      ).length;

      const monthlyActiveUsers = userSnapshot.size;

      // This is a placeholder. In a real app, you'd need to track session durations
      const averageSessionDuration = 15; // minutes

      setStatistics({
        totalUsers: usersCount,
        totalArticles: articlesCount,
        totalListings: listingsCount,
        totalPolls: pollsCount,
        totalComments,
        totalLikes,
        dailyActiveUsers,
        monthlyActiveUsers,
        averageSessionDuration,
      });

      // Fetch detailed statistics
      const pageViews = await getPageViewsForLastNDays(30);
      const userRegistrations = await getUserActionsForLastNDays(
        30,
        "registration"
      );
      const commentActions = await getUserActionsForLastNDays(30, "comment");
      const likeActions = await getUserActionsForLastNDays(30, "like");

      setDetailedStatistics({
        articleViewsPerDay: pageViews,
        listingViewsPerDay: {}, // You might want to implement this separately
        userRegistrationsPerDay: userRegistrations,
        commentsPerDay: commentActions,
        likesPerDay: likeActions,
      });
    };

    fetchData();
  }, [user, isAdmin, navigate]);

  const handleDeleteArticle = async (id: string) => {
    await db.collection("articles").doc(id).delete();
    setArticles(articles.filter((article) => article.id !== id));
  };

  const handleDeleteListing = async (id: string) => {
    await db.collection("listings").doc(id).delete();
    setListings(listings.filter((listing) => listing.id !== id));
  };

  const handleDeletePoll = async (id: string) => {
    await db.collection("polls").doc(id).delete();
    setPolls(polls.filter((poll) => poll.id !== id));
  };

  const handleArticleAdded = (newArticle: Article) => {
    setArticles([newArticle, ...articles]);
  };

  const handleListingAdded = (newListing: Listing) => {
    setListings([newListing, ...listings]);
  };

  const handlePollAdded = (newPoll: Poll) => {
    setPolls([newPoll, ...polls]);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Statistics</TabsTrigger>
          <TabsTrigger value="content">Content Management</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Overview Statistics</CardTitle>
              <CardDescription>Key metrics for your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatisticsCard
                  title="Total Users"
                  value={statistics.totalUsers}
                  icon={<UserIcon className="h-6 w-6" />}
                />
                <StatisticsCard
                  title="Total Articles"
                  value={statistics.totalArticles}
                  icon={<NewspaperIcon className="h-6 w-6" />}
                />
                <StatisticsCard
                  title="Total Listings"
                  value={statistics.totalListings}
                  icon={<ShoppingBagIcon className="h-6 w-6" />}
                />
                <StatisticsCard
                  title="Total Polls"
                  value={statistics.totalPolls}
                  icon={<ChartBarIcon className="h-6 w-6" />}
                />
                <StatisticsCard
                  title="Total Comments"
                  value={statistics.totalComments}
                  icon={<ChatIcon className="h-6 w-6" />}
                />
                <StatisticsCard
                  title="Total Likes"
                  value={statistics.totalLikes}
                  icon={<ThumbUpIcon className="h-6 w-6" />}
                />
                <StatisticsCard
                  title="Daily Active Users"
                  value={statistics.dailyActiveUsers}
                  icon={<UserIcon className="h-6 w-6" />}
                />
                <StatisticsCard
                  title="Monthly Active Users"
                  value={statistics.monthlyActiveUsers}
                  icon={<UserIcon className="h-6 w-6" />}
                />
                <StatisticsCard
                  title="Avg. Session Duration"
                  value={`${statistics.averageSessionDuration} min`}
                  icon={<ClockIcon className="h-6 w-6" />}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="detailed">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Statistics</CardTitle>
              <CardDescription>
                In-depth analytics for the past 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdminChart
                  data={Object.values(detailedStatistics.articleViewsPerDay)}
                  labels={Object.keys(detailedStatistics.articleViewsPerDay)}
                  title="Article Views per Day"
                />
                <AdminChart
                  data={Object.values(detailedStatistics.listingViewsPerDay)}
                  labels={Object.keys(detailedStatistics.listingViewsPerDay)}
                  title="Listing Views per Day"
                />
                <AdminChart
                  data={Object.values(
                    detailedStatistics.userRegistrationsPerDay
                  )}
                  labels={Object.keys(
                    detailedStatistics.userRegistrationsPerDay
                  )}
                  title="User Registrations per Day"
                />
                <AdminChart
                  data={Object.values(detailedStatistics.commentsPerDay)}
                  labels={Object.keys(detailedStatistics.commentsPerDay)}
                  title="Comments per Day"
                />
                <AdminChart
                  data={Object.values(detailedStatistics.likesPerDay)}
                  labels={Object.keys(detailedStatistics.likesPerDay)}
                  title="Likes per Day"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>
                Manage articles, listings, and polls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="articles">
                <TabsList>
                  <TabsTrigger value="articles">Articles</TabsTrigger>
                  <TabsTrigger value="listings">Listings</TabsTrigger>
                  <TabsTrigger value="polls">Polls</TabsTrigger>
                </TabsList>
                <TabsContent value="articles">
                  <div className="space-y-4">
                    <AddArticleForm
                      onArticleAdded={handleArticleAdded}
                      categories={[]}
                    />
                    {articles.map((article) => (
                      <div
                        key={article.id}
                        className="bg-white p-4 rounded shadow flex justify-between items-center"
                      >
                        <div>
                          <h3 className="text-xl font-semibold">
                            {article.title}
                          </h3>
                          <p className="text-gray-600">{article.category}</p>
                          <p className="text-sm text-gray-500">
                            Views: {article.views} | Likes: {article.likes} |
                            Comments: {article.comments}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleDeleteArticle(article.id)}
                          variant="destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="listings">
                  <div className="space-y-4">
                    <ListingForm onListingAdded={handleListingAdded} />
                    {listings.map((listing) => (
                      <div
                        key={listing.id}
                        className="bg-white p-4 rounded shadow flex justify-between items-center"
                      >
                        <div>
                          <h3 className="text-xl font-semibold">
                            {listing.title}
                          </h3>
                          <p className="text-gray-600">
                            {listing.category} - ${listing.price}
                          </p>
                          <p className="text-sm text-gray-500">
                            Views: {listing.views}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleDeleteListing(listing.id)}
                          variant="destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="polls">
                  <div className="space-y-4">
                    <PollForm onPollAdded={handlePollAdded} />
                    {polls.map((poll) => (
                      <div
                        key={poll.id}
                        className="bg-white p-4 rounded shadow flex justify-between items-center"
                      >
                        <div>
                          <h3 className="text-xl font-semibold">
                            {poll.question}
                          </h3>
                          <ul className="list-disc list-inside">
                            {poll.options.map((option) => (
                              <li key={option.id}>
                                {option.text} - {option.votes} votes
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button
                          onClick={() => handleDeletePoll(poll.id)}
                          variant="destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
