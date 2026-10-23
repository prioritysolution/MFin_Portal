



"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ClipLoader } from "react-spinners";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Coins,
  Globe,
  Landmark,
  Lock,
  Mail,
  ShieldCheck,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { IoIosCloudOutline } from "react-icons/io";
import Link from "next/link";
import Image from "next/image";
import DropdownFieldNew from "@/common/formFields/DropdownFieldNew";
import InputField from "@/common/formFields/InputField";
import BrandMark from "@/common/BrandMark";
import { setAppLanguage } from "@/i18n";
import { useTranslation } from "react-i18next";

const FeatureStripItem = ({ icon: Icon, label ,className}) => (
  <div className={`flex flex-1 flex-col items-center gap-1.5 text-center ${className}`}>
    <Icon
      size={28}
      className="shrink-0 text-white"
      strokeWidth={2}
      style={{ width: 28, height: 28 }}
    />
    <p className="text-[12px] font-medium leading-snug text-white/90 xl:text-[13px]">
      {label}
    </p>
  </div>
);

const Login = ({
  loading,
  afterLoginLoading,
  terminateSessionLoading,
  form,
  handleSubmit,
  financialYear = [],
  showActiveSessionDialog,
  setShowActiveSessionDialog,
  showOtpForm,
  handleShowOtpForm,
  otpForm,
  handleOtpFormSubmit,
  showResendOtp,
  handleResendOtp,
}) => {
  const { t, i18n } = useTranslation();
  const [showLoginLoading, setShowLoginLoading] = useState(false);

  const languageOptions = [
    { Id: "en", Option_Value: t("auth.langEnglish") },
    { Id: "bn", Option_Value: t("auth.langBangla") },
    { Id: "hi", Option_Value: t("auth.langHindi") },
    { Id: "or", Option_Value: t("auth.langOdia") },
  ];

  useEffect(() => {
    const current = i18n.language?.split("-")[0] || "en";
    if (form?.getValues?.("language") !== current) {
      form?.setValue?.("language", current, { shouldDirty: false });
    }
  }, [i18n.language, form]);

  useEffect(() => {
    if (afterLoginLoading && !showLoginLoading) {
      setShowLoginLoading(true);
      const timer = setTimeout(() => {
        setShowLoginLoading(false);
      }, 5 * 60 * 1000);
      return () => clearTimeout(timer);
    }
  }, [afterLoginLoading, showLoginLoading]);

  if (afterLoginLoading || showLoginLoading) {
    return (
      <div className="flex h-full min-h-dvh w-full flex-col items-center justify-center gap-4 bg-[#eaf4fc] px-4 sm:gap-6">
        <BrandMark />
        <div className="flex items-center gap-3 sm:gap-4">
          <p className="text-base font-medium tracking-wide text-gray-700 sm:text-lg">
            {t("auth.loading")}
          </p>
          <div className="flex items-center gap-2 sm:gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="inline-block h-2 w-2 rounded-full bg-[#1B74D6] sm:h-2.5 sm:w-2.5"
                style={{
                  animation: "bounce-dot 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
        <style>{`
          @keyframes bounce-dot {
            0%, 80%, 100% { opacity: 0.2; transform: scale(0.75); }
            40% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="relative h-full max-h-full w-full overflow-hidden bg-[#d7eefc]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src="/floginpagebg.png"
          alt=""
          fill
          priority
          unoptimized
          quality={100}
          sizes="100vw"
          className="select-none object-cover object-left"
        />
        <div className="absolute inset-0 bg-white/25 lg:hidden" />
      </div>

      <div className="relative z-10 flex h-full max-h-full flex-col overflow-hidden lg:flex-row">
        <section className="relative hidden h-full min-h-0 flex-1 flex-col overflow-hidden lg:flex">
         
         {/* left side content — matches mockup: brand, one-line headline, two-line subtitle */}
          <div className="relative z-20 shrink-0 px-10 pt-8 xl:px-14 xl:pt-10 2xl:px-16">
            <BrandMark />
            <h1 className="mt-7 whitespace-nowrap text-[22px] font-extrabold tracking-tight text-[#163A5F] xl:mt-8 xl:text-[26px] 2xl:text-[28px]">
              {t("auth.smarterBanking")}
              <span className="mx-2.5 font-medium text-[#1B74D6]">|</span>
              {t("auth.strongerCommunities")}
            </h1>
            <p className="mt-3 max-w-[460px] text-[13px] leading-[1.55] text-[#6B849E] xl:text-[14px]">
              {t("auth.subtitle")}
            </p>
          </div>

          <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-0 py-2">
            <Image
              src="/floginpageimg.png"
              alt={t("auth.illustrationAlt")}
              width={1536}
              height={1024}
              priority
              unoptimized
              className="h-auto w-[min(85%,780px)] max-h-[min(520px,55vh)] object-contain"
            />
          </div>

          {/* Bottom feature strip — solid gradient bar, full width, pinned to bottom */}
          <div className="relative z-20 mt-auto w-full shrink-0  px-10 py-5 xl:px-14 xl:py-6 2xl:px-16">
            <div className="mx-auto flex w-full max-w-[720px] items-start justify-between gap-4">
              <FeatureStripItem icon={ShieldCheck} label={t("auth.secureReliable")}  className="border-r-2 border-r-[#1B74D6]" />
              <FeatureStripItem icon={IoIosCloudOutline} label={t("auth.scalableArchitecture")}  className="border-r-2 border-r-[#1B74D6]" />
              <FeatureStripItem icon={Zap} label={t("auth.fasterOperations")}  className="border-r-2 border-r-[#1B74D6]" />
              <FeatureStripItem icon={Users} label={t("auth.betterMemberService")}  />
            </div>
          </div>
        </section>

        {/* Right login — fixed, no scroll */}
        <section className="flex h-full w-full shrink-0 items-center justify-center overflow-hidden p-3 sm:p-5 lg:w-[min(100%,720px)] lg:-ml-16 lg:justify-start lg:pl-2 lg:pr-8 xl:w-[780px] xl:-ml-24 xl:pl-4 xl:pr-10">
          <div
            className="flex w-full max-w-[500px] flex-col rounded-2xl border border-white/80 bg-white/95 px-5 py-5 shadow-[0_18px_50px_rgba(22,58,95,0.14)] backdrop-blur-md sm:max-w-[540px] sm:rounded-[28px] sm:px-9 sm:py-7"
            style={{ animation: "login-card-in 0.45s ease-out" }}
          >
            <div className="mb-2 flex items-center justify-end">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F8FD] px-2 py-0.5 text-[10px] font-medium text-[#6F87A3] sm:text-[11px]">
                <Lock className="h-3 w-3" />
                {t("auth.secureLogin")}
              </span>
            </div>

            <div className="mb-3 flex justify-center sm:mb-4">
              <BrandMark compact />
            </div>

            <div className="mb-5 text-center">
              <h2 className="text-[22px] font-extrabold leading-tight text-[#163A5F] sm:text-[24px]">
                {t("auth.welcomeBack")}
              </h2>
              <p className="mt-1 text-[12px] text-[#7A93B0] sm:text-[13px]">
                {t("auth.signInSubtitle")}
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex w-full flex-col gap-2.5 sm:gap-4"
                autoComplete="off"
              >
                <DropdownFieldNew
                  control={form.control}
                  name="language"
                  label={t("auth.language")}
                  options={languageOptions}
                  optionValueKey="Id"
                  optionLabelKey="Option_Value"
                  disableSorting
                  startContent={<Globe className="h-4 w-4" />}
                  onChange={(value) => {
                    setAppLanguage(value || "en");
                  }}
                />

                <DropdownFieldNew
                  control={form.control}
                  name="year_id"
                  label={t("auth.financialYear")}
                  placeholder={t("auth.selectFinancialYearPlaceholder")}
                  options={financialYear || []}
                  optionValueKey="Id"
                  optionLabelKey="Yr"
                  disabled={!financialYear || financialYear.length === 0}
                  startContent={<CalendarDays className="h-4 w-4" />}
                />

                <InputField
                  control={form.control}
                  name="email"
                  label={t("auth.emailUsername")}
                  placeholder={t("auth.enterEmailUsername")}
                  autoComplete="username"
                  autoFocus
                  startContent={<Mail className="h-4 w-4" />}
                />

                <InputField
                  control={form.control}
                  name="password"
                  label={t("auth.password")}
                  type="password"
                  placeholder={t("auth.enterPassword")}
                  autoComplete="current-password"
                  startContent={<Lock className="h-4 w-4" />}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer mt-2 h-12 w-full rounded-xl bg-linear-to-r from-[#1B74D6] to-[#0D5FBF] text-[14px] font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-[#1668c2] hover:to-[#0b54ab] hover:shadow-xl active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 sm:h-13 sm:text-[15px]"
                >
                  {loading ? (
                    <ClipLoader color="#fff" size={22} speedMultiplier={0.7} />
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      {t("auth.signIn")}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>

                <div className="flex justify-center">
                  <Link
                    href="/forgotPassword"
                    className="text-[12px] font-medium text-[#1B74D6] transition-colors hover:text-[#0D5FBF] hover:underline sm:text-[13px]"
                  >
                    {t("auth.forgotPasswordLink")}
                  </Link>
                </div>
              </form>
            </Form>

            <div className="mt-5 flex items-center justify-center gap-1.5 border-t border-[#eef3f8] pt-4 text-[10px] text-[#9AADC2] sm:text-[11px]">
              {/* <Image
                src="/pristlogo.png"
                alt=""
                width={16}
                height={16}
                className="h-4 w-4 object-contain"
              /> */}
              <Link
                href="https://prioritysolutions.in"
                target="_blank"
                className="text-[#9AADC2] hover:text-[#1B74D6]"
              >
                {t("auth.poweredBy")}
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Dialog
        open={showActiveSessionDialog}
        onOpenChange={setShowActiveSessionDialog}
      >
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-[500px] rounded-2xl p-4 sm:rounded-3xl sm:p-8">
          <div className="flex w-full flex-col gap-4 py-1 sm:gap-5">
            {!showOtpForm ? (
              <>
                <p className="text-center text-base font-semibold text-[#1a2e44] sm:text-lg">
                  {t("auth.terminateSession")}
                </p>
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
                  <Button
                    type="button"
                    className="h-11 flex-1 rounded-xl bg-linear-to-r from-red-500 to-red-600 font-semibold text-white shadow-md transition-all duration-200 hover:from-red-600 hover:to-red-700 hover:shadow-lg"
                    onClick={() => setShowActiveSessionDialog(false)}
                  >
                    {t("auth.cancel")}
                  </Button>
                  <Button
                    type="button"
                    className="h-11 flex-1 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 font-semibold text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
                    onClick={handleShowOtpForm}
                  >
                    {t("auth.continue")}
                  </Button>
                </div>
              </>
            ) : (
              <Form {...otpForm}>
                <form
                  onSubmit={otpForm.handleSubmit(handleOtpFormSubmit)}
                  className="w-full space-y-4 sm:space-y-5"
                  autoComplete="off"
                >
                  <InputField
                    control={otpForm.control}
                    name="otp"
                    label={t("auth.otp")}
                    placeholder={t("auth.enterOtp")}
                    type="number"
                    maxLength={6}
                    startContent={
                      <Lock className="h-4 w-4 text-[#b0bec8]" />
                    }
                  />

                  {showResendOtp && (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[13px] font-medium text-[#1B74D6] hover:underline focus:outline-none"
                    >
                      {t("auth.resendOtp")}
                    </button>
                  )}

                  <Button
                    type="submit"
                    disabled={terminateSessionLoading}
                    className="h-11 w-full rounded-xl bg-linear-to-r from-[#1B74D6] to-[#0D5FBF] text-[14px] font-semibold text-white shadow-lg transition-all duration-200 hover:from-[#1668c2] hover:to-[#0b54ab] disabled:cursor-not-allowed disabled:opacity-70 sm:h-12 sm:text-[15px]"
                  >
                    {terminateSessionLoading ? (
                      <ClipLoader
                        color="#fff"
                        size={22}
                        speedMultiplier={0.7}
                      />
                    ) : (
                      t("auth.submit")
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes login-card-in {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Login;