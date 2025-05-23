"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/generateInitials";
import { Session } from "next-auth";
import Link from "next/link";
import LogoutBtn from "@/components/global/LogoutBtn";

export default function AuthenticatedAvatar({ session }: { session: Session | null }) {
  const userInitials = getInitials(session?.user?.name || "");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer" asChild>
        <Avatar>
          <AvatarImage
            src={session?.user.image ?? ""}
            alt={session?.user.name ?? ""}
          />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          <p>{session?.user?.name}</p>
          <p className="text-xs text-muted-foreground">
            {session?.user?.email}
          </p>
<p className="text-xs text-muted-foreground">
            {session?.user?.code}
          </p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>Services</DropdownMenuItem>
        {/* <DropdownMenuItem>Team</DropdownMenuItem> */}

      <DropdownMenuItem>
          <LogoutBtn />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
