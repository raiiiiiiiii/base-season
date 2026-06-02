import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia, hardhat } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'Base Seasons',
  projectId: 'YOUR_PROJECT_ID_HERE', // In a real app, this should be a valid WalletConnect project ID
  chains: [base, baseSepolia, hardhat],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [hardhat.id]: http(),
  },
});
