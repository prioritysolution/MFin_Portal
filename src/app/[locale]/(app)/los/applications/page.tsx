import { getTranslations } from "next-intl/server";
import { LosApplicationsView } from "@/features/los/components/LosApplicationsView";

export async function generateMetadata() {
  const t = await getTranslations("los.applications");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function Page() {
  return <LosApplicationsView />;
}
