import {
  useContext,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Button, Modal } from "@heroui/react";
import {
  TriangleAlert,
  Heart,
  ImagePlus,
  MoreHorizontal,
  Smile,
  Trash2,
  X,
} from "lucide-react";
import moment from "moment";
import axios from "axios";
import { UserContext } from "../Context/UserContext";
import {
  DeleteComment,
  GetCommentReplies,
  ToggleCommentLike,
  UpdateComment,
} from "../../Services/Comments.service";
import type { TopComment } from "../../types/PostCardType";
import PostComment from "./PostComment";
import EmojiPicker from "emoji-picker-react";

export default function CommentItem({
  comment,
  postId,
  postOwnerId,
  onDeleted,
  isReply = false,
}: {
  comment: TopComment;
  postId: string;
  postOwnerId: string;
  onDeleted: (id: string) => void;
  isReply?: boolean;
}) {
  const user = useContext(UserContext)?.UserDetails;
  const userId = user?._id || user?.id;
  const [updatedLikes, setUpdatedLikes] = useState<string[] | null>(null);
  const likes = updatedLikes ?? comment.likes ?? [];
  const isLiked = Boolean(userId && likes.includes(userId));
  const [liking, setLiking] = useState(false);
  const likeRequestPending = useRef(false);
  const [likeError, setLikeError] = useState("");
  const isOwner = Boolean(userId && userId === comment.commentCreator._id);
  // Show the action for signed-in users; the API enforces deletion permissions.
  const canRequestDelete = Boolean(userId);
  const [content, setContent] = useState(comment.content);
  const [draft, setDraft] = useState(comment.content);
  const [image, setImage] = useState(comment.image);
  const [draftImage, setDraftImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const draftRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function resetEditor() {
    setDraftImage(null);
    setImagePreview(null);
    setShowEmojis(false);
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    setError("");
    setDraftImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function addEmoji(emoji: string) {
    const input = draftRef.current;
    const start = input?.selectionStart ?? draft.length;
    const end = input?.selectionEnd ?? draft.length;
    setDraft(draft.slice(0, start) + emoji + draft.slice(end));
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deletePending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [replying, setReplying] = useState(false);
  const [replies, setReplies] = useState<TopComment[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);

  function reportError(error: unknown, fallback: string) {
    setError(
      axios.isAxiosError(error)
        ? error.response?.data?.message || fallback
        : fallback,
    );
  }

  async function toggleLike() {
    if (!userId || likeRequestPending.current) return;
    likeRequestPending.current = true;
    setLiking(true);
    setLikeError("");
    try {
      await ToggleCommentLike(postId, comment._id);
      setUpdatedLikes(
        isLiked ? likes.filter((id) => id !== userId) : [...likes, userId],
      );
    } catch (error) {
      setLikeError(
        axios.isAxiosError(error)
          ? error.response?.data?.message ||
              "Could not update your like. Please try again."
          : "Could not update your like. Please try again.",
      );
    } finally {
      likeRequestPending.current = false;
      setLiking(false);
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!isOwner || busy || (!draft.trim() && !draftImage && !image)) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await UpdateComment(
        postId,
        comment._id,
        draft.trim(),
        draftImage,
      );
      if (draftImage) {
        const savedImage = data.data?.comment?.image ?? data.comment?.image;
        if (savedImage) setImage(savedImage);
        else {
          // Keep a persistent preview if the API omits the updated comment.
          const preview = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(draftImage);
          });
          setImage(preview);
        }
      }
      setContent(draft.trim());
      setEditing(false);
      resetEditor();
    } catch (error) {
      reportError(error, "Could not save your comment. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!canRequestDelete || busy || deletePending.current) return;
    deletePending.current = true;
    setBusy(true);
    setError("");
    try {
      await DeleteComment(postId, comment._id);
      setConfirmDelete(false);
      onDeleted(comment._id);
    } catch (error) {
      reportError(error, "Could not delete your comment. Please try again.");
    } finally {
      deletePending.current = false;
      setBusy(false);
    }
  }

  async function loadReplies() {
    setLoadingReplies(true);
    setError("");
    try {
      setReplies(await GetCommentReplies(postId, comment._id));
      setShowReplies(true);
    } catch (error) {
      reportError(error, "Could not load replies. Please try again.");
    } finally {
      setLoadingReplies(false);
    }
  }

  return (
    <div className="flex items-start gap-3">
      <img
        src={comment.commentCreator.photo}
        alt={comment.commentCreator.name}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="rounded-xl bg-white p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">
                {comment.commentCreator.name}
              </p>
              {comment.commentCreator.username && (
                <p className="text-xs text-gray-500">
                  @{comment.commentCreator.username.replace(/^@/, "")}
                </p>
              )}
            </div>
            {canRequestDelete && (
              <div className="relative">
                <button
                  type="button"
                  aria-label={isReply ? "Reply options" : "Comment options"}
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen(!menuOpen)}
                  disabled={busy}
                  className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                >
                  <MoreHorizontal size={18} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 z-10 min-w-40 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => {
                          resetEditor();
                          setDraft(content);
                          setEditing(true);
                          setConfirmDelete(false);
                          setMenuOpen(false);
                          setError("");
                        }}
                        className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-100"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmDelete(true);
                        setEditing(false);
                        setMenuOpen(false);
                        setError("");
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {editing ? (
            <form onSubmit={save} className="mt-2 space-y-2">
              <textarea
                ref={draftRef}
                autoFocus
                aria-label="Edit comment"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                disabled={busy}
                className="w-full rounded-lg border border-gray-300 p-2 text-sm"
              />
              <div className="flex items-center gap-2">
                <label className="flex size-8 cursor-pointer items-center justify-center rounded-full text-blue-700 hover:bg-blue-100">
                  <span className="sr-only">Upload comment image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    disabled={busy}
                    className="sr-only"
                  />
                  <ImagePlus size={16} aria-hidden="true" />
                </label>
                <button
                  type="button"
                  aria-label="Choose emoji"
                  aria-expanded={showEmojis}
                  disabled={busy}
                  onClick={() => setShowEmojis(!showEmojis)}
                  className="flex size-8 items-center justify-center rounded-full text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                >
                  <Smile size={16} aria-hidden="true" />
                </button>
              </div>
              {showEmojis && !busy && (
                <EmojiPicker onEmojiClick={(emojiData) => addEmoji(emojiData.emoji)} width="100%" height={360} previewConfig={{ showPreview: false }} />
              )}
              {(imagePreview || image) && (
                <div className="relative h-40 w-40">
                  <img
                    src={imagePreview || image}
                    alt="Comment attachment preview"
                    className="h-40 w-40 rounded-lg object-contain"
                  />
                  {imagePreview && (
                    <button
                      type="button"
                      aria-label="Cancel selected image"
                      disabled={busy}
                      onClick={() => {
                        setDraftImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute right-0 top-0 rounded-full bg-white p-1"
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
              <div className="flex gap-3 text-sm">
                <button
                  type="submit"
                  disabled={busy || (!draft.trim() && !draftImage && !image)}
                  className="font-semibold text-blue-600 disabled:opacity-50"
                >
                  {busy ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setEditing(false);
                    resetEditor();
                    setError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-800">
              {content}
            </p>
          )}
          {!editing && image && (
            <img
              src={image}
              alt="Comment attachment"
              className="mt-2 h-20 w-20 rounded-lg object-contain"
            />
          )}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
            <time
              dateTime={comment.createdAt}
              title={moment(comment.createdAt).format("LLL")}
            >
              {moment(comment.createdAt).fromNow()}
            </time>
            <span aria-live="polite">{likes.length} likes</span>
            <button
              type="button"
              aria-pressed={isLiked}
              aria-label={`${isLiked ? "Unlike" : "Like"} ${isReply ? "reply" : "comment"}`}
              disabled={!userId || liking || busy}
              onClick={toggleLike}
              className={`inline-flex items-center gap-1 font-semibold disabled:opacity-50 ${isLiked ? "text-blue-600" : "hover:text-blue-600"}`}
            >
              <Heart
                size={14}
                fill={isLiked ? "currentColor" : "none"}
                aria-hidden="true"
              />
              {liking ? "Updating..." : isLiked ? "Liked" : "Like"}
            </button>
            {!isReply && (
              <>
                <button
                  type="button"
                  onClick={() => setReplying(!replying)}
                  aria-expanded={replying}
                  className="font-semibold hover:text-blue-600"
                >
                  Reply
                </button>
                <button
                  type="button"
                  disabled={loadingReplies}
                  onClick={() =>
                    showReplies ? setShowReplies(false) : void loadReplies()
                  }
                  className="font-semibold hover:text-blue-600 disabled:opacity-50"
                >
                  {loadingReplies
                    ? "Loading replies..."
                    : showReplies
                      ? "Hide replies"
                      : "View replies"}
                </button>
              </>
            )}
          </div>
          <Modal.Backdrop
            isOpen={confirmDelete}
            onOpenChange={(open) => {
              if (!deletePending.current) {
                setConfirmDelete(open);
                if (!open) setError("");
              }
            }}
            isDismissable={!busy}
            isKeyboardDismissDisabled={busy}
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
                    isDisabled={busy}
                    onPress={() => {
                      setConfirmDelete(false);
                      setError("");
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
                      <p className="font-bold text-slate-900">
                        Delete this {isReply ? "reply" : "comment"}?
                      </p>
                      <p className="mt-1.5 text-sm text-slate-600">
                        This {isReply ? "reply" : "comment"} will be permanently
                        removed.
                      </p>
                    </div>
                  </div>
                  {error && (
                    <p role="alert" className="mt-3 text-sm text-red-600">
                      {error}
                    </p>
                  )}
                </Modal.Body>
                <Modal.Footer className="mt-0! flex flex-row flex-wrap justify-end gap-2.5 border-t border-slate-100 px-5 py-4">
                  <Button
                    autoFocus
                    variant="secondary"
                    isDisabled={busy}
                    onPress={() => {
                      setConfirmDelete(false);
                      setError("");
                    }}
                    className="rounded-xl border border-slate-300 bg-white px-5 font-semibold text-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    isDisabled={busy}
                    onPress={remove}
                    className="rounded-xl bg-rose-600 px-5 font-semibold text-white"
                  >
                    {busy
                      ? "Deleting..."
                      : isReply
                        ? "Delete reply"
                        : "Delete comment"}
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
          {error && !confirmDelete && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
          {likeError && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {likeError}
            </p>
          )}
        </div>
        {showReplies && (
          <div className="mt-3 space-y-3 border-l-2 border-gray-200 pl-3">
            {replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                postId={postId}
                postOwnerId={postOwnerId}
                isReply
                onDeleted={(id) =>
                  setReplies((current) =>
                    current.filter((item) => item._id !== id),
                  )
                }
              />
            ))}
            {!replies.length && (
              <p className="text-xs text-gray-500">No replies yet.</p>
            )}
          </div>
        )}
        {replying && (
          <PostComment
            postId={postId}
            parentCommentId={comment._id}
            replyTo={
              comment.commentCreator.username || comment.commentCreator.name
            }
            onCommentAdded={loadReplies}
          />
        )}
      </div>
    </div>
  );
}
