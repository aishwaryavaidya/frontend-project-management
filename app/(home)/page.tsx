// import ComparisonFeatures from "@/components/ComparisonFeatures";
import Announcement from "@/components/frontend/announcement";
import { Testimonials } from "@/components/frontend/testimonials";
import { AnimatedAvatars } from "@/components/global/avatar-circles";
import { CustomLinkButton } from "@/components/global/CustomLinkButton";
// import Iframe from "react-iframe";
// import StarRating from "@/components/global/StarRating";
// import HowItWorks from "@/components/HowItWorks";
// import { BorderBeam } from "@/components/magicui/border-beam";
// import { ModeToggle } from "@/components/mode-toggle";
// import { Star } from "lucide-react";
// import Image from "next/image";
// import { FaStar } from "react-icons/fa";
// import SectionHeading from "@/components/global/SectionHeading";
// import Pricing from "@/components/Pricing";
// import { FAQ } from "@/components/FAQ";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/config/auth";
// import { useSession } from "next-auth/react";
// import { CustomerReviews } from "@/components/frontend/CustomerReviews";
// import Showcase from "@/components/frontend/showcase";
// import { getKitUsers } from "@/actions/users";


export default async function Home() {

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-4xl py-4 ">
      <div className="hidden sm:mb-6 sm:flex sm:justify-center">
          <Announcement title="New Registrations" href="/register" />
        </div>
        <h1 className="text-3xl mb-2 font-bold text-center justify-center tracking-tight text-gray-900 sm:text-6xl dark:text-white">Project Manager 24x7.</h1>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-red-700 sm:text-2xl">
          Paperless, Zero-Touch, End to End Logistics Execution
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 mb-4 dark:text-slate-300">
          99% of businesses have massive blind spots in their End-to-End Logistics Chain. Autoplants Logistics Excellence Platform rectifies that.
          </p>
          <CustomLinkButton title="Go to Dashboard" href="/dashboard/home/summary" />
          <div className="pt-4 pb-4 flex items-center  justify-center gap-8">
            <div className="">
              <AnimatedAvatars />
            </div>
            <div className="">
              <p className="dark:text-slate-100">200+ employees connected.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
