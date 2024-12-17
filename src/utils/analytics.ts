import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../configs/firebase";

export const getPageViewsForLastNDays = async (n: number) => {
  const now = new Date();
  const nDaysAgo = new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  const pageViewsRef = collection(db, "pageViews");
  const q = query(
    pageViewsRef,
    where("timestamp", ">=", Timestamp.fromDate(nDaysAgo))
  );

  const snapshot = await getDocs(q);

  const pageViews: { [date: string]: number } = {};
  snapshot.forEach((doc) => {
    const date = doc.data().timestamp.toDate().toISOString().split("T")[0];
    pageViews[date] = (pageViews[date] || 0) + 1;
  });

  return pageViews;
};

export const getUserActionsForLastNDays = async (
  n: number,
  actionType: string
) => {
  const now = new Date();
  const nDaysAgo = new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  const userActionsRef = collection(db, "userActions");
  const q = query(
    userActionsRef,
    where("timestamp", ">=", Timestamp.fromDate(nDaysAgo)),
    where("actionType", "==", actionType)
  );

  const snapshot = await getDocs(q);

  const actions: { [date: string]: number } = {};
  snapshot.forEach((doc) => {
    const date = doc.data().timestamp.toDate().toISOString().split("T")[0];
    actions[date] = (actions[date] || 0) + 1;
  });

  return actions;
};
