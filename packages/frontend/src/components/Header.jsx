import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { useEffect, useState } from 'react';
import './Header.css';
import baseLogo from '../assets/base-logo.svg';

export default function Header() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const { data: balanceData, isLoading: isBalanceLoading, isError: isBalanceError } = useBalance({
    address: address,
    query: { enabled: isConnected && !!address }
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  // Network detection logic
  const isBaseMainnet = chainId === 8453;
  const isBaseSepolia = chainId === 84532;
  const isHardhat = chainId === 31337;
  const isSupportedNetwork = isBaseMainnet || isBaseSepolia || isHardhat;

  return (
    <>
      {isConnected && !isSupportedNetwork && (
        <div style={{ background: '#ef4444', color: 'white', padding: '8px 20px', textAlign: 'center', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', zIndex: 1000, position: 'relative' }}>
          <span>⚠️ You are connected to an unsupported network. Base Seasons requires Base Network.</span>
          <button 
            onClick={() => switchChain?.({ chainId: 8453 })}
            style={{ background: 'white', color: '#ef4444', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
          >
            Switch to Base
          </button>
        </div>
      )}
      
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <img src={baseLogo} alt="Base" style={{ width: '22px', height: '22px' }} />
            </div>
            <span className="text-gradient">Base Seasons</span>
            {isConnected && isBaseSepolia && <span className="badge badge-cyan" style={{ marginLeft: '10px', fontSize: '10px' }}>TESTNET</span>}
            {isConnected && isHardhat && <span className="badge badge-silver" style={{ marginLeft: '10px', fontSize: '10px' }}>LOCAL</span>}
          </Link>

          <nav className="nav-links">
            <Link to="/games" className={isActive('/games')}>Games</Link>
            <Link to="/leaderboard" className={isActive('/leaderboard')}>Leaderboard</Link>
            <Link to="/profile" className={isActive('/profile')}>Profile</Link>
          </nav>

          <div className="header-connect">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus ||
                    authenticationStatus === 'authenticated');

                if (!ready) {
                  return <div style={{ width: '120px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', animation: 'pulse 2s infinite' }} />;
                }

                if (!connected) {
                  return (
                    <button onClick={openConnectModal} type="button" className="btn-primary" style={{ padding: '8px 20px' }}>
                      Connect Wallet
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button onClick={openChainModal} type="button" style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Wrong Network
                    </button>
                  );
                }

                // Balance formatting logic to avoid NaN
                let displayBalance = "0 ETH";
                if (isBalanceLoading) {
                  displayBalance = "Loading...";
                } else if (isBalanceError || !balanceData) {
                  displayBalance = "Unavailable";
                } else {
                  const val = Number(balanceData.formatted);
                  if (isNaN(val)) displayBalance = "0 ETH";
                  else displayBalance = `${val.toFixed(4)} ETH`;
                }

                return (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={openChainModal}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-1)', padding: '8px 12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
                      type="button"
                    >
                      {chain.hasIcon && (
                        <div style={{ background: chain.iconBackground, width: 20, height: 20, borderRadius: 999, overflow: 'hidden' }}>
                          {chain.iconUrl && <img alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} style={{ width: 20, height: 20 }} />}
                        </div>
                      )}
                    </button>

                    <button 
                      onClick={openAccountModal} 
                      type="button" 
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-1)', padding: '6px 16px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <span style={{ color: 'var(--text-3)', fontSize: '0.9em' }}>
                        {displayBalance}
                      </span>
                      <div style={{ height: '14px', width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
                      {account.displayName}
                    </button>
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </header>
    </>
  );
}
