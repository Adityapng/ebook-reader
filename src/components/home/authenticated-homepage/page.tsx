import { Session as BetterAuthSessionRecord } from "better-auth";
import ProfileMenu from "../homepage-components/profile-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { IconAlpha, IconBook } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

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

type AuthenticatedUserHomepageProps = {
  session: AuthClientSession;
};

export default function AuthenticatedUserHomepage({
  session,
}: AuthenticatedUserHomepageProps) {
  return (
    <section className=" h-screen flex flex-col">
      <NavComponent session={session} />
      <section className=" w-full h-full flex-1 p-5">
        <div className=" w-full h-full rounded-2xl shadow-[0px_0px_10px_rgba(194,_194,_194,_0.2)] flex justify-center items-center">
          <EmptyLibrary />
        </div>
      </section>
    </section>
  );
}

function NavComponent({ session }: AuthenticatedUserHomepageProps) {
  return (
    <nav className=" flex justify-between px-3 py-2 my-auto shrink-0">
      <div className=" flex gap-2 items-center">
        <IconAlpha className="" />
        <h1 className="text-xl font-bold ">AlphaReader</h1>
        <SidebarTrigger className=" ml-5" />
      </div>

      <ProfileMenu session={session} />
    </nav>
  );
}

function EmptyLibrary() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconBook />
        </EmptyMedia>
        <EmptyTitle>Document Library Empty</EmptyTitle>
        <EmptyDescription>
          Import files to your library to access them anywhere.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="sm">
          Upload Files
        </Button>
      </EmptyContent>
    </Empty>
  );
}
