import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  Bell,
  Check,
  CheckCheck,
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
} from "lucide-react";
import moment from "moment";
import axios from "axios";
import { NotificationsContext } from "../../Components/Context/NotificationsContext.tsx";
import {
  GetNotifications,
  MarkAllNotificationsRead,
  MarkNotificationRead,
  type NotificationItem,
} from "../../Services/Notifications.service";

function notificationDetails(item: NotificationItem) {
  const type = item.type.toLowerCase();
  if (type.includes("like"))
    return {
      text: type.includes("comment") ? "liked your comment" : "liked your post",
      Icon: Heart,
      color: "text-rose-500",
    };
  if (type.includes("reply"))
    return {
      text: "replied to your comment",
      Icon: MessageCircle,
      color: "text-blue-500",
    };
  if (type.includes("comment"))
    return {
      text: "commented on your post",
      Icon: MessageCircle,
      color: "text-blue-500",
    };
  if (type.includes("share"))
    return {
      text: "shared your post",
      Icon: Share2,
      color: "text-emerald-500",
    };
  if (type.includes("follow"))
    return {
      text: "started following you",
      Icon: UserPlus,
      color: "text-violet-500",
    };
  return {
    text: item.message || "sent you a notification",
    Icon: Bell,
    color: "text-blue-500",
  };
}

export default function Notifications() {
  const { unreadCount, refreshCount, decreaseCount, clearCount } =
    useContext(NotificationsContext);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const mutationPending = useRef(false);
  const loadPending = useRef(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    GetNotifications()
      .then((result) => {
        if (cancelled) return;
        setItems(result.notifications);
        setHasMore(result.hasMore);
        setPage(1);
      })
      .catch(() => {
        if (!cancelled)
          setError("Could not load notifications. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [retry]);

  async function loadMore() {
    if (loadPending.current || mutationPending.current) return;
    loadPending.current = true;
    setLoadingMore(true);
    setError("");
    try {
      const result = await GetNotifications(page + 1);
      setItems((current) => [
        ...current,
        ...result.notifications.filter(
          (item) => !current.some((existing) => existing._id === item._id),
        ),
      ]);
      setPage((value) => value + 1);
      setHasMore(result.hasMore);
    } catch {
      setError("Could not load more notifications. Please try again.");
    } finally {
      loadPending.current = false;
      setLoadingMore(false);
    }
  }

  async function markRead(id?: string) {
    if (mutationPending.current || loadPending.current) return;
    mutationPending.current = true;
    setPending(id ?? "all");
    setError("");
    try {
      if (id) {
        await MarkNotificationRead(id);
        setItems((current) =>
          current.map((item) =>
            item._id === id ? { ...item, isRead: true } : item,
          ),
        );
        decreaseCount();
      } else {
        await MarkAllNotificationsRead();
        setItems((current) =>
          current.map((item) => ({ ...item, isRead: true })),
        );
        clearCount();
      }
      void refreshCount();
    } catch (error) {
      setError(
        axios.isAxiosError(error)
          ? error.response?.data?.message ||
              "Could not mark notifications as read."
          : "Could not mark notifications as read.",
      );
    } finally {
      mutationPending.current = false;
      setPending(null);
    }
  }

  const visible =
    filter === "unread" ? items.filter((item) => !item.isRead) : items;
  return (
    <section
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
      aria-labelledby="notifications-heading"
    >
      <header className="border-b border-slate-200 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1
              id="notifications-heading"
              className="text-2xl font-extrabold text-slate-900 sm:text-3xl"
            >
              Notifications
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 sm:text-base">
              Updates for likes, comments, shares, and follows.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void markRead()}
            disabled={
              loading ||
              loadingMore ||
              Boolean(pending) ||
              (!unreadCount && !items.some((item) => !item.isRead))
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <CheckCheck size={18} />
            {pending === "all" ? "Marking..." : "Mark all as read"}
          </button>
        </div>
        <div className="mt-5 flex gap-2" aria-label="Filter notifications">
          <button
            type="button"
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
            className={`rounded-full px-5 py-2 font-bold ${filter === "all" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-700"}`}
          >
            All
          </button>
          <button
            type="button"
            aria-pressed={filter === "unread"}
            onClick={() => setFilter("unread")}
            className={`flex items-center gap-3 rounded-full px-5 py-2 font-bold ${filter === "unread" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-700"}`}
          >
            Unread{" "}
            <span className="rounded-full bg-white px-2 text-sm text-blue-500">
              {unreadCount}
            </span>
          </button>
        </div>
      </header>
      <div className="space-y-2.5 p-3 sm:p-5">
        {error && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm text-red-600"
          >
            {error}{" "}
            <button
              type="button"
              disabled={Boolean(pending) || loadingMore}
              onClick={() => {
                setLoading(true);
                setError("");
                setRetry((value) => value + 1);
              }}
              className="ml-2 font-bold underline"
            >
              Reload
            </button>
          </div>
        )}
        {loading ? (
          <div role="status" className="space-y-3">
            <span className="sr-only">Loading notifications...</span>
            {[1, 2, 3].map((key) => (
              <div
                key={key}
                className="h-32 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <>
            {visible.map((item) => {
              const actor = item.actor ?? item.sender ?? item.from;
              const { text, Icon, color } = notificationDetails(item);
              const post = typeof item.post === "object" ? item.post : null;
              const postId =
                typeof item.post === "string"
                  ? item.post
                  : (post?._id ??
                    (typeof item.comment === "object"
                      ? item.comment.post
                      : undefined) ??
                    (item.entityType === "post" ? item.entityId : undefined));
              const preview =
                post?.body ||
                (typeof item.comment === "object" ? item.comment.content : "");
              return (
                <article
                  key={item._id}
                  className={`flex items-start gap-3 rounded-[20px] border p-4 sm:gap-4 sm:p-5 ${item.isRead ? "border-slate-200 bg-white" : "border-blue-100 bg-[#edf4ff]"}`}
                >
                  <div className="relative shrink-0 pb-7">
                    {actor?.photo ? (
                      <img
                        src={actor.photo}
                        alt={actor.name || ""}
                        className="size-12 rounded-full object-cover sm:size-14"
                      />
                    ) : (
                      <span className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700 sm:size-14">
                        {actor?.name?.charAt(0) || "R"}
                      </span>
                    )}
                    <span
                      className={`absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full bg-white ${color}`}
                    >
                      <Icon size={18} aria-hidden="true" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-6 text-slate-900 sm:text-base">
                      <strong>
                        {actor?.name || actor?.username || "Someone"}
                      </strong>{" "}
                      {text}
                    </p>
                    {postId ? (
                      <Link
                        to={`/posts/${postId}`}
                        className="mt-1 block truncate text-sm text-slate-600 hover:text-blue-600 hover:underline sm:text-base"
                      >
                        {preview || "View post"}
                      </Link>
                    ) : (
                      preview && (
                        <p className="mt-1 truncate text-sm text-slate-600">
                          {preview}
                        </p>
                      )
                    )}
                    {!item.isRead && (
                      <button
                        type="button"
                        disabled={Boolean(pending) || loadingMore}
                        onClick={() => void markRead(item._id)}
                        className="mt-2 inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-white px-3 py-1 text-xs font-bold text-blue-500 hover:bg-blue-50 disabled:opacity-50 sm:text-sm"
                      >
                        <Check size={15} />
                        {pending === item._id ? "Marking..." : "Mark as read"}
                      </button>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs text-slate-500 sm:gap-5 sm:text-sm">
                    <time
                      dateTime={item.createdAt}
                      title={moment(item.createdAt).format("LLL")}
                    >
                      {moment(item.createdAt).fromNow(true)}
                    </time>
                    {!item.isRead && (
                      <span
                        aria-label="Unread"
                        className="size-1.5 rounded-full bg-blue-500"
                      />
                    )}
                  </div>
                </article>
              );
            })}
            {!visible.length && !error && (
              <div className="py-14 text-center text-slate-500">
                <Bell size={32} className="mx-auto mb-3 text-slate-300" />
                <p>
                  {filter === "unread"
                    ? hasMore
                      ? "No unread notifications on the loaded pages."
                      : "You are all caught up!"
                    : "No notifications yet."}
                </p>
              </div>
            )}
            {hasMore && (
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore || Boolean(pending)}
                className="mx-auto block rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-blue-600 disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
