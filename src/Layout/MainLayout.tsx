import { Outlet } from "react-router";
import Navbar from "../Components/Navbar/Navbar";

export default function MainLayout() {
  return (
    <main className="min-h-screen bg-[#f0f2f5]">
      <Navbar />

      <div className="mx-auto min-h-[calc(100vh-72px)] w-full max-w-7xl px-3 py-5 sm:px-4 lg:px-6">
        <Outlet />
      </div>
    </main>
  );
}

