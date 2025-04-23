"use client";

import { useState } from "react";

interface WalletFormProps {
  onSubmit: (wallets: string[]) => void;
  isLoading: boolean;
}

export default function WalletForm({ onSubmit, isLoading }: WalletFormProps) {
  const [walletsInput, setWalletsInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wallets = walletsInput
      .split("\n")
      .map(wallet => wallet.trim())
      .filter(wallet => wallet.length > 0);
    onSubmit(wallets);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5 max-w-3xl mx-auto">
      <div>
        <label 
          htmlFor="wallets" 
          className="block text-base font-medium text-gray-700 dark:text-gray-200 mb-2"
        >
          Private Keys (One per line)
        </label>
        <textarea
          id="wallets"
          rows={8}
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono transition-all"
          value={walletsInput}
          onChange={(e) => setWalletsInput(e.target.value)}
          placeholder="0x123abc..."
          disabled={isLoading}
        />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Enter one private key per line to check and claim ZORA tokens.
        </p>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || !walletsInput.trim()}
          className="inline-flex justify-center py-2.5 px-5 mx-auto border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            "Check Wallets"
          )}
        </button>
      </div>
    </form>
  );
} 