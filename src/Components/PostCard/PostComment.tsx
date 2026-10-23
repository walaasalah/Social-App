import { ImagePlus, Send, Smile, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  CreateCommentReply,
  CreatePostComment,
} from "../../Services/Comments.service";
import EmojiPicker from "emoji-picker-react";

export default function PostComment({
  postId,
  onCommentAdded,
  parentCommentId,
  replyTo,
}: {
  postId: string;
  onCommentAdded: () => void | Promise<void>;
  parentCommentId?: string;
  replyTo?: string;
}) {
  const fieldId = `${postId}-${parentCommentId ?? "new"}`;
  const [Content, setContent] = useState("");
  const [Image, setImage] = useState<File | null>(null);
  const [ImagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addEmoji(emoji: string) {
    const input = inputRef.current;
    const start = input?.selectionStart ?? Content.length;
    const end = input?.selectionEnd ?? Content.length;
    setContent(Content.slice(0, start) + emoji + Content.slice(end));
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }

  useEffect(() => {
    return () => {
      if (ImagePreview) URL.revokeObjectURL(ImagePreview);
    };
  }, [ImagePreview]);

  function clearImagePreview() {
    setImage(null);
    setImagePreview(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if ((!Content.trim() && !Image) || isLoading) return;
    setIsLoading(true);
    setError("");
    const formData = new FormData();
    if (Content.trim()) formData.append("content", Content.trim());
    if (Image) formData.append("image", Image);
    try {
      if (parentCommentId)
        await CreateCommentReply(postId, parentCommentId, formData);
      else await CreatePostComment(postId, formData);
      setContent("");
      setShowEmojis(false);
      clearImagePreview();
      onCommentAdded();
    } catch {
      setError("Could not send your comment. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 pb-5">
      <div className="flex items-center gap-2.5">
        <div className="flex min-w-0 flex-1 items-center rounded-full bg-gray-100 pr-1.5 focus-within:ring-2 focus-within:ring-blue-200">
          <label htmlFor={`comment-${fieldId}`} className="sr-only">
            Write a comment
          </label>
          <input
            ref={inputRef}
            id={`comment-${fieldId}`}
            placeholder={
              replyTo
                ? `Reply to @${replyTo.replace(/^@/, "")}...`
                : "Write a comment..."
            }
            value={Content}
            onChange={(event) => setContent(event.target.value)}
            disabled={isLoading}
            className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-500"
          />
          <label className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-blue-700 transition hover:bg-blue-100">
            <span className="sr-only">Add an image</span>
            <input
              accept="image/*"
              className="sr-only"
              type="file"
              onChange={handleImage}
              disabled={isLoading}
            />
            <ImagePlus size={16} aria-hidden="true" />
          </label>
          <button
            type="button"
            aria-label="Choose emoji"
            aria-expanded={showEmojis}
            aria-controls={`emoji-picker-${fieldId}`}
            disabled={isLoading}
            onClick={() => setShowEmojis(!showEmojis)}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-blue-700 hover:bg-blue-100 disabled:opacity-50"
          >
            <Smile size={16} aria-hidden="true" />
          </button>
          <button
            aria-label={parentCommentId ? "Post reply" : "Post comment"}
            disabled={(!Content.trim() && !Image) || isLoading}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-blue-700 transition hover:bg-blue-100 disabled:text-gray-400 disabled:hover:bg-transparent"
            type="submit"
          >
            <Send size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      {showEmojis && !isLoading && (
        <div id={`emoji-picker-${fieldId}`}>
          <EmojiPicker onEmojiClick={(emojiData) => addEmoji(emojiData.emoji)} width="100%" height={360} previewConfig={{ showPreview: false }} />
        </div>
      )}
      {ImagePreview && (
        <div className="relative h-40 w-40">
          <button
            type="button"
            onClick={clearImagePreview}
            disabled={isLoading}
            aria-label="Remove image"
            className="absolute right-0 top-0 rounded-full bg-white p-1"
          >
            <X size={16} aria-hidden="true" />
          </button>
          <img
            src={ImagePreview}
            alt="Selected comment attachment"
            className="h-40 w-40 rounded-lg object-cover"
          />
        </div>
      )}
      {isLoading && <p className="text-xs text-gray-500">Sending...</p>}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
