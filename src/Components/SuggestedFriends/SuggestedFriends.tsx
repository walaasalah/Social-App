import { useContext, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { Search, Users } from "lucide-react";
import { GetSuggestedFriends } from "../../Services/Friends.service";
import { UserContext } from "../Context/UserContext";
import FriendCard from "./FriendCard";

export default function SuggestedFriends({
  fullPage = false,
}: {
  fullPage?: boolean;
}) {
  const user = useContext(UserContext)?.UserDetails;
  const [search, setSearch] = useState("");
  const {
    data,
    isPending,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["suggested-friends", user?._id || user?.id],
    enabled: Boolean(user),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => GetSuggestedFriends(pageParam, signal),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const friends = [
    ...new Map(
      (data?.pages.flatMap((page) => page.users) ?? [])
        .filter((friend) => friend._id !== (user?._id || user?.id))
        .map((friend) => [friend._id, friend]),
    ).values(),
  ];
  const searchText = search.trim().toLowerCase();
  const matchingFriends = friends.filter((friend) =>
    `${friend.name} ${friend.username ?? ""}`
      .toLowerCase()
      .includes(searchText),
  );
  const visibleFriends =
    fullPage || searchText ? matchingFriends : matchingFriends.slice(0, 5);

  return (
    <section
      aria-label="Suggested friends"
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <header className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Users size={19} className="text-blue-500" />
          {fullPage ? "All Suggested Friends" : "Suggested Friends"}
        </h2>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
          {friends.length}
        </span>
      </header>
      <div className="relative">
        <Search
          size={16}
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search friends by name or username"
          placeholder="Search by name or username..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {isPending ? (
        <p role="status" className="py-5 text-center text-sm text-slate-500">
          Loading suggested friends...
        </p>
      ) : (
        <>
          <ul className={fullPage ? "grid gap-3 sm:grid-cols-2" : "space-y-3"}>
            {visibleFriends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </ul>
          {!visibleFriends.length && (
            <p
              role="status"
              className="py-4 text-center text-sm text-slate-500"
            >
              {searchText
                ? "No matching friends in the loaded suggestions."
                : "No suggested friends right now."}
            </p>
          )}
        </>
      )}

      {isError && (
        <div role="alert" className="text-sm text-red-600">
          Could not load suggested friends.{" "}
          <button
            type="button"
            onClick={() => {
              void refetch();
            }}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}
      {searchText && hasNextPage && (
        <p className="text-xs text-slate-500">
          Search covers loaded suggestions. Load more users to see more matches.
        </p>
      )}
      {fullPage ? (
        hasNextPage && (
          <button
            type="button"
            disabled={isFetchingNextPage}
            onClick={() => {
              void fetchNextPage();
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-main transition hover:bg-slate-100 disabled:opacity-60"
          >
            {isFetchingNextPage ? "Loading more users..." : "Load more users"}
          </button>
        )
      ) : (
        <Link
          to="/SuggestedFriends"
          className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-center text-sm font-semibold text-main transition hover:bg-slate-100"
        >
          View more
        </Link>
      )}
    </section>
  );
}
