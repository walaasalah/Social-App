import { NotificationsContext } from "../Context/NotificationsContext.tsx";
import { useContext } from "react";
import logo from "../../assets/Images/route.jpeg";
import { Dropdown, Label } from "@heroui/react";
import { Bell, House, Menu, Settings, User } from "lucide-react";
import { TokenContext } from "../Context/TokenContext";
import { NavLink, useNavigate } from "react-router";
import { UserContext } from "../Context/UserContext";

export default function Navbar() {
  const UserDetails = useContext(UserContext)?.UserDetails;
  const { unreadCount } = useContext(NotificationsContext);

  const tokenContext = useContext(TokenContext);
  const navigate = useNavigate();
  function LogOut() {
    tokenContext?.setToken(null);
    localStorage.removeItem("userToken");
  }

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[72px] w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-4 lg:flex-nowrap lg:px-6">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="logo"
              className="h-11 w-11 rounded-2xl object-cover"
            />
            <h1 className="hidden text-2xl font-extrabold text-slate-900 sm:block">
              Route Posts
            </h1>
          </div>
          <div className="nav-links order-last flex min-w-0 w-full justify-center lg:order-none lg:w-auto">
            <div
              className="flex w-full items-center justify-center gap-1 rounded-[22px] border border-slate-200 bg-slate-50 p-1 sm:w-auto sm:p-1.5"
              aria-label="Main navigation"
            >
              {[
                { to: "/Feed", label: "Feed", Icon: House },
                { to: "/Profile", label: "Profile", Icon: User },
                { to: "/Notifications", label: "Notifications", Icon: Bell },
              ].map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex min-w-0 items-center justify-center gap-1.5 rounded-2xl px-2 py-2.5 text-xs sm:gap-2 sm:px-4 sm:text-base font-semibold transition ${
                      isActive
                        ? "bg-main/10 text-main"
                        : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  <span className="relative">
                    <Icon size={23} />
                    {label === "Notifications" && unreadCount > 0 && (
                      <span
                        aria-label={`${unreadCount} unread notifications`}
                        className="absolute -right-3 -top-3 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white"
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </span>
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
          <div className="nav-actions shrink-0">
            <Dropdown>
              <Dropdown.Trigger
                aria-label="Open account menu"
                className="flex h-14 items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-2 pr-3 text-slate-900 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                  <img
                    src={UserDetails?.photo}
                    alt=""
                    className="size-10 shrink-0 rounded-full object-cover"
                  />
                  <span className="max-w-28 truncate text-sm font-medium sm:text-base">
                    {UserDetails?.username || UserDetails?.name}
                  </span>
                  <Menu size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
              </Dropdown.Trigger>
              <Dropdown.Popover>
                <Dropdown.Menu
                  onAction={(key) => {
                    if (key === "Profile") navigate("/Profile");
                    if (key === "Settings") navigate("/Settings");
                  }}
                >
                  <Dropdown.Item
                    id="Profile"
                    textValue="Profile"
                    className="flex items-center gap-2"
                  >
                    <User size={18} /> <Label>Profile</Label>
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="Settings"
                    textValue="Settings"
                    className="flex items-center gap-2"
                  >
                    <Settings size={18} /> <Label>Settings</Label>
                  </Dropdown.Item>

                  <Dropdown.Item
                    id="Logout"
                    textValue="Logout"
                    variant="danger"
                    onClick={LogOut}
                  >
                    <Label>Logout</Label>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </div>
        </div>
      </nav>
    </>
  );
}

