import axios from "axios";
const baseUrl = import.meta.env.VITE_BASE_URL;

export function TogglePostBookmark(postId: string) {
  return axios.put(
    `${baseUrl}/posts/${postId}/bookmark`,
    {},
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
    },
  );
}

export function DeletePost(postId: string) {
  return axios.delete(`${baseUrl}/posts/${postId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
  });
}
export async function GetSinglePost(PostId: string) {
  const data = await axios.get(`${baseUrl}/posts/${PostId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });

  return data;
}

export async function CreatePost(formdata: FormData) {
  const data = axios.post(`${baseUrl}/posts`, formdata, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
  return data;
}

export async function UpdatePost(PostId: string, formdata: FormData) {
  const data = axios.put(`${baseUrl}/posts/${PostId}`, formdata, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
  return data;
}
