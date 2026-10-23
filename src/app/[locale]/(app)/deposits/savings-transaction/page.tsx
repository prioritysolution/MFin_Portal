import { getTranslations } from "next-intl/server";
import { SavingsTransactionView } from "@/features/deposits/savings-transaction/components/SavingsTransactionView";

export async function generateMetadata() {
  const t = await getTranslations("deposits.savingsTransaction");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function Page() {
  return <SavingsTransactionView />;
}
