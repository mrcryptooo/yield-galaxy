'use client';

import { useEffect, useMemo, type ReactNode } from 'react';
import { clusterApiUrl } from '@solana/web3.js';
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { useWalletStore } from '@/stores/wallet-store';
import { describeWalletError } from '@/lib/wallet/portfolio';

// Bridges the (hook-based) Solana Wallet Adapter context into the plain
// Zustand wallet-store, so the rest of the app (Top Bar, Captain, Mission
// Control, Galaxy) can read/trigger wallet state without needing to be
// inside this provider's component tree.
function WalletStoreBridge() {
  const { connection } = useConnection();
  const { wallet, wallets, select, connect, disconnect, connecting, disconnecting, connected, publicKey } = useWallet();
  const setBridge = useWalletStore((s) => s._setBridge);
  const setStatus = useWalletStore((s) => s._setStatus);
  const refresh = useWalletStore((s) => s.refresh);
  const clearData = useWalletStore((s) => s._clearData);

  useEffect(() => {
    setBridge({
      connection,
      publicKey,
      select: (name) => {
        const target = wallets.find((w) => w.adapter.name === name);
        if (target) select(target.adapter.name);
      },
      connect,
      disconnect,
    });
    return () => setBridge(null);
  }, [connection, publicKey, wallets, select, connect, disconnect, setBridge]);

  useEffect(() => {
    setStatus({
      connected,
      connecting,
      disconnecting,
      walletName: wallet?.adapter.name ?? null,
      publicKey: publicKey?.toBase58() ?? null,
    });
  }, [connected, connecting, disconnecting, wallet, publicKey, setStatus]);

  useEffect(() => {
    if (connected && publicKey) {
      refresh();
    } else {
      clearData();
    }
  }, [connected, publicKey, refresh, clearData]);

  return null;
}

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta'),
    []
  );
  // Phantom, Solflare registered explicitly. Backpack (and Phantom/Solflare
  // too) additionally auto-register via the Wallet Standard, which modern
  // wallet-adapter relies on — there's no maintained legacy adapter package
  // for Backpack, so Wallet Standard detection is how it's meant to work.
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect
        // Every wallet failure (rejected, not installed, wrong network,
        // disconnected mid-session) funnels through here into the wallet
        // store's own `error` field instead of the adapter's default
        // console.error — this is what "fail gracefully" resolves to for
        // both explicit connect() calls and autoConnect's own attempts.
        onError={(error) => useWalletStore.getState()._setError(describeWalletError(error))}
      >
        <WalletStoreBridge />
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
