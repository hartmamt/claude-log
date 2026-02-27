export function WrappedCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`wrapped-card ${className}`}>
      <div className="max-w-xl mx-auto w-full px-6">{children}</div>
    </section>
  );
}
