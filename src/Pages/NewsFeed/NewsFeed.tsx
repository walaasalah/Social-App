import axios from "axios";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import toast from "react-hot-toast";
import PostCard from "../../Components/PostCard/PostCard";
import Sidebar from "../../Components/Sidebar/Sidebar";
import SuggestedFriends from "../../Components/SuggestedFriends/SuggestedFriends";
import PostSkelton from "../../Components/PostCard/PostSkelton";
import CreatePoste from "../../Components/PostCard/CreatePoste";
import { GetUserFeed } from "../../Services/Feed.service";
import type { PostCardInterface } from "../../types/PostCardType";
import { UserContext } from "../../Components/Context/UserContext";
import { GetMyPosts, GetSavedPosts } from "../../Services/Profile.services";

export default function NewsFeed() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "feed";
  const user = useContext(UserContext)?.UserDetails;
  const userId = user?._id || user?.id;
  const bookmarksKey = JSON.stringify(user?.bookmarks ?? []);
  const latestRequest = useRef(0);
  const [posts, setPosts] = useState<PostCardInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPosts = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setIsLoading(true);
    setError("");
    try {
      if (!userId) return;
      let items: PostCardInterface[];
      if (view === "posts") {
        items = await GetMyPosts();
      } else if (view === "saved") {
        items = await GetSavedPosts(JSON.parse(bookmarksKey));
      } else {
        const response = await GetUserFeed();
        items = response.data.posts;
        if (view === "community") {
          items = items.filter((post) => post.user._id !== userId && post.privacy === "public");
        }
      }
      if (requestId === latestRequest.current) setPosts(items);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : null;
      if (requestId === latestRequest.current) {
        const errorMessage = message || "Could not load posts. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      if (requestId === latestRequest.current && userId) setIsLoading(false);
    }
  }, [view, userId, bookmarksKey]);

  useEffect(() => {
    void loadPosts();
    return () => { latestRequest.current++; };
  }, [loadPosts]);

  function removePost(postId: string) {
    setPosts((currentPosts) =>
      currentPosts.filter((post) => post._id !== postId),
    );
  }

  function updatePost(updatedPost: PostCardInterface) {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post._id === updatedPost._id ? updatedPost : post,
      ),
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_320px] xl:gap-6">
        <div className="min-w-0">
          <Sidebar />
        </div>
        <div className="min-w-0">
          <CreatePoste GetAllPosts={loadPosts} />
          {isLoading ? (
            <PostSkelton />
          ) : error ? (
            <div role="alert" className="rounded-2xl bg-white p-5 text-sm text-red-600">
              {error}
              <button type="button" onClick={() => { void loadPosts(); }} className="ml-2 font-semibold underline">Retry</button>
            </div>
          ) : posts.length === 0 ? (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500">
              {view === "saved" ? "You have no saved posts." : view === "posts" ? "You have not posted yet." : "No posts to display."}
            </p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDeleted={removePost}
                onUpdated={(updated) => {
                  if (view === "saved" && !updated.bookmarked) removePost(updated._id);
                  else updatePost(updated);
                }}
              />
            ))
          )}
        </div>
        <div className="min-w-0 lg:col-start-2 xl:col-start-auto">
          <SuggestedFriends />
        </div>
      </div>
    </div>
  );
}
