// Auth disabled — redirect straight to dashboard
import { redirect } from "next/navigation";

export default function SignInPage() {
  redirect("/dashboard");
}
