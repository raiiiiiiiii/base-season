import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSignTypedData, useChainId, useSwitchChain } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseSignature } from 'viem';
import abi from '../abi.json';
import { useToast } from './ToastContext';

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
    useWaitForTransactionReceipt({ hash });

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
        
        {/* ID Card Style Share Card */}
        <div className="share-card" style={{ 
          background: '#0d0d11', 
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '32px', 
          position: 'relative', 
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          border: '1px solid #1a1a24',
          borderTop: '2px solid transparent',
          backgroundImage: 'linear-gradient(#0d0d11, #0d0d11), linear-gradient(90deg, #F59E0B, #FDE68A, #F59E0B)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          textAlign: 'left',
          fontFamily: "'JetBrains Mono', monospace",
          color: '#8b8b99'
        }}>
          {/* Subtle Watermark */}
          <div style={{ position: 'absolute', top: '50%', right: '10%', transform: 'translateY(-50%)', fontSize: '180px', fontWeight: '900', color: 'rgba(255,255,255,0.015)', fontFamily: 'Space Grotesk', pointerEvents: 'none' }}>
            B
          </div>
          
          {/* Top Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#e0e0e0', color: '#0d0d11', padding: '4px 8px', fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'Space Grotesk' }}>B<span style={{ fontSize: '0.6rem', verticalAlign: 'super' }}>(s)</span></div>
              <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', opacity: 0.6 }}>AUTH ID EX-S{seasonId}</div>
            </div>
            <div style={{ border: '1px solid rgba(245, 158, 11, 0.3)', color: '#FDE68A', padding: '4px 12px', fontSize: '0.7rem', letterSpacing: '0.15em', borderRadius: '99px', background: 'rgba(245, 158, 11, 0.05)' }}>
              ONCHAIN RECORD
            </div>
          </div>

          {/* Middle Content */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
            {/* Avatar / Icon Ring */}
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#13131a', flexShrink: 0, boxShadow: '0 0 15px rgba(245, 158, 11, 0.15)' }}>
              <span style={{ fontSize: '2rem' }}>{gameId === 1 ? '⚡' : gameId === 2 ? '🧠' : '🎯'}</span>
            </div>
            
            {/* Details */}
            <div>
              <div style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 'bold', fontFamily: 'Space Grotesk', letterSpacing: '-0.02em', marginBottom: '4px', lineHeight: 1 }}>{getGameName()}</div>
              <div style={{ color: '#F59E0B', fontSize: '0.8rem', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: '600' }}>SEASON {seasonId} OPERATOR</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: '12px', rowGap: '8px', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                <div style={{ opacity: 0.5 }}>SCORE</div>
                <div style={{ color: '#e0e0e0', fontWeight: 'bold' }}>{score} PTS</div>
                
                <div style={{ opacity: 0.5 }}>PLAYER</div>
                <div style={{ color: '#e0e0e0' }}>{isConnected ? shortenAddress(address) : 'UNAUTHENTICATED'}</div>
              </div>
            </div>
          </div>

          {/* Bottom Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '16px', position: 'relative', zIndex: 1 }}></div>

          {/* Bottom Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', opacity: 0.5 }}>
              UID // {isConnected ? address.substring(0, 14).toUpperCase() : 'UNKNOWN'}
            </div>
            {/* Decorative Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 10px)', gap: '4px', opacity: 0.2 }}>
              <div style={{ width: '10px', height: '10px', border: '1px solid #fff' }}></div>
              <div style={{ width: '10px', height: '10px', border: '1px solid #fff' }}></div>
              <div style={{ width: '10px', height: '10px', border: '1px solid #fff' }}></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 4px)', gap: '2px' }}>
                 <div style={{ width: '4px', height: '4px', background: '#fff' }}></div>
                 <div style={{ width: '4px', height: '4px', background: '#fff' }}></div>
                 <div style={{ width: '4px', height: '4px', background: '#fff' }}></div>
              </div>
            </div>
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
