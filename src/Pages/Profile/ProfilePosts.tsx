import { useCallback, useEffect } from "react";
import { Link } from "react-router";
import { Clock3, MessageCircle, Share2, ThumbsUp } from "lucide-react";
import moment from "moment";
import { GetMyPosts, GetSavedPosts } from "../../Services/Profile.services";
import type { PostCardInterface } from "../../types/PostCardType";
import useGet from "../../hooks/useGet";

export default function ProfilePosts({
  tab,
  userId,
  bookmarksKey,
  onCount,
}: {
  tab: "posts" | "saved";
  userId: string;
  bookmarksKey: string;
  onCount: (count: number) => void;
}) {
  const fetchPosts = useCallback(async () => {
    if (tab === "saved") {
      const bookmarkIds: string[] = JSON.parse(bookmarksKey);
      return GetSavedPosts(bookmarkIds);
    }

    const posts = await GetMyPosts();
    return posts.filter((post) => post.user._id === userId);
  }, [tab, userId, bookmarksKey]);
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useGet<PostCardInterface[]>(fetchPosts);
  const posts = data ?? [];

  useEffect(() => {
    if (tab === "posts" && data) onCount(data.length);
  }, [tab, data, onCount]);

  if (loading)
    return (
      <div role="status" className="mt-4 space-y-4">
        <span className="sr-only">Loading posts...</span>
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-40 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  if (error)
    return (
      <div
        role="alert"
        className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-red-600"
      >
        {error}
        <button
          type="button"
          onClick={refetch}
          className="ml-2 font-bold underline"
        >
          Retry
        </button>
      </div>
    );
  if (!posts.length)
    return (
      <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        {tab === "posts"
          ? "You have not posted yet."
          : "You have no saved posts."}
      </p>
    );

  return (
    <div className="mt-4 space-y-4">
      {posts.map((post) => (
        <article
          key={post._id}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <header className="flex items-center gap-3 px-5 py-4">
            <img
              src={post.user.photo}
              alt=""
              className="size-10 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">
                {post.user.name}
              </p>
              <p className="truncate text-xs text-slate-500">
                @{post.user.username?.replace(/^@/, "")}
              </p>
            </div>
            <Link
              to={`/posts/${post._id}`}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View details
            </Link>
          </header>
          {post.body && (
            <p className="whitespace-pre-wrap break-words px-5 pb-5 text-sm leading-6 text-slate-800">
              {post.body}
            </p>
          )}
          {post.image && (
            <div className="bg-slate-950">
              <img
                src={post.image}
                alt="Post attachment"
                className="mx-auto max-h-[560px] w-full object-contain"
              />
            </div>
          )}
          {post.isShare && post.sharedPost && (
            <div className="mx-5 mb-4 rounded-xl border border-slate-200 p-3">
              <p className="text-sm font-bold">{post.sharedPost.user.name}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm">
                {post.sharedPost.body}
              </p>
              {post.sharedPost.image && (
                <img
                  src={post.sharedPost.image}
                  alt="Shared post attachment"
                  className="mt-2 max-h-80 w-full object-contain"
                />
              )}
            </div>
          )}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 text-xs text-slate-600">
            <div className="flex flex-wrap gap-4">
              <span className="inline-flex items-center gap-1.5">
                <ThumbsUp size={14} className="text-blue-500" />
                {post.likesCount ?? post.likes?.length ?? 0} likes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Share2 size={14} className="text-blue-500" />
                {post.sharesCount ?? 0} shares
              </span>
              <Link
                to={`/posts/${post._id}`}
                className="inline-flex items-center gap-1.5 hover:text-blue-600"
              >
                <MessageCircle size={14} className="text-blue-500" />
                {post.commentsCount ?? 0} comments
              </Link>
            </div>
            <time
              dateTime={post.createdAt}
              className="inline-flex items-center gap-1.5"
            >
              <Clock3 size={13} />
              {moment(post.createdAt).format("D MMM, HH:mm")}
            </time>
          </footer>
        </article>
      ))}
    </div>
  );
}
