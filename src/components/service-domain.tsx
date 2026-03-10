type ServiceItem = {
  id: string;
  title: string;
  description: string;
  caseText: string;
  entryName: string;
  entryUrl: string;
};

export function ServiceDomain({
  title,
  subtitle,
  items
}: {
  title: string;
  subtitle: string;
  items: ServiceItem[];
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-red-900/50 bg-gradient-to-br from-black via-zinc-950 to-red-950 p-6 text-zinc-100 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
        <h1 className="text-2xl font-bold text-red-300">{title}</h1>
        <p className="mt-2 text-zinc-300">{subtitle}</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6 text-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-red-500/70 hover:shadow-[0_14px_32px_rgba(153,27,27,0.28)]"
          >
            <h2 className="text-xl font-semibold text-red-300">{item.title}</h2>
            <p className="mt-2 text-zinc-300">{item.description}</p>
            <p className="mt-3 rounded-lg border border-red-500/40 bg-black/35 p-3 text-sm text-zinc-200">
              {item.caseText}
            </p>
            <a
              href={item.entryUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-red-700 to-red-600 px-4 py-2 font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(220,38,38,0.35)] active:scale-[0.98]"
            >
              {item.entryName}
            </a>
          </article>
        ))}
      </section>
    </div>
  );
}
