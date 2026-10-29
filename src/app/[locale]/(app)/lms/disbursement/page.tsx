import { getTranslations } from "next-intl/server";
import { LmsDisbursementView } from "@/features/lms/disbursement/components/LmsDisbursementView";

export async function generateMetadata() {
  const t = await getTranslations("loanModule.screens.disbursement");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function Page() {
  return <LmsDisbursementView />;
}
