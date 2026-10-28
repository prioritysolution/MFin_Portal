import { getTranslations } from "next-intl/server";
import { LosFieldVerificationView } from "@/features/los/components/LosFieldVerificationView";

export async function generateMetadata() {
  const t = await getTranslations("loanModule.screens.fieldVerification");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function Page() {
  return <LosFieldVerificationView />;
}
