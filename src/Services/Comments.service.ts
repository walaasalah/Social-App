import axios from "axios";
import type { TopComment } from "../types/PostCardType";

const baseUrl = import.meta.env.VITE_BASE_URL;

function authConfig() {
  return {
    headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
  };
}

export function ToggleCommentLike(postId: string, commentId: string) {
  return axios.put(
    `${baseUrl}/posts/${postId}/comments/${commentId}/like`,
    {},
    authConfig(),
  );
}

export function UpdateComment(
  postId: string,
  commentId: string,
  content: string,
  image?: File | null,
) {
  const body = new FormData();
  body.append("content", content);
  if (image) body.append("image", image);
  return axios.put(
    `${baseUrl}/posts/${postId}/comments/${commentId}`,
    body,
    authConfig(),
  );
}

export function DeleteComment(postId: string, commentId: string) {
  return axios.delete(
    `${baseUrl}/posts/${postId}/comments/${commentId}`,
    authConfig(),
  );
}

export function CreateCommentReply(
  postId: string,
  commentId: string,
  body: FormData,
) {
  return axios.post(
    `${baseUrl}/posts/${postId}/comments/${commentId}/replies`,
    body,
    authConfig(),
  );
}

export async function GetCommentReplies(postId: string, commentId: string) {
  const replies: TopComment[] = [];
  for (let page = 1; ; page++) {
    const { data } = await axios.get(
      `${baseUrl}/posts/${postId}/comments/${commentId}/replies`,
      {
        ...authConfig(),
        params: { page, limit: 50 },
      },
    );
    const batch: TopComment[] =
      data.data?.replies ?? data.data?.comments ?? data.replies ?? [];
    replies.push(...batch);
    if (batch.length < 50) return replies;
  }
}

export async function GetPostComments(postId: string, page = 1) {
  return axios.get(`${baseUrl}/posts/${postId}/comments`, {
    params: { page, limit: 50 },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
}

export async function CreatePostComment(postId: string, formdata: FormData) {
  const data = axios.post(`${baseUrl}/posts/${postId}/comments`, formdata, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
  return data;
}

export async function GetAllPostComments(postId: string) {
  const comments: TopComment[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const { data } = await GetPostComments(postId, page);
    const fetchedComments: TopComment[] = data.data?.comments ?? data.comments;
    comments.push(...fetchedComments);
    hasMore = fetchedComments.length === 50;
    page++;
  }

  return comments;
}
