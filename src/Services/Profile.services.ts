import axios from "axios";
import type { PostCardInterface } from "../types/PostCardType";
import { GetSinglePost } from "./Post.service";

const baseUrl = import.meta.env.VITE_BASE_URL;

export function UploadProfilePhoto(photo: File) {
  const formData = new FormData();
  formData.append("photo", photo);
  return axios.put(`${baseUrl}/users/upload-photo`, formData, {
    headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
  });
}

export async function GetMyPosts() {
  const posts: PostCardInterface[] = [];
  for (let page = 1; ; page++) {
    const { data } = await axios.get(`${baseUrl}/posts/feed`, {
      params: { only: "me", page, limit: 50 },
      headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
    });
    const batch: PostCardInterface[] = data.data?.posts ?? data.posts ?? [];
    posts.push(...batch);
    if (batch.length < 50) return posts;
  }
}

export async function GetSavedPosts(ids: string[]) {
  const posts: PostCardInterface[] = [];
  for (let start = 0; start < ids.length; start += 5) {
    const results = await Promise.allSettled(
      ids.slice(start, start + 5).map(GetSinglePost),
    );
    for (const result of results) {
      if (result.status === "fulfilled") {
        const post = result.value.data.data?.post ?? result.value.data.post;
        if (post) posts.push({ ...post, bookmarked: true });
      } else if (
        !axios.isAxiosError(result.reason) ||
        ![403, 404].includes(result.reason.response?.status ?? 0)
      ) {
        throw result.reason;
      }
    }
  }
  return posts;
}
export async function GetMyProfile() {
  const data = await axios.get(`${baseUrl}/users/profile-data`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });

  return data;
}
