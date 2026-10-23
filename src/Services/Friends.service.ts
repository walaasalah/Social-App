import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL;

export interface SuggestedUser {
  _id: string;
  name: string;
  username?: string;
  photo?: string;
  followersCount?: number;
  mutualFollowersCount?: number;
}

export async function GetSuggestedFriends(page = 1, signal?: AbortSignal) {
  const { data } = await axios.get(`${baseUrl}/users/suggestions`, {
    params: { page, limit: 20 },
    signal,
    headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
  });
  const users: SuggestedUser[] =
    data.data?.suggestions ?? data.data?.users ?? [];
  const pagination =
    data.meta?.pagination ?? data.meta ?? data.data?.pagination;
  const hasMore =
    typeof pagination?.totalPages === "number"
      ? page < pagination.totalPages
      : users.length === 20;
  return { users, nextPage: hasMore ? page + 1 : undefined };
}

export function FollowUser(userId: string) {
  return axios.put(
    `${baseUrl}/users/${userId}/follow`,
    {},
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
    },
  );
}
