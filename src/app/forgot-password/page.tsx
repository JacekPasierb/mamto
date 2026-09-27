import {auth} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";

import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default async function ForgotPasswordPage() {
  const {userId} = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return <ForgotPasswordForm />;
}
