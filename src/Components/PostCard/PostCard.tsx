import axios from "axios";
import toast from "react-hot-toast";
import { DeletePost, TogglePostBookmark } from "../../Services/Post.service";
import EditPost from "./EditPost";
import { useContext, useRef, useState } from "react";
import {
  Bookmark,
  Globe2,
  Heart,
  LockKeyhole,
  MessageCircle,
  MoreHorizontal,
  Share2,
  TriangleAlert,
  UsersRound,
  X,
} from "lucide-react";
import { GetAllPostComments } from "../../Services/Comments.service.ts";
import type { TopComment, PostCardInterface } from "../../types/PostCardType";
import moment from "moment";
import { Link, useNavigate } from "react-router";
import PostComment from "./PostComment.tsx";
import CommentItem from "./CommentItem";
import { Button, Dropdown, Label, Modal } from "@heroui/react";
import { UserContext } from "../Context/UserContext.tsx";

export default function PostCard({
  post: originalPost,
  isDetails = false,
  onDeleted,
  onUpdated,
}: {
  post: PostCardInterface;
  isDetails?: boolean;
  onDeleted?: (id: string) => void;
  onUpdated?: (post: PostCardInterface) => void;
}) {
  const [updatedPost, setUpdatedPost] = useState<PostCardInterface | null>(
    null,
  );
  const post = updatedPost ?? originalPost;
  const [editingPost, setEditingPost] = useState(false);
  const [confirmDeletePost, setConfirmDeletePost] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [postError, setPostError] = useState("");
  const deletePending = useRef(false);
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<TopComment[]>(
    post.topComment ? [post.topComment] : [],
  );
  const [showAllComments, setShowAllComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [addedComments, setAddedComments] = useState(0);
  const userContext = useContext(UserContext);
  const UserDetails = userContext?.UserDetails;
  const [bookmarkOverride, setBookmarkOverride] = useState<boolean | null>(
    null,
  );
  const isSaved =
    bookmarkOverride ??
    (Boolean(post.bookmarked) ||
      Boolean(UserDetails?.bookmarks?.includes(post._id)));
  const [savingPost, setSavingPost] = useState(false);
  const bookmarkPending = useRef(false);

  async function toggleSaved() {
    if (!UserDetails || bookmarkPending.current) return;
    bookmarkPending.current = true;
    setSavingPost(true);
    setPostError("");
    try {
      const { data } = await TogglePostBookmark(post._id);
      const saved =
        typeof data.data?.bookmarked === "boolean"
          ? data.data.bookmarked
          : !isSaved;
      setBookmarkOverride(saved);
      const updated = { ...post, bookmarked: saved };
      setUpdatedPost(updated);
      onUpdated?.(updated);
      userContext?.setUserDetails((current) => {
        if (!current) return current;
        const bookmarks = current.bookmarks ?? [];
        const wasSaved = bookmarks.includes(post._id);
        return {
          ...current,
          bookmarks: saved
            ? [...new Set([...bookmarks, post._id])]
            : bookmarks.filter((id) => id !== post._id),
          bookmarksCount: Math.max(
            0,
            (current.bookmarksCount ?? bookmarks.length) +
              Number(saved) -
              Number(wasSaved),
          ),
        };
      });
      toast.success(saved ? "Post saved." : "Post removed from saved posts.");
    } catch (error) {
      setPostError(
        axios.isAxiosError(error)
          ? error.response?.data?.message ||
              "Could not update saved post. Please try again."
          : "Could not update saved post. Please try again.",
      );
    } finally {
      bookmarkPending.current = false;
      setSavingPost(false);
    }
  }
  const isOwner = Boolean(
    UserDetails && (UserDetails._id || UserDetails.id) === post.user._id,
  );

  async function deletePost() {
    if (!isOwner || deletePending.current) return;
    deletePending.current = true;
    setDeletingPost(true);
    setPostError("");
    try {
      await DeletePost(post._id);
      setDeleted(true);
      onDeleted?.(post._id);
      toast.success("Post deleted.");
      if (isDetails) navigate("/Feed", { replace: true });
    } catch (error) {
      setPostError(
        axios.isAxiosError(error)
          ? error.response?.data?.message ||
              "Could not delete your post. Please try again."
          : "Could not delete your post. Please try again.",
      );
    } finally {
      deletePending.current = false;
      setDeletingPost(false);
    }
  }

  async function handleCommentAdded() {
    setAddedComments((count) => count + 1);
    await displayAllComments();
  }

  async function displayAllComments() {
    setLoadingComments(true);
    setCommentsError("");
    try {
      const allComments = await GetAllPostComments(post._id);
      setComments(allComments);
      setShowAllComments(true);
    } catch {
      setCommentsError("Could not load comments. Please try again.");
    } finally {
      setLoadingComments(false);
    }
  }

  const PrivacyIcon =
    post.privacy.toLowerCase() === "public"
      ? Globe2
      : ["only_me", "private"].includes(post.privacy.toLowerCase())
        ? LockKeyhole
        : UsersRound;

  if (deleted) return null;

  return (
    <article className="mb-4 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
      <header className="flex items-center gap-3 p-4">
        <img
          src={post.user.photo}
          alt={post.user.name}
          className="h-11 w-11 rounded-full object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {post.user.name}
          </p>
          <p className="text-xs text-gray-500">@{post.user.username}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <time dateTime={post.createdAt}>
              {moment(post.createdAt).fromNow()}
            </time>
            <span className="inline-flex items-center gap-1">
              <PrivacyIcon size={13} aria-hidden="true" />
              {post.privacy}
            </span>
          </div>
        </div>
        <div className="ml-auto">
          <Dropdown>
            <Button
              aria-label="More post options"
              variant="ghost"
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            >
              <MoreHorizontal size={20} aria-hidden="true" />
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu
                onAction={(key) => {
                  setPostError("");
                  if (key === "Save-Post") void toggleSaved();
                  if (key === "edit-Post") {
                    setEditingPost(true);
                    setConfirmDeletePost(false);
                  }
                  if (key === "delete-Post") {
                    setConfirmDeletePost(true);
                    setEditingPost(false);
                  }
                }}
              >
                <Dropdown.Item
                  id="Save-Post"
                  textValue={isSaved ? "Unsave Post" : "Save Post"}
                  isDisabled={savingPost || !UserDetails}
                  className="flex items-center gap-2"
                >
                  <Bookmark
                    size={16}
                    fill={isSaved ? "currentColor" : "none"}
                    aria-hidden="true"
                  />
                  <Label>
                    {savingPost
                      ? "Saving..."
                      : isSaved
                        ? "Unsave Post"
                        : "Save Post"}
                  </Label>
                </Dropdown.Item>
                {isOwner && (
                  <Dropdown.Item id="edit-Post" textValue="Edit Post">
                    <Label>Edit Post</Label>
                  </Dropdown.Item>
                )}
                {isOwner && (
                  <Dropdown.Item
                    id="delete-Post"
                    textValue="Delete Post"
                    variant="danger"
                  >
                    <Label>Delete Post</Label>
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </header>

      <Modal.Backdrop
        isOpen={confirmDeletePost}
        onOpenChange={(open) => {
          if (!deletePending.current) {
            setConfirmDeletePost(open);
            if (!open) setPostError("");
          }
        }}
        isDismissable={!deletingPost}
        isKeyboardDismissDisabled={deletingPost}
        className="bg-slate-900/55"
      >
        <Modal.Container
          placement="center"
          size="lg"
          className="w-full! p-4! sm:w-full!"
        >
          <Modal.Dialog
            role="alertdialog"
            className="w-full max-w-[650px]! gap-0 overflow-hidden rounded-[20px] bg-white p-0! shadow-2xl"
          >
            <Modal.Header className="flex flex-row! items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <Modal.Heading className="text-left text-lg font-bold text-slate-900">
                Confirm action
              </Modal.Heading>
              <Button
                isIconOnly
                variant="ghost"
                aria-label="Close confirmation"
                isDisabled={deletingPost}
                onPress={() => {
                  setConfirmDeletePost(false);
                  setPostError("");
                }}
                className="size-8 shrink-0 text-slate-500"
              >
                <X size={18} aria-hidden="true" />
              </Button>
            </Modal.Header>
            <Modal.Body className="m-0! px-5 py-6">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <TriangleAlert size={22} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-bold text-slate-900">Delete this post?</p>
                  <p className="mt-1.5 text-sm text-slate-600">
                    This post will be permanently removed from your profile and
                    feed.
                  </p>
                </div>
              </div>
              {postError && (
                <p role="alert" className="mt-3 text-sm text-red-600">
                  {postError}
                </p>
              )}
            </Modal.Body>
            <Modal.Footer className="mt-0! flex flex-row flex-wrap justify-end gap-2.5 border-t border-slate-100 px-5 py-4">
              <Button
                autoFocus
                variant="secondary"
                isDisabled={deletingPost}
                onPress={() => {
                  setConfirmDeletePost(false);
                  setPostError("");
                }}
                className="rounded-xl border border-slate-300 bg-white px-5 font-semibold text-slate-700"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                isDisabled={deletingPost}
                onPress={deletePost}
                className="rounded-xl bg-rose-600 px-5 font-semibold text-white"
              >
                {deletingPost ? "Deleting..." : "Delete post"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
      {postError && !confirmDeletePost && (
        <p role="alert" className="px-4 pb-3 text-sm text-red-600">
          {postError}
        </p>
      )}
      {editingPost && isOwner ? (
        <EditPost
          post={post}
          onCancel={() => setEditingPost(false)}
          onSaved={(updated) => {
            setUpdatedPost(updated);
            onUpdated?.(updated);
            setEditingPost(false);
            toast.success("Post updated.");
          }}
        />
      ) : (
        <>
          {post.body && (
            <p className="whitespace-pre-wrap break-words px-4 pb-4 text-sm leading-6 text-gray-800">
              {post.body}
            </p>
          )}
          {post.image && (
            <img
              src={post.image}
              alt="Post attachment"
              className={
                isDetails
                  ? "w-full object-contain"
                  : "max-h-[520px] w-full object-cover"
              }
            />
          )}
        </>
      )}

      {post.isShare && post.sharedPost && (
        <div className="mx-4 mb-4 overflow-hidden rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 p-4">
            <img
              src={post.sharedPost.user.photo}
              alt={post.sharedPost.user.name}
              className="h-9 w-9 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold">
                {post.sharedPost.user.name}
              </p>
              <p className="text-xs text-gray-500">
                @{post.sharedPost.user.username}
              </p>
            </div>
          </div>
          {post.sharedPost.body && (
            <p className="px-4 pb-4 text-sm">{post.sharedPost.body}</p>
          )}
          {post.sharedPost.image && (
            <img
              src={post.sharedPost.image}
              alt="Shared post attachment"
              className="max-h-[520px] w-full object-cover"
            />
          )}
        </div>
      )}

      <div className="mx-4 flex items-center justify-between border-b border-gray-200 py-3 text-xs text-gray-500">
        <span>{post.likesCount + Number(isLiked)} likes</span>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <span>{post.sharesCount} shares</span>
          <span>
            {Math.max(0, post.commentsCount + addedComments)} comments
          </span>
          {!isDetails && (
            <Link
              to={`/posts/${post._id}`}
              className="font-semibold text-blue-600 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              View details
            </Link>
          )}
        </div>
      </div>

      <div className="mx-4 flex items-center justify-around py-3 text-sm font-medium text-gray-600">
        <button
          type="button"
          aria-pressed={isLiked}
          onClick={() => setIsLiked(!isLiked)}
          className={
            isLiked
              ? "flex items-center gap-2 text-blue-600"
              : "flex items-center gap-2"
          }
        >
          <Heart
            size={18}
            fill={isLiked ? "currentColor" : "none"}
            aria-hidden="true"
          />
          Like
        </button>
        <button
          type="button"
          onClick={displayAllComments}
          disabled={loadingComments}
          className="flex items-center gap-2 disabled:opacity-50"
        >
          <MessageCircle size={18} aria-hidden="true" /> Comment
        </button>
        <span className="flex items-center gap-2">
          <Share2 size={18} aria-hidden="true" /> Share
        </span>
      </div>

      {(comments.length > 0 || post.commentsCount > 0 || showAllComments) && (
        <section aria-label="Comments" className="space-y-3 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold text-gray-700">
            {showAllComments ? "All comments" : "Top comment"}
          </h2>
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postId={post._id}
              postOwnerId={post.user._id}
              onDeleted={(id) => {
                setComments((current) =>
                  current.filter((item) => item._id !== id),
                );
                setAddedComments((count) => count - 1);
              }}
            />
          ))}
          {showAllComments && comments.length === 0 && (
            <p className="text-sm text-gray-500">No comments yet.</p>
          )}
          {!showAllComments && post.commentsCount > 0 && (
            <button
              type="button"
              onClick={displayAllComments}
              disabled={loadingComments}
              className="text-sm font-semibold text-blue-600 disabled:opacity-50"
            >
              {loadingComments ? "Loading comments..." : "View all comments"}
            </button>
          )}
          {commentsError && (
            <p role="alert" className="text-sm text-red-600">
              {commentsError}
            </p>
          )}
        </section>
      )}
      <PostComment postId={post._id} onCommentAdded={handleCommentAdded} />
    </article>
  );
}
