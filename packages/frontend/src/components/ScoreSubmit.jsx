import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSignTypedData, useChainId, useSwitchChain } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseSignature } from 'viem';
import abi from '../abi.json';
import { useToast } from './ToastContext';
import baseLogo from '../assets/logo.png';

const CONTRACT_ADDRESS = "0x6Df4F452e77aF1879061F4F3728D5607B5082ce7";

export default function ScoreSubmit({ gameId, score, onRestart }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { addToast } = useToast();
  
  // Read current nonce for anti-replay
  const { data: currentNonce } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'nonces',
    args: [address],
    query: {
      enabled: isConnected && !!address,
    }
  });

  const { data: currentSeason } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'currentSeason',
  });
  
  const seasonId = currentSeason ? Number(currentSeason) : 1;

  const { signTypedDataAsync } = useSignTypedData();
  const { data: hash, writeContractAsync, isPending: isTxPending, error: txError } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash,
      confirmations: 1,
      pollingInterval: 1500 // Base has 2s block times, poll faster than default 4s
    });

  const [isSigning, setIsSigning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isConfirmed) {
      setShowConfetti(true);
      addToast('Success!', 'Your score has been permanently recorded on Base.', 'success');
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [isConfirmed, addToast]);

  useEffect(() => {
    if (txError) {
      addToast('Transaction Failed', txError.shortMessage || 'Failed to submit score.', 'error');
    }
  }, [txError, addToast]);

  const isWrongNetwork = chainId !== 8453; // Base Mainnet only

  const handleSubmit = async () => {
    if (isWrongNetwork) {
      addToast('Wrong Network', 'Please switch to Base Mainnet to submit scores.', 'error');
      switchChain?.({ chainId: 8453 }); 
      return;
    }
    
    setIsSigning(true);

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const nonce = currentNonce ? Number(currentNonce) : 0;
      
      const domain = {
        name: 'BaseSeasons',
        version: '1',
        chainId: chainId,
        verifyingContract: CONTRACT_ADDRESS,
      };

      const types = {
        ScorePayload: [
          { name: 'player', type: 'address' },
          { name: 'gameId', type: 'uint256' },
          { name: 'score', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
        ],
      };

      const message = {
        player: address,
        gameId: BigInt(gameId),
        score: BigInt(score),
        timestamp: BigInt(timestamp),
        nonce: BigInt(nonce),
      };

      // 1. Sign Typed Data
      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: 'ScorePayload',
        message,
      });

      // 2. Parse Signature (v, r, s)
      const parsedSig = parseSignature(signature);

      // 3. Submit to Contract
      addToast('Transaction Sent', 'Submitting your score to Base network...', 'info');
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'submitScore',
        args: [
          gameId,
          score,
          timestamp,
          Number(parsedSig.v),
          parsedSig.r,
          parsedSig.s
        ],
        dataSuffix: '0x62635f31316a7262676b310b0080218021802180218021802180218021'
      });
      
    } catch (err) {
      console.error(err);
      addToast('Signature Failed', err.shortMessage || 'Signature rejected or failed', 'error');
    } finally {
      setIsSigning(false);
    }
  };

  const getGameName = () => {
    if (gameId === 1) return 'Gas Dash';
    if (gameId === 2) return 'Block Memory';
    if (gameId === 3) return 'Precision Tap';
    return 'Base Seasons';
  };

  const shareText = encodeURIComponent(`I just scored ${score} in ${getGameName()} on @Base Seasons! 🔵🏆\n\nCan you beat my onchain legacy? Play now:\nhttps://base-season.vercel.app\n\n#BaseNetwork #Web3Gaming`);
  const shareUrl = `https://twitter.com/intent/tweet?text=${shareText}`;

  const shortenAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <>
      {showConfetti && (
        <div className="confetti-overlay" style={{ background: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><text y=\'0.9em\' font-size=\'90\'>🎉</text></svg>") repeat top left', backgroundSize: '50px 50px', animation: 'fall 5s linear infinite' }}>
          <style>{`@keyframes fall { from { background-position: 0 0; } to { background-position: 100% 100%; } }`}</style>
        </div>
      )}
      
      <div className="score-submit glass-panel animate-fade-in" style={{ padding: '30px', textAlign: 'center', maxWidth: '450px', margin: '0 auto', border: '1px solid var(--neon-accent)' }}>
        <h3 className="hero-title" style={{ fontSize: '2rem', margin: '0 0 10px 0', letterSpacing: '-1px' }}>
          {isConfirmed ? 'Legendary!' : 'Game Over'}
        </h3>
        
        {/* Visual Share Card */}
        <div className="share-card" style={{ 
          background: 'linear-gradient(135deg, rgba(20, 22, 40, 0.95), rgba(10, 11, 20, 0.95))', 
          borderRadius: '24px', 
          padding: '32px', 
          marginBottom: '32px', 
          border: '1px solid rgba(255,255,255,0.1)', 
          position: 'relative', 
          overflow: 'hidden', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 0 60px rgba(6, 182, 212, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Hex grid background */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(circle at center, #2563EB 2px, transparent 2px)', backgroundSize: '16px 16px', zIndex: 0 }}></div>
          
          {/* Holographic Orbs */}
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--primary)', filter: 'blur(50px)', opacity: 0.5, zIndex: 0 }}></div>
          <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '150px', height: '150px', background: 'var(--cyan)', filter: 'blur(50px)', opacity: 0.5, zIndex: 0 }}></div>
          
          {/* Scanner Line Overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.02) 50%)', backgroundSize: '100% 4px', pointerEvents: 'none', zIndex: 2 }}></div>

          <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', width: '100%' }}>
               <span className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', margin: 0 }}>
                 <div style={{width: '6px', height: '6px', borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)'}}></div>
                 SEASON {seasonId}
               </span>
               <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'var(--text-3)', letterSpacing: '0.1em' }}>BASE MAINNET</span>
            </div>
            
            <div style={{ fontSize: '0.9rem', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: '800', marginBottom: '8px' }}>{getGameName()}</div>
            
            <div className="text-gradient" style={{ fontSize: '5rem', fontWeight: '900', fontFamily: 'Space Grotesk', lineHeight: '1', margin: '0 0 24px 0', textShadow: '0 0 60px rgba(6, 182, 212, 0.4)' }}>
              {score}
            </div>
            
            <div style={{ width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', marginBottom: '24px' }}></div>

            {isConnected && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Player ID</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-1)', fontSize: '0.95rem', fontWeight: '600' }}>
                    {shortenAddress(address)}
                  </div>
                </div>
                
                {/* Official Base Logo Badge */}
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0, 82, 255, 0.4), inset 0 2px 4px rgba(0,0,0,0.1)', border: '1px solid rgba(0, 82, 255, 0.2)' }}>
                  <img src={baseLogo} alt="Base" style={{ width: '22px', height: '22px', borderRadius: '6px' }} />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {!isConnected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Connect wallet to submit your score securely onchain</p>
            <ConnectButton />
            <button className="btn-secondary" onClick={onRestart} style={{ width: '100%' }}>Play Again</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isConfirmed ? (
              <>
                <div style={{ padding: '10px', background: 'rgba(0, 194, 255, 0.1)', borderRadius: '8px', border: '1px solid rgba(0, 194, 255, 0.2)' }}>
                  <a href={`https://basescan.org/tx/${hash}`} target="_blank" rel="noreferrer" style={{ color: 'var(--neon-accent)', textDecoration: 'none', fontWeight: 'bold' }}>
                    ↗ View on Basescan
                  </a>
                </div>
                <a href={shareUrl} target="_blank" rel="noreferrer" className="btn-primary glow-hover" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  Share on X (Twitter)
                </a>
                <button className="btn-secondary" onClick={onRestart}>Play Again</button>
              </>
            ) : (
              <>
                {isWrongNetwork ? (
                  <button className="btn-primary glow-hover" onClick={() => switchChain?.({ chainId: 8453 })}>
                    Switch to Base Mainnet
                  </button>
                ) : (
                  <button 
                    className="btn-primary glow-hover" 
                    onClick={handleSubmit} 
                    disabled={isSigning || isTxPending || isConfirming}
                  >
                    {isSigning ? 'Sign in Wallet...' : isTxPending ? 'Confirming Tx...' : isConfirming ? 'Minting Score on Base...' : 'Sign & Submit Score'}
                  </button>
                )}
                <button className="btn-secondary" onClick={onRestart} disabled={isSigning || isTxPending || isConfirming}>
                  Play Again
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
