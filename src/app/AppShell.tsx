import { motion } from "motion/react";
import { Navigation } from "@/app/Navigation";
import { Header } from "@/app/Header";
import { EditModeBanner } from "@/features/editmode/EditModeBanner";
import { SettingsButton } from "@/features/settings/SettingsButton";
import { useResponsiveLayout } from "@/common/hooks/useResponsiveLayout";
import { PullToRefresh } from "@/common/components/motion/PullToRefresh";
import { bootstrapStore } from "@/store/bootstrap";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isDesktop } = useResponsiveLayout();

  return (
    <div className="flex min-h-dvh">
      {isDesktop && (
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.16 }}
          className="sticky top-0 h-dvh self-start"
        >
          <Navigation orientation="side" />
        </motion.div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
        >
          <Header />
        </motion.div>
        <EditModeBanner />
        <PullToRefresh onRefresh={async () => void (await bootstrapStore())}>
          <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.08 }}
            className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-4 lg:pb-8"
          >
            {children}
          </motion.main>
        </PullToRefresh>
      </div>
      {!isDesktop && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.16 }}
        >
          <Navigation orientation="bottom" />
        </motion.div>
      )}
      <SettingsButton />
    </div>
  );
}
