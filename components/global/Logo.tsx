import { NotebookPen } from "lucide-react";
import Link from "next/link";
import React from "react";

type LogoProps = {
  title?: string;
  href: string;
  labelShown?: boolean;
};

export default function Logo({ title, href, labelShown = true }: LogoProps) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-2 p-1.5 -m-1.5 text-black dark:text-white"
    >
      <span className="sr-only">{title}</span>
      <NotebookPen className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
      {labelShown && (
        <span className="font-black font-sans text-xl text-indigo-600 ">{title}</span>
        
      )}
      <span className="text-xl font-semibold text-black dark:text-white pl-2">x</span>
      <span className="text-2xl font-black text-red-500 pl-2">autoplant</span>
    </Link>
  );
}
