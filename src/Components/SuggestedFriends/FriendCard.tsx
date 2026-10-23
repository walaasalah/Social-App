import axios from "axios";
import { useContext, useRef, useState } from "react";
import { Check, LoaderCircle, UserPlus, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { UserContext } from "../Context/UserContext";
import { FollowUser, type SuggestedUser } from "../../Services/Friends.service";

export default function FriendCard({ friend }: { friend: SuggestedUser }) {
  const userContext = useContext(UserContext);
  const isFollowing =
    userContext?.UserDetails?.following?.includes(friend._id) ?? false;
  const [isLoading, setIsLoading] = useState(false);
  const pending = useRef(false);

  async function followFriend() {
    if (pending.current || isFollowing) return;
    pending.current = true;
    setIsLoading(true);
    try {
      await FollowUser(friend._id);
      userContext?.setUserDetails((user) => {
        if (!user || user.following?.includes(friend._id)) return user;
        return {
          ...user,
          following: [...(user.following ?? []), friend._id],
          followingCount:
            (user.followingCount ?? user.following?.length ?? 0) + 1,
        };
      });
      toast.success(`You are now following ${friend.name}.`);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : null;
      toast.error(message || "Could not follow this user. Please try again.");
    } finally {
      pending.current = false;
      setIsLoading(false);
    }
  }

  return (
    <li className="min-w-0 space-y-3 rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2.5">
        {friend.photo ? (
          <img
            src={friend.photo}
            alt=""
            className="size-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500">
            <UserRound size={20} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">
            {friend.name}
          </p>
          {friend.username && (
            <p className="truncate text-xs text-slate-500">
              @{friend.username.replace(/^@/, "")}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={followFriend}
          disabled={isLoading || isFollowing}
          aria-label={`${isFollowing ? "Following" : "Follow"} ${friend.name}`}
          className="flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-500 transition hover:bg-blue-100 disabled:cursor-default disabled:opacity-70"
        >
          {isLoading ? (
            <LoaderCircle
              size={14}
              className="animate-spin"
              aria-hidden="true"
            />
          ) : isFollowing ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <UserPlus size={14} aria-hidden="true" />
          )}
          {isLoading ? "Following..." : isFollowing ? "Following" : "Follow"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2 text-[11px]">
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-500">
          {friend.followersCount ?? 0} followers
        </span>
        {Boolean(friend.mutualFollowersCount) && (
          <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-500">
            {friend.mutualFollowersCount} mutual
          </span>
        )}
      </div>
    </li>
  );
}
