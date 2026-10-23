import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import PostCard from "../../Components/PostCard/PostCard";
import PostSkelton from "../../Components/PostCard/PostSkelton";
import type { PostCardInterface } from "../../types/PostCardType";
import { GetSinglePost } from "../../Services/Post.service";

export default function PostDetails() {
  const { postId } = useParams();
  const [post, setPost] = useState<PostCardInterface | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      // setIsLoading(true);
      try {
        const { data } = await GetSinglePost(postId!);
        setPost(data.data?.post ?? data.post);
        setError(null);
      } catch {
        setPost(null);
        setError("Could not load this post. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPost();
  }, [postId]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        to="/Feed"
        className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back
      </Link>
      {isLoading && <PostSkelton count={1} />}
      {!isLoading && error && (
        <p
          role="alert"
          className="rounded-xl bg-white p-4 text-sm text-red-600"
        >
          {error}
        </p>
      )}
      {!isLoading && post && <PostCard key={post._id} post={post} isDetails />}
    </div>
  );
}
