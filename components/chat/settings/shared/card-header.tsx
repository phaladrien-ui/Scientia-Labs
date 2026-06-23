export function CardHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
      <h3 className="text-[16px] font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>
      <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-0.5">
        {description}
      </p>
    </div>
  );
}
