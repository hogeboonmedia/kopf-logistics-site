import Link from "next/link";
import { Truck, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-orange-600/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Truck className="w-8 h-8 text-orange-500" />
        </div>
        <h1 className="text-8xl font-black text-orange-600/30 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-white mb-3">Wrong Turn</h2>
        <p className="text-stone-400 mb-8">
          Looks like this load took a wrong exit. The page you&apos;re looking
          for doesn&apos;t exist — but we can get you back on route.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold px-6 py-3 rounded transition-colors duration-200"
          >
            Back to Home
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 border border-stone-700 hover:border-stone-500 text-white font-medium px-6 py-3 rounded transition-colors duration-200"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
