import { Session as BetterAuthSessionRecord } from "better-auth";
import ProfileMenu from "../homepage-components/profile-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";

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
    <>
      <nav className=" flex justify-between px-3 py-2 relative">
        <h1 className="text-xl font-bold my-auto">AlphaReader</h1>

        <ProfileMenu session={session} />
        <div className=" absolute left-3 top-full">
          <SidebarTrigger />
        </div>
      </nav>
    </>
  );
}
