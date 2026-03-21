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
    <div className="mx-auto max-w-3xl fade-up-soft">
      <div className="glass-panel soft-grid rounded-[30px] p-8 sm:p-10">
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
          Common Soil
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          {title}
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
          {description}
        </p>

        {(primaryHref || secondaryHref) && (
          <div className="mt-7 flex flex-wrap gap-3">
            {primaryHref && primaryLabel ? (
              <a
                href={primaryHref}
                className="primary-button rounded-full px-6 py-3 text-sm font-medium"
              >
                {primaryLabel}
              </a>
            ) : null}

            {secondaryHref && secondaryLabel ? (
              <a
                href={secondaryHref}
                className="secondary-button rounded-full px-6 py-3 text-sm"
              >
                {secondaryLabel}
              </a>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}