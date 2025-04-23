'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';

// Replace this with your actual Privy App ID
const PRIVY_APP_ID = 'cm9u2ai8l001tkz0ldjb31hgm';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#6366f1',
          logo: 'https://avatars.githubusercontent.com/u/37784886',
        },
        loginMethods: ['wallet', 'email'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        supportedChains: [
          {
            name: 'Base',
            id: 8453,
            rpcUrls: {
              default: {
                http: ['https://lb.drpc.org/ogrpc?network=base&dkey=AsXxUELsPkqvm3U3i-T1JXAHux-uqT0R76jhFhW5UfFk']
              },
            },
            blockExplorers: {
              default: {
                name: 'BaseScan',
                url: 'https://basescan.org',
              },
            },
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        ],
      }}
    >
      {children}
    </PrivyProvider>
  );
} 