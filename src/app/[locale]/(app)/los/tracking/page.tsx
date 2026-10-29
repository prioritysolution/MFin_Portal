import { getTranslations } from "next-intl/server";
import { LosTrackingView } from "@/features/los/components/LosTrackingView";

export async function generateMetadata() {
  const t = await getTranslations("loanModule.screens.tracking");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function Page() {
  return <LosTrackingView />;
}
