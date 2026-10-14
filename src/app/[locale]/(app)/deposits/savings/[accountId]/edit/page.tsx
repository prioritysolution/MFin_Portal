import { getTranslations } from "next-intl/server";
import { DepositAccountEditPage } from "@/features/deposits/savings/components/DepositAccountEditPage";

export async function generateMetadata() {
  const t = await getTranslations("deposits.savings");
  return {
    title: t("form.editTitle"),
    description: t("metaDescription"),
  };
}

type PageProps = {
  params: Promise<{ accountId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { accountId } = await params;
  const id = Number(accountId);
  return <DepositAccountEditPage accountId={Number.isFinite(id) ? id : 0} />;
}
