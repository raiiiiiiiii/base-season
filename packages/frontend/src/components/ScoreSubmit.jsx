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
        
        {/* Visual Share Card */}
        <div className="share-card" style={{ 
          background: '#0f0f13', 
          borderRadius: '16px', 
          padding: '24px', 
          marginBottom: '32px', 
          position: 'relative', 
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          fontFamily: "'JetBrains Mono', monospace",
          color: '#e5e7eb',
          textAlign: 'left'
        }}>
          {/* Top Gold Edge */}
          <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '2px', background: 'linear-gradient(90deg, transparent, #eab308, transparent)' }}></div>
          
          {/* Subtle Watermark */}
          <div style={{ position: 'absolute', right: '-5%', top: '5%', fontSize: '200px', color: 'rgba(255,255,255,0.02)', fontFamily: 'serif', pointerEvents: 'none', lineHeight: 1 }}>
            B
          </div>
          
          {/* Top Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#d1d5db', color: '#111', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontFamily: 'serif', fontSize: '14px' }}>
                B<sup style={{fontSize:'8px'}}>s</sup>
              </div>
              <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: '#6b7280' }}>
                AUTH ID EX-{isConnected && address ? address.substring(2, 6).toUpperCase() : 'H517'}
              </div>
            </div>
            <div style={{ border: '1px solid rgba(234, 179, 8, 0.3)', color: '#eab308', padding: '4px 12px', fontSize: '10px', letterSpacing: '0.1em', borderRadius: '99px' }}>
              ONCHAIN RECORD
            </div>
          </div>

          {/* Middle Content */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '36px', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
            {/* Avatar */}
            <div style={{ width: '76px', height: '76px', borderRadius: '50%', border: '2px solid #eab308', overflow: 'hidden', flexShrink: 0, background: '#1f2937' }}>
              <img src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${isConnected && address ? address : 'base'}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            
            {/* Details */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '32px', color: '#fff', fontWeight: '600', fontFamily: 'sans-serif', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '8px' }}>
                {score} PTS
              </div>
              <div style={{ color: '#eab308', fontSize: '11px', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: '500' }}>
                SEASON {seasonId} OPERATOR
              </div>
              
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '12px' }}></div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: '16px', rowGap: '6px', fontSize: '10px', letterSpacing: '0.1em' }}>
                <div style={{ color: '#6b7280' }}>SYS·ID</div>
                <div style={{ color: '#d1d5db' }}>{getGameName().toUpperCase().replace(' ', '-')}-S{seasonId}</div>
                
                <div style={{ color: '#6b7280' }}>ISSUED</div>
                <div style={{ color: '#d1d5db' }}>{new Date().toISOString().split('T')[0].replace(/-/g, '.')}</div>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.15em', color: '#6b7280' }}>
              UID // {isConnected && address ? address.substring(0, 16).toUpperCase() : 'UNKNOWN'}
            </div>
            {/* Decorative Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 10px)', gap: '4px', opacity: 0.3 }}>
              <div style={{ width: '10px', height: '10px', border: '1px solid #9ca3af', borderRadius: '2px' }}></div>
              <div style={{ width: '10px', height: '10px', border: '1px solid #9ca3af', borderRadius: '2px' }}></div>
              <div style={{ width: '10px', height: '10px', border: '1px solid #9ca3af', borderRadius: '2px' }}></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 4px)', gap: '2px' }}>
                 <div style={{ width: '4px', height: '4px', background: '#9ca3af', borderRadius: '1px' }}></div>
                 <div style={{ width: '4px', height: '4px', background: '#9ca3af', borderRadius: '1px' }}></div>
                 <div style={{ width: '4px', height: '4px', background: '#9ca3af', borderRadius: '1px' }}></div>
                 <div style={{ width: '4px', height: '4px', background: '#9ca3af', borderRadius: '1px' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {!isConnected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Connect wallet to securely record your score. Scores secured on Base.</p>
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
                    {isSigning ? 'Sign in Wallet...' : isTxPending ? 'Confirming Tx...' : isConfirming ? 'Securing Score on Base...' : 'Sign & Submit Score'}
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
