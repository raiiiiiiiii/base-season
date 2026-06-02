import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia, hardhat } from 'wagmi/chains';
import { fallback, http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'Base Seasons',
  projectId: 'YOUR_PROJECT_ID_HERE', // In a real app, this should be a valid WalletConnect project ID
  chains: [base, baseSepolia, hardhat],
  transports: {
    [base.id]: fallback([
      http(), // Default wagmi public provider
      http('https://base.llamarpc.com'),
      http('https://1rpc.io/base'),
      http('https://base-mainnet.public.blastapi.io')
    ]),
    [baseSepolia.id]: http(),
    [hardhat.id]: http(),
  },
});
