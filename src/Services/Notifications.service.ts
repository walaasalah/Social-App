import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL;
const config = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
});

export interface NotificationUser {
  _id?: string;
  name?: string;
  username?: string;
  photo?: string;
}
export interface NotificationItem {
  _id: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  actor?: NotificationUser;
  sender?: NotificationUser;
  from?: NotificationUser;
  message?: string;
  post?: string | { _id: string; body?: string; image?: string };
  comment?: string | { _id?: string; content?: string; post?: string };
  entityId?: string;
  entityType?: string;
}

export async function GetNotifications(page = 1) {
  const { data } = await axios.get(`${baseUrl}/notifications`, {
    ...config(),
    params: { page, limit: 20 },
  });
  const notifications: NotificationItem[] =
    data.data?.notifications ?? data.notifications ?? [];
  const pagination =
    data.meta?.pagination ?? data.meta ?? data.data?.pagination;
  return {
    notifications,
    hasMore:
      typeof pagination?.totalPages === "number"
        ? page < pagination.totalPages
        : notifications.length === 20,
  };
}

export async function GetUnreadCount() {
  const { data } = await axios.get(
    `${baseUrl}/notifications/unread-count`,
    config(),
  );
  return Number(
    data.data?.unreadCount ?? data.data?.count ?? data.unreadCount ?? 0,
  );
}

export function MarkNotificationRead(id: string) {
  return axios.patch(`${baseUrl}/notifications/${id}/read`, {}, config());
}

export function MarkAllNotificationsRead() {
  return axios.patch(`${baseUrl}/notifications/read-all`, {}, config());
}
