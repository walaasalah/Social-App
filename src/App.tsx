import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import AuthLayout from "./Layout/AuthLayout";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import NotFound from "./Pages/NotFound/NotFound";
import MainLayout from "./Layout/MainLayout";
import NewsFeed from "./Pages/NewsFeed/NewsFeed";
import Profile from "./Pages/Profile/Profile";
import Notifications from "./Pages/Notifications/Notifications";
import Settings from "./Pages/Settings/Settings";
import Friends from "./Pages/Friends/Friends";
import { Toaster } from "react-hot-toast";
import AppProtectedRoute from "./Components/ProtectedRoute/AppProtectedRoute";
import AuthProtectedRoute from "./Components/ProtectedRoute/AuthProtectedRoute";
import PostDetails from "./Components/PostDetails/PostDetails";
import Offline from "./Components/Offline/Offline";
import { WifiOff } from "lucide-react";
export default function App() {
  const routes = createBrowserRouter([
    {
      path: "/auth",
      element: (
        <AuthProtectedRoute>
          {" "}
          <AuthLayout />
        </AuthProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="Login" /> },
        { path: "Login", element: <Login /> },
        { path: "Register", element: <Register /> },
        { path: "*", element: <NotFound /> },
      ],
    },
    {
      path: "",
      element: (
        <AppProtectedRoute>
          {" "}
          <MainLayout />
        </AppProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="Feed" /> },
        { path: "Feed", element: <NewsFeed /> },
        { path: "posts/:postId", element: <PostDetails /> },
        { path: "Profile", element: <Profile /> },
        { path: "Notifications", element: <Notifications /> },
        { path: "Settings", element: <Settings /> },
        { path: "SuggestedFriends", element: <Friends /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ]);

  return (
    <>
      <Toaster />
      <Offline>
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div
            role="status"
            className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-amber-200 bg-white p-4 shadow-lg"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <WifiOff size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">You're offline</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Check your connection to continue.
              </p>
            </div>
          </div>
        </div>
      </Offline>
      <RouterProvider router={routes} />
    </>
  );
}
