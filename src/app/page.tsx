"use client";

import { useState } from "react";
import WalletForm from "./components/WalletForm";
import WalletList from "./components/WalletList";
import WalletConnect from "./components/WalletConnect";
import { WalletStatus, checkWallet, checkWalletByAddress, claimTokens, getContract } from "./utils/claim";
import { ethers } from "ethers";

export default function Home() {
  const [wallets, setWallets] = useState<WalletStatus[]>([]);
  const [privateKeys, setPrivateKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'privateKey' | 'wallet'>('wallet');
  const [connectedWalletStatus, setConnectedWalletStatus] = useState<WalletStatus | null>(null);

  const handleSubmit = async (walletKeys: string[]) => {
    if (walletKeys.length === 0) return;
    
    setLoading(true);
    setPrivateKeys(walletKeys);
    
    // Create placeholder entries while checking
    const initialStatuses = walletKeys.map(pk => ({
      address: pk.substring(0, 10) + '...',
      status: 'checking' as const
    }));
    setWallets(initialStatuses);
    
    // Check wallets one by one
    const results: WalletStatus[] = [];
    
    for (let i = 0; i < walletKeys.length; i++) {
      const result = await checkWallet(walletKeys[i]);
      
      // Update the status of the current wallet
      results.push(result);
      setWallets([...results, ...initialStatuses.slice(results.length)]);
    }
    
    setLoading(false);
  };

  const handleClaim = async (address: string, index: number) => {
    if (index >= privateKeys.length) return;
    
    // Update status to checking
    const updatedWallets = [...wallets];
    updatedWallets[index] = { ...updatedWallets[index], status: 'checking' };
    setWallets(updatedWallets);
    
    try {
      // Perform claim
      const result = await claimTokens(privateKeys[index]);
      
      // Update wallet status
      updatedWallets[index] = result;
      setWallets([...updatedWallets]);
    } catch (error) {
      // Handle error
      updatedWallets[index] = { 
        address: address, 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      setWallets([...updatedWallets]);
    }
  };

  // For connected wallet
  const handleConnectedWalletCheck = async (address: string) => {
    const status = await checkWalletByAddress(address);
    setConnectedWalletStatus(status);
  };

  const handleConnectedWalletClaim = async (address: string) => {
    try {
      // This function will be called from the WalletConnect component
      // The actual signing will happen there using Privy's wallet
      setLoading(true);
      
      // Update the UI to show that the wallet is now claimed
      setConnectedWalletStatus({
        address,
        status: 'claimed',
      });
      
    } catch (error) {
      setConnectedWalletStatus({
        address,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-indigo-800 dark:text-indigo-400 sm:text-5xl tracking-tight">
            Zora Claim Tool
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-base text-gray-600 dark:text-gray-300 sm:text-lg">
            Check your wallets and claim tokens from the Zora contract on Base network.
          </p>
        </div>
        
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-100 dark:border-gray-700 max-w-4xl mx-auto mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'privateKey'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('privateKey')}
            >
              Private Keys
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'wallet'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('wallet')}
            >
              Connect Wallet
            </button>
          </div>
        </div>
        
        {activeTab === 'privateKey' ? (
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 max-w-4xl mx-auto border border-gray-100 dark:border-gray-700">
            <WalletForm onSubmit={handleSubmit} isLoading={loading} />
            
            <WalletList 
              wallets={wallets} 
              onClaim={handleClaim} 
              loading={loading} 
            />
          </div>
        ) : (
          <WalletConnect
            onAccountCheck={handleConnectedWalletCheck}
            onClaim={handleConnectedWalletClaim}
            walletStatus={connectedWalletStatus}
            isLoading={loading}
          />
        )}
        
        <div className="mt-10 text-center text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          <p className="font-medium">This tool checks and claims ZORA tokens from the Base network contract.</p>
          <p className="mt-2">Your private keys are processed locally and never sent to any server.</p>
        </div>
      </div>
    </main>
  );
}
