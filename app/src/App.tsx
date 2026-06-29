import { useEffect, useMemo, useRef } from "react";
import { CommandBar } from "@/components/CommandBar";
import { QuickBar } from "@/components/QuickBar";
import { WorkspaceTabs } from "@/components/WorkspaceTabs";
import { StatusBar } from "@/components/StatusBar";
import { FunctionPanel } from "@/components/FunctionPanel";
import { useWorkspace } from "@/store/workspaceStore";
import { FUNCTIONS } from "@/lib/functions";

import { CC } from "@/functions/CC";
import { INTEL } from "@/functions/INTEL";
import { HELP } from "@/functions/HELP";
import { DES } from "@/functions/DES";
import { GP } from "@/functions/GP";
import { QR } from "@/functions/QR";
import { HP } from "@/functions/HP";
import { FA } from "@/functions/FA";
import { KEY as KEYFN } from "@/functions/KEY";
import { DVD } from "@/functions/DVD";
import { EE } from "@/functions/EE";
import { NI } from "@/functions/NI";
import { WEI } from "@/functions/WEI";
import { MOV } from "@/functions/MOV";
import { OMON } from "@/functions/OMON";
import { CURV } from "@/functions/CURV";
import { FXC } from "@/functions/FXC";
import { CRYPTO } from "@/functions/CRYPTO";

const SCREENS: Record<string, (symbol?: string) => JSX.Element> = {
  CC: () => <CC />,
  INTEL: (s) => <INTEL symbol={s!} />,
  HELP: () => <HELP />,
  DES: (s) => <DES symbol={s!} />,
  GP:  (s) => <GP symbol={s!} />,
  QR:  (s) => <QR symbol={s!} />,
  HP:  (s) => <HP symbol={s!} />,
  FA:  (s) => <FA symbol={s!} />,
  KEY: (s) => <KEYFN symbol={s!} />,
  DVD: (s) => <DVD symbol={s!} />,
  EE:  (s) => <EE symbol={s!} />,
  NI:  (s) => <NI symbol={s!} />,
  WEI: () => <WEI />,
  MOV: () => <MOV />,
  OMON: (s) => <OMON symbol={s!} />,
  CURV: () => <CURV />,
  FXC: () => <FXC />,
  CRYPTO: () => <CRYPTO />,
};

export default function App() {
  const { tabs, activeTabId } = useWorkspace();
  const active = useMemo(() => tabs.find((t) => t.id === activeTabId) ?? tabs[0], [tabs, activeTabId]);
  const screen = active && SCREENS[active.code]?.(active.symbol);

  // Keep URL in sync with the active tab (bookmarkable / shareable).
  // Skip the very first render so we don't overwrite the incoming URL params
  // before the store's onRehydrateStorage navigation has applied.
  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return; }
    if (!active) return;
    const p = new URLSearchParams();
    p.set("cmd", active.code);
    if (active.symbol) p.set("symbol", active.symbol);
    window.history.replaceState(null, "", `${window.location.pathname}?${p.toString()}`);
  }, [active]);

  return (
    <div className="h-screen flex flex-col">
      <CommandBar />
      <QuickBar />
      <WorkspaceTabs />
      <div className="flex-1 min-h-0 p-1 flex">
        {active && (
          <FunctionPanel code={active.code} symbol={active.symbol}>
            {screen ?? <div className="p-4 text-term-muted">Function not implemented.</div>}
          </FunctionPanel>
        )}
      </div>
      <StatusBar />
    </div>
  );
}

// Ensure FUNCTIONS is kept (for autocomplete discovery)
void FUNCTIONS;
