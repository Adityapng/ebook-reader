"use client";

import Layout from "@/components/home/authenticated-homepage/layout";
import AuthenticatedUserHomepage from "@/components/home/authenticated-homepage/page";
import NewUserLandingPage from "@/components/home/new-user-homepage/new-user-landing-page";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const { data: session, isPending: loading } = authClient.useSession();
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="w-full mx-auto">
      <div className="  space-y-6">
        {session == null ? (
          <NewUserLandingPage />
        ) : (
          <Layout>
            <AuthenticatedUserHomepage session={session} />
          </Layout>
        )}
      </div>
    </div>
  );
}
