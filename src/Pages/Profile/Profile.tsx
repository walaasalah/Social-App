import { useContext, useState } from "react";
import { Bookmark, FileText, Mail, UsersRound } from "lucide-react";
import { UserContext } from "../../Components/Context/UserContext";
import ProfilePosts from "./ProfilePosts";
import ProfilePhoto from "./ProfilePhoto";
import { useSearchParams } from "react-router";

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "saved" ? "saved" : "posts";
  const [postsCount, setPostsCount] = useState<number | null>(null);
  const user = useContext(UserContext)?.UserDetails;
  if (!user)
    return (
      <div role="status" className="animate-pulse space-y-4">
        <span className="sr-only">Loading profile...</span>
        <div className="h-36 rounded-2xl bg-slate-200" />
        <div className="h-64 rounded-3xl bg-white" />
      </div>
    );
  const savedCount = user.bookmarksCount ?? user.bookmarks?.length ?? 0;
  const userId = user._id || user.id;
  const bookmarksKey = JSON.stringify(user.bookmarks ?? []);

  return (
    <div className="pb-8">
      <section
        aria-label="Profile overview"
        className="overflow-hidden rounded-b-3xl border border-slate-200 bg-white pb-7 shadow-sm"
      >
        <div
          className="h-32 bg-gradient-to-r from-slate-900 via-[#294d73] to-[#6c9bbb] sm:h-36"
          style={
            user.cover
              ? {
                  backgroundImage: `url(${user.cover})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }
              : undefined
          }
        />
        <div className="relative mx-3 -mt-16 rounded-t-3xl bg-gradient-to-b from-slate-50 to-white px-4 pt-6 sm:mx-8 sm:px-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <ProfilePhoto />
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  {user.name}
                </h1>
                <p className="mt-1 truncate text-sm text-slate-500">
                  @{user.username?.replace(/^@/, "")}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-600">
                  <UsersRound size={12} />
                  Route Posts member
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:w-[46%]">
              {[
                { label: "Followers", value: user.followersCount ?? 0 },
                { label: "Following", value: user.followingCount ?? 0 },
                { label: "Bookmarks", value: savedCount },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white px-2 py-4 text-center"
                >
                  <p className="text-[10px] font-bold uppercase text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1.85fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-xs font-bold text-slate-800">About</h2>
              <p className="mt-4 flex items-center gap-2 break-all text-xs text-slate-500">
                <Mail size={14} className="shrink-0" />
                {user.email}
              </p>
              <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <UsersRound size={14} />
                Active on Route Posts
              </p>
            </div>
            <div className="grid gap-3">
              {[
                { label: "My Posts", value: postsCount ?? "…" },
                { label: "Saved Posts", value: savedCount },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-blue-200 bg-blue-50/50 px-4 py-3"
                >
                  <p className="text-[10px] font-bold uppercase text-blue-800">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section aria-label="Profile posts" className="mt-6">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
          <div
            className="flex rounded-xl bg-slate-100 p-1"
            aria-label="Post filters"
          >
            {(
              [
                { id: "posts", label: "My Posts", Icon: FileText },
                { id: "saved", label: "Saved", Icon: Bookmark },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={activeTab === id}
                onClick={() => setSearchParams({ tab: id })}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${activeTab === id ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-blue-600"}`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-500">
            {activeTab === "posts" ? (postsCount ?? "…") : savedCount}
          </span>
        </div>
        <ProfilePosts
          key={`${userId}-${activeTab}-${bookmarksKey}`}
          tab={activeTab}
          userId={userId}
          bookmarksKey={bookmarksKey}
          onCount={setPostsCount}
        />
      </section>
    </div>
  );
}
