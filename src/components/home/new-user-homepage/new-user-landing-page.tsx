import Link from "next/link";
import { Button } from "../../ui/button";
import { IconAlpha } from "@tabler/icons-react";

export default function NewUserLandingPage() {
  return (
    <div className=" w-full h-screen relative ">
      <NavComponent />
      <div className="flex flex-col justify-center items-center h-full">
        <div className=" w-96 flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold">Welcome to our app</h1>
          <Button asChild size="lg">
            <Link href="/auth/login">Sign In / Sign Up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function NavComponent() {
  return (
    <nav className="flex justify-between px-3 py-2 shrink-0 border rounded-2xl w-1/2 sticky top-3 mx-auto">
      <div className="flex gap-2 items-center">
        <IconAlpha />
        <h1 className="text-xl font-bold">AlphaReader</h1>
        {/* <SidebarTrigger className="ml-5" /> */}
      </div>

      {/* Upload Button */}
      <div className="flex items-center gap-3">
        {/* <input
          id="file"
          type="file"
          accept=".pdf,.epub,.mobi,.azw,.azw3,.fb2,.txt,.rtf,.doc,.docx,.odt"
          onChange={handleUpload}
          className="hidden"
        /> */}
        <Button asChild variant="outline" size="sm" className=" rounded-full">
          <label
            // htmlFor="file"
            className="cursor-pointer flex items-center gap-2"
          >
            Get Started
          </label>
        </Button>

        {/* <ProfileMenu session={session} /> */}
      </div>
    </nav>
  );
}
