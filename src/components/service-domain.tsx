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
      <section className="panel p-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-slate-600">{subtitle}</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.id}
            className="panel p-6 transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(15,23,42,0.1)]"
          >
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="mt-2 text-slate-600">{item.description}</p>
            <p className="mt-3 rounded-lg border border-brand-100 bg-brand-50/60 p-3 text-sm text-slate-700">
              {item.caseText}
            </p>
            <a
              href={item.entryUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary mt-4"
            >
              {item.entryName}
            </a>
          </article>
        ))}
      </section>
    </div>
  );
}
