export interface PostCardInterface {
  _id: string;
  body?: string;
  image?: string;
  privacy: string;
  user: User;
  sharedPost: SharedPost | null;
  likes: string[];
  createdAt: string;
  commentsCount: number;
  topComment: TopComment | null;
  sharesCount: number;
  likesCount: number;
  isShare: boolean;
  id: string;
  bookmarked: boolean;
}

export interface User {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

export interface SharedPost {
  body?: string;
  _id: string;
  image: string;
  privacy: string;
  user: User2;
  sharedPost: any;
  likes: string[];
  createdAt: string;
  commentsCount: number;
  topComment: TopComment | null;
  sharesCount: number;
  likesCount: number;
  isShare: boolean;
  id: string;
}

export interface User2 {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

export interface TopComment {
  image?: string;
  _id: string;
  content: string;
  commentCreator: CommentCreator;
  post: string;
  parentComment: TopComment | null;
  likes: string[];
  createdAt: string;
}

export interface CommentCreator {
  _id: string;
  name: string;
  username: string;
  photo: string;
}
