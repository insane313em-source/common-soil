type EmptyStateCardProps = {
    title: string;
    description: string;
    primaryHref?: string;
    primaryLabel?: string;
    secondaryHref?: string;
    secondaryLabel?: string;
  };
  
  export default function EmptyStateCard({
    title,
    description,
    primaryHref,
    primaryLabel,
    secondaryHref,
    secondaryLabel,
  }: EmptyStateCardProps) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-4 leading-7 text-zinc-400">{description}</p>
  
        {(primaryHref || secondaryHref) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {primaryHref && primaryLabel ? (
              <a
                href={primaryHref}
                className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black hover:bg-zinc-200"
              >
                {primaryLabel}
              </a>
            ) : null}
  
            {secondaryHref && secondaryLabel ? (
              <a
                href={secondaryHref}
                className="rounded-full border border-zinc-700 px-5 py-3 text-sm text-white hover:bg-zinc-900"
              >
                {secondaryLabel}
              </a>
            ) : null}
          </div>
        )}
      </div>
    );
  }