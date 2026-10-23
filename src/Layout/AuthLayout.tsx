import { NavLink, Outlet } from "react-router";
import AuthIntro from "../Components/AuthIntro/AuthIntro";

export default function AuthLayout() {
  return (
    <main className="flex min-h-screen items-center bg-[#f0f2f5] px-5 py-10 sm:px-8 lg:py-16">
      <div className="mx-auto grid w-full max-w-[1152px] items-center gap-10 lg:grid-cols-[minmax(0,576px)_430px] lg:justify-between lg:gap-16">
        <AuthIntro />
        <div className="mx-auto w-full max-w-[430px] rounded-2xl bg-white p-6">
          <nav
            aria-label="Account access"
            className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1"
          >
            {["Login", "Register"].map((label) => (
              <NavLink
                key={label}
                to={`/auth/${label}`}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-2.5 text-center text-sm font-bold transition ${isActive ? "bg-white text-main shadow-sm ring-1 ring-slate-200/60" : "text-slate-600 hover:text-main"}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <Outlet />
        </div>
      </div>
    </main>
  );
}
