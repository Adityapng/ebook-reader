import {
  //   AppleIcon,
  GithubIcon,
  GoogleIcon,
} from "@/components/auth/o-auth-icons";
import { ComponentProps, ElementType } from "react";

export const SUPPORTED_OAUTH_PROVIDERS = [
  // "apple",
  "google",
  "github",
];
export type SupportedOAuthProvider = (typeof SUPPORTED_OAUTH_PROVIDERS)[number];

export const SUPPORTED_OAUTH_PROVIDERS_DETAILS: Record<
  SupportedOAuthProvider,
  { name: string; Icon: ElementType<ComponentProps<"svg">> }
> = {
  //   apple: { name: "Apple", Icon: AppleIcon },
  google: { name: "Google", Icon: GoogleIcon },
  github: { name: "Github", Icon: GithubIcon },
};
