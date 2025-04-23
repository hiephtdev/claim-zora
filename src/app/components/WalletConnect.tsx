"use client";

import { useState, useEffect } from "react";
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { WalletStatus } from "../utils/claim";
import { ethers } from "ethers";

// ABI for the Zora claim contract
const ABI = [
  "function allocations(address) view returns (uint256)",
  "function claim(address _claimTo) external",
  "function hasClaimed(address) view returns (bool)",
];

// Contract address
const CLAIM_CONTRACT = "0x0000000002ba96c69b95e32caab8fc38bab8b3f8";

interface WalletConnectProps {
  onAccountCheck: (address: string) => Promise<void>;
  onClaim: (address: string) => Promise<void>;
  walletStatus: WalletStatus | null;
  isLoading: boolean;
}

export default function WalletConnect({ onAccountCheck, onClaim, walletStatus, isLoading }: WalletConnectProps) {
  const { login, ready, authenticated, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const [activeWallet, setActiveWallet] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [claimingStatus, setClaimingStatus] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Set active wallet when wallets change
  useEffect(() => {
    const getWallet = async () => {
      if (wallets && wallets.length > 0) {
        // Use the first wallet
        const wallet = wallets[0];
        const isConnected = await wallet.isConnected();
        
        if (isConnected) {
          setActiveWallet(wallet);
        }
      }
    };
    
    if (wallets && wallets.length > 0) {
      getWallet();
    }
  }, [wallets]);

  // Check the wallet status when authenticated and have active wallet
  useEffect(() => {
    if (authenticated && activeWallet && !checkingStatus && !walletStatus && activeWallet.address) {
      handleCheckWallet();
    }
  }, [authenticated, activeWallet]);

  const handleCheckWallet = async () => {
    if (!activeWallet || !activeWallet.address) return;
    
    setCheckingStatus(true);
    try {
      await onAccountCheck(activeWallet.address);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleClaim = async () => {
    if (!activeWallet || !activeWallet.address) return;
    
    setClaimingStatus(true);
    try {
      // Use Privy wallet to create the transaction
      const provider = await activeWallet.getEthersProvider();
      const signer = provider.getSigner();
      
      // Create contract instance
      const contract = new ethers.Contract(CLAIM_CONTRACT, ABI, signer);
      
      // Call the claim function
      const tx = await contract.claim(activeWallet.address);
      setTxHash(tx.hash);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      // Update application state
      await onClaim(activeWallet.address);
    } catch (error) {
      console.error("Claim error:", error);
      // Error will be handled in the parent component
    } finally {
      setClaimingStatus(false);
    }
  };

  if (!ready) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-100 dark:border-gray-700 mt-8">
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-gray-700 dark:text-gray-300">Loading Privy...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-100 dark:border-gray-700 mt-8">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Connect Wallet
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Connect your wallet to check and claim ZORA tokens
        </p>
      </div>

      <div className="flex justify-center">
        {!authenticated ? (
          <button
            onClick={() => login()}
            disabled={isLoading}
            className="inline-flex items-center justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="flex flex-col items-center space-y-4 w-full">
            <div className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="font-mono text-sm truncate max-w-[250px]">
                {activeWallet ? activeWallet.address : user?.wallet?.address}
              </div>
              <button
                onClick={() => logout()}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Disconnect
              </button>
            </div>

            {walletStatus && (
              <div className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</p>
                    <div className="mt-1">
                      <StatusBadge status={walletStatus.status} />
                    </div>
                  </div>
                  
                  {walletStatus.allocation && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Allocation:</p>
                      <p className="text-sm font-mono">{parseFloat(walletStatus.allocation).toFixed(4)} ZORA</p>
                    </div>
                  )}
                </div>

                {walletStatus.status === 'eligible' && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={handleClaim}
                      disabled={claimingStatus || isLoading}
                      className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {claimingStatus ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Claiming...
                        </>
                      ) : (
                        "Claim Tokens"
                      )}
                    </button>
                  </div>
                )}

                {(walletStatus.txHash || txHash) && (
                  <div className="mt-4 text-center">
                    <a 
                      href={`https://basescan.org/tx/${walletStatus.txHash || txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                    >
                      View Transaction
                    </a>
                  </div>
                )}
              </div>
            )}

            {!walletStatus && checkingStatus && (
              <div className="flex items-center justify-center py-4">
                <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Checking wallet status...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: WalletStatus['status'] }) {
  const styles = {
    checking: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600",
    claimed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    eligible: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800",
    'no-allocation': "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800"
  };
  
  const labels = {
    checking: "Checking",
    claimed: "Claimed",
    eligible: "Eligible",
    'no-allocation': "No Allocation",
    error: "Error"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
} 