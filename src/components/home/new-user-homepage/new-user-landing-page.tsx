import Link from "next/link";
import { Button } from "../../ui/button";

export default function NewUserLandingPage() {
  return (
    <div className=" flex flex-col justify-center">
      <h1 className="text-3xl font-bold">Welcome to our app</h1>{" "}
      <Button asChild size="lg">
        <Link href="/auth/login">Sign In / Sign Up</Link>
      </Button>
    </div>
  );
}
