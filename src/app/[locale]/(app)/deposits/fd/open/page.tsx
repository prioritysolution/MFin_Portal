import { getTranslations } from "next-intl/server";
import { DepositAccountOpenPage } from "@/features/deposits/savings/components/DepositAccountOpenPage";

export async function generateMetadata() {
  const t = await getTranslations("deposits.term");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function Page() {
  return <DepositAccountOpenPage kind="term" listPath="/deposits/fd" />;
}
