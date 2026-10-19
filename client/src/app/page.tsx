"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DataProvider, useData } from "@/context/DataContext";
import BootSequence from "@/components/os/BootSequence";
import Desktop from "@/components/os/Desktop";
import DeskScene from "@/components/desk/DeskScene";

type Mode = "desk" | "boot" | "os";

function PortfolioApp() {
  const { data } = useData();
  const defaultMode = (data.config?.defaultMode as Mode) || "desk";
  const [mode, setMode] = useState<Mode>(defaultMode);

  const handleOpenOS = () => setMode("boot");
  const handleBootDone = () => setMode("os");
  const handleSwitchToDesk = () => setMode("desk");

  return (
    <AnimatePresence mode="wait">
      {mode === "desk" && (
        <motion.div
          key="desk"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <DeskScene onOpenOS={handleOpenOS} />
        </motion.div>
      )}

      {mode === "boot" && (
        <motion.div
          key="boot"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <BootSequence
            osName={data.config?.osName || "AmineOS"}
            osVersion={data.config?.osVersion || "3.0"}
            onComplete={handleBootDone}
          />
        </motion.div>
      )}

      {mode === "os" && (
        <motion.div
          key="os"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Desktop onSwitchToDesk={handleSwitchToDesk} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function HomePage() {
  return (
    <DataProvider>
      <PortfolioApp />
    </DataProvider>
  );
}
