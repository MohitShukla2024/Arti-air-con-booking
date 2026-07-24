import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-6 text-[#191c1e]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#c2c6d8]/30 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-[#0050cb] flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0050cb] bg-blue-50 px-3 py-1 rounded-full">
            404 Error
          </span>
          <h1 className="font-display text-2xl font-bold pt-2">Page Not Found</h1>
          <p className="text-sm text-[#424656] leading-relaxed">
            The page you are looking for does not exist or may have been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto bg-[#0050cb] hover:bg-[#003da1] text-white font-bold rounded-full px-6 py-2.5 flex items-center justify-center gap-2 text-sm transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>

          <Link
            href="/book"
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-[#191c1e] font-bold rounded-full px-6 py-2.5 flex items-center justify-center gap-2 text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Book Service
          </Link>
        </div>
      </div>
    </div>
  );
}
