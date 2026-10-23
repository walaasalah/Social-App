import { Bookmark, Globe, Newspaper, Sparkles } from "lucide-react";
import { Link, useSearchParams } from "react-router";

const links = [
  { id: "feed", label: "Feed", icon: Newspaper, to: "/Feed" },
  { id: "posts", label: "My Posts", icon: Sparkles, to: "/Feed?view=posts" },
  { id: "community", label: "Community", icon: Globe, to: "/Feed?view=community" },
  { id: "saved", label: "Saved", icon: Bookmark, to: "/Feed?view=saved" },
];

export default function Sidebar() {
  const [searchParams] = useSearchParams();
  const activeLink = searchParams.get("view") || "feed";

  return (
    <aside className="bg-white rounded-2xl p-3 shadow-sm">
      <ul className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = link.id === activeLink;

          return (
            <li key={link.id}>
              <Link
                to={link.to}
                aria-current={isActive ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-main/10 text-main"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
