type SectionTitleProps = {
    eyebrow?: string;
    title: string;
    description?: string;
  };
  
  export default function SectionTitle({
    eyebrow,
    title,
    description,
  }: SectionTitleProps) {
    return (
      <div>
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>
    );
  }