import PromoBanner from "@/components/frontend/PromoBanner";
import Footer from "@/components/frontend/site-footer";
import SiteHeader from "@/components/frontend/site-header";

import { authOptions } from "@/config/auth";
import { getServerSession } from "next-auth";
import React, { ReactNode } from "react";

export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <div>
      <main className="overflow-auto">
        <div className="bg-white dark:bg-gray-950">
          {/* <PromoBanner /> */}
          <SiteHeader session={session} />
          <div className="relative isolate px-6 pt-14 lg:px-8">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            >
              <div
                style={{
                  clipPath:
                    "polygon(0% 50%, 25% 30%, 50% 45%, 75% 30%, 100% 50%, 75% 70%, 50% 55%, 25% 70%, 0% 50%)",
                }}
                className="relative aspect-[1155/678] w-[72.1875rem] mx-auto bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 dark:from-[#ff80b5] dark:to-[#4f46e5] dark:opacity-100"
              />
            </div>
            {children}
            <Footer />
            {/* <div
              aria-hidden="true"
              className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)] dark:bg-gray-950"
            >
              <div
                style={{
                  clipPath:
                    "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                }}
                className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] dark:opacity-100"
              />
            </div> */}
          </div>
        </div>
      </main>
    </div>
  );
}
