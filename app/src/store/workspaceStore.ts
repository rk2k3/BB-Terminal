import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FunctionCode } from "@/lib/functions";
import { parseCommand } from "@/lib/functions";

// Captured before React renders so URL sync effects can't overwrite it
const _initialSearch = window.location.search;

export interface Tab {
  id: string;
  code: FunctionCode;
  symbol?: string;
}

interface WorkspaceState {
  tabs: Tab[];
  activeTabId: string | null;
  activeSymbol: string | null;
  openTab: (code: FunctionCode, symbol?: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  setActiveSymbol: (s: string) => void;
}

const tabId = (code: string, symbol?: string) => `${code}:${symbol ?? "_"}`;

export const useWorkspace = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      tabs: [{ id: "CC:_", code: "CC" }],
      activeTabId: "CC:_",
      activeSymbol: "AAPL",
      openTab: (code, symbol) => {
        const s = symbol?.toUpperCase();
        const id = tabId(code, s);
        const { tabs } = get();
        const existing = tabs.find((t) => t.id === id);
        if (existing) {
          set({ activeTabId: id, activeSymbol: s ?? get().activeSymbol });
        } else {
          set({
            tabs: [...tabs, { id, code, symbol: s }],
            activeTabId: id,
            activeSymbol: s ?? get().activeSymbol,
          });
        }
      },
      closeTab: (id) => {
        const { tabs, activeTabId } = get();
        const remaining = tabs.filter((t) => t.id !== id);
        const next = remaining.length > 0
          ? (activeTabId === id ? remaining[remaining.length - 1].id : activeTabId)
          : null;
        set({ tabs: remaining, activeTabId: next });
        if (remaining.length === 0) {
          // always keep Command Center open as a fallback
          set({
            tabs: [{ id: "CC:_", code: "CC" }],
            activeTabId: "CC:_",
          });
        }
      },
      setActiveTab: (id) => set({ activeTabId: id }),
      setActiveSymbol: (s) => set({ activeSymbol: s.toUpperCase() }),
    }),
    {
      name: "bbterminal-workspace",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const p = new URLSearchParams(_initialSearch);
        const q = p.get("q");
        const cmd = p.get("cmd");
        const sym = p.get("symbol");
        if (q) {
          const parsed = parseCommand(q, state.activeSymbol);
          if (parsed) state.openTab(parsed.code, parsed.symbol);
        } else if (cmd) {
          const parsed = parseCommand(sym ? `${sym} ${cmd}` : cmd, state.activeSymbol);
          if (parsed) state.openTab(parsed.code, parsed.symbol);
        }
      },
    }
  )
);
