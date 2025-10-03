"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignUpTab from "./_components/sign-up-tab";
import SignInTab from "./_components/sign-in-tab";
import { Separator } from "@/components/ui/separator";
import { SocialAuthButtons } from "./_components/social-auth-buttons";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    authClient.getSession().then((session) => {
      if (session.data != null) {
        router.push("/");
      }
    });
  }, [router]);
  return (
    <div className=" flex justify-center items-center w-screen h-screen">
      <div className=" max-w-md w-full">
        <Tabs defaultValue="signin" className=" mx-auto w-full my-6 px-4">
          <TabsList>
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Card>
              <CardHeader className=" text-2xl font-bold">
                <CardTitle>Sign In</CardTitle>
              </CardHeader>
              <CardContent>
                <SignInTab />
              </CardContent>
              <Separator />
              <CardFooter className=" grid grid-cols-2  gap-2">
                <SocialAuthButtons />
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card>
              <CardHeader className=" text-2xl font-bold">
                <CardTitle>Sign Up</CardTitle>
              </CardHeader>
              <CardContent>
                <SignUpTab />
              </CardContent>
              <Separator />
              <CardFooter className=" grid grid-cols-2 gap-3">
                <SocialAuthButtons />
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
