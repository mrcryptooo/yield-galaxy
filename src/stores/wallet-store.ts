import { create } from 'zustand';
import type { Connection, PublicKey } from '@solana/web3.js';
import { fetchPortfolio, describeWalletError, type TokenBalance, type WalletPosition } from '@/lib/wallet/portfolio';
import { fetchSolPrice } from '@/lib/wallet/price';

// A dedicated store for real wallet connection + portfolio state — kept
// entirely separate from journey/execution/optimizer stores. The actual
// Solana Wallet Adapter connection lives in React context (it has to — it's
// hook-based), so a small bridge (set via `_setBridge`, wired from
// `solana-wallet-provider.tsx`) lets this store's own connect/disconnect/
// refresh methods work from anywhere (Top Bar, Captain, Mission Control)
// without every caller needing useWallet()/useConnection() directly.
interface WalletBridge {
  connection: Connection;
  publicKey: PublicKey | null;
  select: (walletName: string) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

interface WalletState {
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  walletName: string | null;
  publicKey: string | null;
  balances: { sol: number };
  tokens: TokenBalance[];
  positions: WalletPosition[];
  solUsdPrice: number | null;
  solUsdChange24h: number | null;
  lastRefresh: string | null;
  loading: boolean;
  error: string | null;

  connect: (walletName?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;

  _bridge: WalletBridge | null;
  _setBridge: (bridge: WalletBridge | null) => void;
  _setError: (error: string | null) => void;
  _setStatus: (status: {
    connected: boolean;
    connecting: boolean;
    disconnecting: boolean;
    walletName: string | null;
    publicKey: string | null;
  }) => void;
  _clearData: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  connected: false,
  connecting: false,
  disconnecting: false,
  walletName: null,
  publicKey: null,
  balances: { sol: 0 },
  tokens: [],
  positions: [],
  solUsdPrice: null,
  solUsdChange24h: null,
  lastRefresh: null,
  loading: false,
  error: null,

  connect: async (walletName) => {
    const { _bridge } = get();
    if (!_bridge) return;
    set({ error: null });
    try {
      if (walletName) {
        // WalletProvider is mounted with `autoConnect`, which watches for a
        // wallet becoming selected and connects it — calling connect()
        // immediately after select() here would race React's state update
        // and fail with "no wallet selected" before it lands.
        _bridge.select(walletName);
      } else {
        await _bridge.connect();
      }
    } catch (e) {
      set({ error: describeWalletError(e) });
    }
  },

  disconnect: async () => {
    const { _bridge } = get();
    if (!_bridge) { get()._clearData(); return; }
    try {
      await _bridge.disconnect();
    } catch (e) {
      set({ error: describeWalletError(e) });
    } finally {
      get()._clearData();
    }
  },

  refresh: async () => {
    const { _bridge } = get();
    if (!_bridge?.publicKey) return;
    set({ loading: true, error: null });
    try {
      const [result, price] = await Promise.all([
        fetchPortfolio(_bridge.connection, _bridge.publicKey),
        fetchSolPrice(),
      ]);
      set({
        balances: { sol: result.sol },
        tokens: result.tokens,
        positions: result.positions,
        solUsdPrice: price?.usd ?? null,
        solUsdChange24h: price?.usd24hChange ?? null,
        lastRefresh: new Date().toISOString(),
        loading: false,
      });
    } catch (e) {
      set({ loading: false, error: describeWalletError(e) });
    }
  },

  _bridge: null,
  _setBridge: (bridge) => set({ _bridge: bridge }),
  _setError: (error) => set({ error }),
  _setStatus: (status) => set(status),
  _clearData: () => set({
    balances: { sol: 0 },
    tokens: [],
    positions: [],
    solUsdPrice: null,
    solUsdChange24h: null,
    lastRefresh: null,
    error: null,
  }),
}));
