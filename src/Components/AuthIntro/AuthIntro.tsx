const stats = [
  { value: "2012", label: "Founded" },
  { value: "40K+", label: "Graduates" },
  { value: "50+", label: "Partner Companies" },
  { value: "5", label: "Branches" },
  { value: "20", label: "Diplomas Available" },
];
function AuthIntro() {
  return (
    <div className="">
      <h1 className="text-4xl font-extrabold tracking-tight text-main sm:text-[56px] sm:leading-tight">
        Route Posts
      </h1>

      <p className="mt-3 max-w-2xl text-lg leading-snug text-slate-800 sm:text-2xl">
        Connect with friends and the world around you on Route Posts.
      </p>

      <div className="mt-6 rounded-2xl border border-indigo-200 bg-white/80 p-5 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-800">
          About Route Academy
        </p>

        <h2 className="mt-2 text-base font-bold text-slate-900">
          Egypt's Leading IT Training Center Since 2012
        </h2>

        <p className="mt-2 text-[13px] leading-[1.8] text-slate-600">
          Route Academy is the premier IT training center in Egypt, established
          in 2012. We specialize in delivering high-quality training courses in
          programming, web development, and application development. We've
          identified the unique challenges people may face when learning new
          technology and made efforts to provide strategies to overcome them.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-indigo-200 bg-indigo-50/60 px-3 py-2.5"
            >
              <p className="text-base font-extrabold text-main">{stat.value}</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase text-slate-600">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AuthIntro;
