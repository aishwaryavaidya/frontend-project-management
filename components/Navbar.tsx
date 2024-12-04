import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";



const Navbar = () => {
  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-black">
      {/* Side Trigger */}
      <SidebarTrigger />

      {/* Icons */}
      <div className="flex items-center">
        <ModeToggle />
        <div className="ml-2 mr-5 hidden min-h-[2em] w-[0.1rem] bg-gray-200 md:inline-block"></div>
        <div className="hidden items-center justify-between md:flex">
          <div className="align-center flex h-9 w-9 justify-center">
            <Avatar />
          </div>
          <span className="mx-3 text-gray-800 dark:text-white">
          </span>
          <button>Log out</button>
        </div>
      </div>
    </div>
  )
}





//     <div className="flex items-center justify-between bg-gray-100 px-4 py-3 dark:bg-black">
//        {/* Sidebar Trigger */}
//        <SidebarTrigger />
//       {/* Search Bar */}
//       <div className="flex items-center gap-8">
//         {!isSidebarCollapsed ? null : (
//           <button
//             onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
//           >
//             <Menu className="h-8 w-8 dark:text-white" />
//           </button>
//            )}
//            <div className="relative flex h-min w-[200px]">
//              <Search className="absolute left-[4px] top-1/2 mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer dark:text-white" />
//              <input
//                className="w-full rounded border-none bg-gray-100 p-2 pl-8 placeholder-gray-500 focus:border-transparent focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-white"
//                type="search"
//                placeholder="Search..."
//              />
//            </div>
//          </div>
   
         
     
      
//       {/* Breadcrumb */}
//       <Breadcrumb>
//         <BreadcrumbList>
//           <BreadcrumbItem>
//             <BreadcrumbLink href="/">Home</BreadcrumbLink>
//           </BreadcrumbItem>
//           <BreadcrumbSeparator />
//           <BreadcrumbItem>
//             <BreadcrumbLink href="/components">Components</BreadcrumbLink>
//           </BreadcrumbItem>
//           <BreadcrumbSeparator />
//           <BreadcrumbItem>
//             <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
//           </BreadcrumbItem>
//         </BreadcrumbList>
//       </Breadcrumb>

//       {/* Mode Toggle */}
//       <ModeToggle />

//       {/* Avatar */}
//       <Avatar>
//         <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
//         <AvatarFallback>CN</AvatarFallback>
//       </Avatar>

//       {/* Login Button */}
//       <Button asChild>
//         <Link href="/login">Login</Link>
//       </Button>
//     </div>
//   );
// };

export default Navbar;
