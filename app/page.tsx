import Image from "next/image";

import Link from "next/link";
import { ArrowRight, BookOpen, Clock, CalendarDays } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 mb-4">
                SPM IAS Academy
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-slate-900">
                APSC CCE 2025 <br className="hidden sm:inline" />
                Mains Mock Test Series
              </h1>
              <p className="mx-auto max-w-[700px] text-slate-600 md:text-lg mt-6 mb-8 font-medium">
                Register your roll number to access the Mains Mock Test schedule. Available in both online and offline formats for qualified candidates.
              </p>
              <div className="space-x-4 mt-8">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700 disabled:pointer-events-none disabled:opacity-50"
                >
                  Register Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-3 text-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Expert Evaluation</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Detailed line-by-line feedback from selected APSC officers and senior faculty members.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Test Centers</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Join us offline at our Guwahati center, or write from anywhere via our dedicated online portal.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sm:col-span-2 lg:col-span-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Exam Simulation</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Strict adherence to the latest APSC standards, question patterns, and timing.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-slate-200 bg-white">
        <p className="text-xs text-slate-500">© 2026 SPM IAS Academy. All rights reserved.</p>
      </footer>
    </div>
  );
}
