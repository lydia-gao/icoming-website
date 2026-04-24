import Link from "next/link";

export default function NotFound() {
  return (
    <section className="py-24">
      <div className="container-content max-w-xl text-center">
        <div className="eyebrow">404</div>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-ink-900">
          That page has wandered off.
        </h1>
        <p className="mt-4 text-ink-600">
          The page you&apos;re looking for doesn&apos;t exist or was moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">Home</Link>
          <Link href="/products" className="btn-secondary">Browse products</Link>
        </div>
      </div>
    </section>
  );
}
