import { authClient } from "@/lib/auth-client";
import BetterAuthActionComponent from "../../auth/better-auth-action-component";
import { Session as BetterAuthSessionRecord } from "better-auth";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DollarSign, LogOut, Plus, User } from "lucide-react";

export type AuthClientSession = {
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
  };
  session: BetterAuthSessionRecord;
};

type ProfileMenuProps = {
  session: AuthClientSession;
};

export default function ProfileMenu(props: ProfileMenuProps) {
  const { session } = props;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className=" size-9 cursor-pointer select-none">
          <AvatarImage src={`${session.user.image}`} />
          <AvatarFallback className=" font-semibold">
            {session.user.name[0]}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className=" w-56 mr-3">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Profile
          <DropdownMenuShortcut>
            <User strokeWidth={2.25} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Billing
          <DropdownMenuShortcut>
            <DollarSign strokeWidth={2.25} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Import{" "}
          <DropdownMenuShortcut>
            <Plus strokeWidth={2.25} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <BetterAuthActionComponent
            size="smLogout"
            variant="ghost"
            action={() => authClient.signOut()}
            className=" px-0 py-0 text-sm font-[400] flex justify-start"
          >
            Log out
          </BetterAuthActionComponent>
          <DropdownMenuShortcut>
            <LogOut strokeWidth={2.25} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
