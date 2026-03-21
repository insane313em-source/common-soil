type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export default function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionTitleProps) {
  const center = align === "center";

  return (
    <div className={center ? "text-center" : ""}>
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
          {eyebrow}
        </p>
      ) : null}

      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h1>

      {description ? (
        <p
          className={`mt-4 text-base leading-7 text-zinc-400 ${
            center ? "mx-auto max-w-2xl" : "max-w-2xl"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}