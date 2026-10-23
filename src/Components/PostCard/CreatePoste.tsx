import {
  ChevronDown,
  Globe,
  LockKeyhole,
  ImageIcon,
  Send,
  Smile,
  UsersRound,
  X,
} from "lucide-react";
import {
  useContext,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { CreatePost } from "../../Services/Post.service";
import toast from "react-hot-toast";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import { Spinner } from "@heroui/react";
import { UserContext } from "../Context/UserContext";

export default function CreatePoste({
  GetAllPosts,
}: {
  GetAllPosts: () => void;
}) {
  const UserDetails = useContext(UserContext)?.UserDetails;
  const [Content, setContent] = useState("");
  const [Image, setImage] = useState<File | null>(null);
  const [ImagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [privacy, setPrivacy] = useState("only_me");
  const [showEmojis, setShowEmojis] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pending = useRef(false);

  useEffect(
    () => () => {
      if (ImagePreview) URL.revokeObjectURL(ImagePreview);
    },
    [ImagePreview],
  );

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

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.");
        return;
      }

      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || (!Content.trim() && !Image)) return;
    pending.current = true;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("body", Content.trim());
      formData.append("privacy", privacy);
      if (Image) {
        formData.append("image", Image);
      }
      const { data } = await CreatePost(formData);
      toast.success(data.message);
      setContent("");
      setShowEmojis(false);
      setImage(null);
      setImagePreview(null);
      GetAllPosts();
    } catch (error) {
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Could not create your post."
          : "Could not create your post.",
      );
    } finally {
      pending.current = false;
      setIsLoading(false);
    }
  }
  function handleClosePreview() {
    setImage(null);
    setImagePreview(null);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 w-full overflow-hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5"
    >
      <header className="mb-3 flex items-start gap-3">
        <img
          alt={UserDetails?.name}
          className="size-11 shrink-0 rounded-full object-cover"
          src={UserDetails?.photo}
        />
        <div className="min-w-0">
          <p className="text-sm font-bold capitalize text-gray-900">
            {UserDetails?.name}
          </p>
          <label className="relative mt-1 inline-flex items-center gap-1.5 rounded-full bg-gray-100 py-1 pl-2.5 pr-7 text-xs font-medium text-gray-600">
            {privacy === "only_me" ? (
              <LockKeyhole size={12} aria-hidden="true" />
            ) : privacy === "following" ? (
              <UsersRound size={12} aria-hidden="true" />
            ) : (
              <Globe size={12} aria-hidden="true" />
            )}

            <span className="sr-only">Post privacy</span>
            <select
              value={privacy}
              onChange={(event) => setPrivacy(event.target.value)}
              disabled={isLoading}

              className="cursor-pointer appearance-none bg-transparent outline-none"
            >
              <option value="only_me">Only me</option>
              <option value="public">Public</option>
              <option value="following">Following</option>
            </select>
            <ChevronDown
              size={12}
              aria-hidden="true"
              className="pointer-events-none absolute right-2"
            />
          </label>
        </div>
      </header>

      <textarea
        ref={inputRef}
        disabled={isLoading}
        aria-label="Post text"
        value={Content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`What's on your mind, ${UserDetails?.name?.split(" ")[0]}?`}
        rows={4}
        className="w-full resize-none rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-200"
      />

      {ImagePreview && (
        <>
          <div className="relative mt-3 overflow-hidden rounded-xl">
            <button
              type="button"
              aria-label="Remove image"
              onClick={handleClosePreview}
              disabled={isLoading}

              className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/90 text-gray-700"
            >
              <X size={16} className="cursor-pointer" />
            </button>
            <img
              src={ImagePreview}
              alt="Selected post image"
              className="max-h-64 w-full object-cover"
            />
          </div>
        </>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-3">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-gray-900">
            <ImageIcon
              size={18}
              className="pointer-events-none text-emerald-500"
            />
            Photo/video
            <input
              type="file"
              accept="image/*"
              disabled={isLoading}
              className="sr-only"
              onChange={handleImage}
            />
          </label>
          <button
            type="button"
            aria-expanded={showEmojis}
            onClick={() => setShowEmojis(!showEmojis)}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <Smile size={18} className="pointer-events-none text-amber-500" />
            Feeling/activity
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading || (!Content.trim() && !Image)}

          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isLoading ? (
            <Spinner size="lg" className="text-white" />
          ) : (
            "Create Post"
          )}
          <Send size={14} />
        </button>
      </div>
      {showEmojis && !isLoading && (
        <div className="mt-3">
          <EmojiPicker onEmojiClick={(emojiData) => addEmoji(emojiData.emoji)} width="100%" height={360} previewConfig={{ showPreview: false }} />
        </div>
      )}
    </form>
  );
}
