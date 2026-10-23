import axios from "axios";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import EmojiPicker from "emoji-picker-react";
import { ImageIcon, Smile, X } from "lucide-react";
import { GetSinglePost, UpdatePost } from "../../Services/Post.service";
import type { PostCardInterface } from "../../types/PostCardType";

interface EditPostProps {
  post: PostCardInterface;
  onCancel: () => void;
  onSaved: (post: PostCardInterface) => void;
}

export default function EditPost({ post, onCancel, onSaved }: EditPostProps) {
  const [body, setBody] = useState(post.body ?? "");
  const [privacy, setPrivacy] = useState(post.privacy);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const displayedImage = preview ?? (removeImage ? undefined : post.image);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

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
    setPreview(URL.createObjectURL(file));
    setRemoveImage(false);
  }

  function addEmoji(emoji: string) {
    const input = inputRef.current;
    const start = input?.selectionStart ?? body.length;
    const end = input?.selectionEnd ?? body.length;
    setBody(body.slice(0, start) + emoji + body.slice(end));
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || (!body.trim() && !displayedImage)) return;
    pending.current = true;
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("body", body.trim());
      formData.append("privacy", privacy);
      if (image) formData.append("image", image);
      else if (removeImage) formData.append("image", "");
      await UpdatePost(post._id, formData);
      const { data } = await GetSinglePost(post._id);
      const savedPost: PostCardInterface | undefined = data.data?.post ?? data.post;
      if (!savedPost) throw new Error("Missing updated post");
      if (removeImage && savedPost.image) {
        setError("Your post was saved, but the server did not remove the image. Please try again.");
        return;
      }
      onSaved(savedPost);
    } catch (error) {
      setError(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Could not update your post. Please try again."
          : "Could not update your post. Please try again.",
      );
      return;
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 px-4 pb-4">
      <label className="block text-sm font-medium text-gray-700">
        Post text
        <textarea
          ref={inputRef}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          disabled={saving}
          rows={4}
          className="mt-1 w-full resize-y rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-200"
        />
      </label>
      {displayedImage && (
        <div className="relative">
          <img src={displayedImage} alt="Post attachment" className="max-h-64 w-full rounded-xl object-contain" />
          <button type="button" aria-label="Remove image" disabled={saving}
            onClick={() => { setImage(null); setPreview(null); setRemoveImage(true); }}
            className="absolute right-2 top-2 rounded-full bg-white p-2 shadow disabled:opacity-50">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
      <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-600">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <ImageIcon size={18} className="text-emerald-500" aria-hidden="true" />
          {displayedImage ? "Replace image" : "Add image"}
          <input type="file" accept="image/*" disabled={saving} onChange={handleImage} className="sr-only" />
        </label>
        <button type="button" disabled={saving} aria-expanded={showEmojis}
          onClick={() => setShowEmojis(!showEmojis)} className="inline-flex items-center gap-2">
          <Smile size={18} className="text-amber-500" aria-hidden="true" /> Feeling/activity
        </button>
      </div>
      {showEmojis && !saving && (
        <EmojiPicker onEmojiClick={(emojiData) => addEmoji(emojiData.emoji)} width="100%" height={360} previewConfig={{ showPreview: false }} />
      )}
      <label className="flex items-center gap-2 text-sm text-gray-700">
        Post privacy
        <select
          value={privacy}
          onChange={(event) => setPrivacy(event.target.value)}
          disabled={saving}
          className="rounded-lg border border-gray-200 p-2"
        >
          {!["only_me", "public", "following"].includes(post.privacy) && (
            <option value={post.privacy}>{post.privacy}</option>
          )}
          <option value="only_me">Only me</option>
          <option value="public">Public</option>
          <option value="following">Following</option>
        </select>
      </label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={saving} className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50">
          Cancel
        </button>
        <button type="submit" disabled={saving || (!body.trim() && !displayedImage)} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
