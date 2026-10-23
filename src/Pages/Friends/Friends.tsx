import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import SuggestedFriends from "../../Components/SuggestedFriends/SuggestedFriends";

export default function Friends() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link
        to="/Feed"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-main transition hover:bg-slate-50"
      >
        <ArrowLeft size={16} />
        Back to feed
      </Link>
      <SuggestedFriends fullPage />
    </div>
  );
}
