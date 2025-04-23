"use client";

import { WalletStatus } from "../utils/claim";

interface WalletListProps {
  wallets: WalletStatus[];
  onClaim: (privateKey: string, index: number) => void;
  loading: boolean;
}

export default function WalletList({ wallets, onClaim, loading }: WalletListProps) {
  if (wallets.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 max-w-1/4 mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Wallet Results</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Address</th>
              <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Allocation</th>
              <th scope="col" className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {wallets.map((wallet, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-4 py-4 text-sm font-mono text-gray-900 dark:text-gray-100 truncate max-w-[180px]">
                  {wallet.address}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                  <StatusBadge status={wallet.status} />
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {wallet.allocation 
                    ? <span className="font-medium">{parseFloat(wallet.allocation).toFixed(4)} ZORA</span>
                    : '-'}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {wallet.status === 'eligible' && (
                    <button
                      onClick={() => onClaim(wallet.address, index)}
                      disabled={loading}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Claim
                    </button>
                  )}
                  {wallet.txHash && (
                    <a 
                      href={`https://basescan.org/tx/${wallet.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ml-2 underline"
                    >
                      View Tx
                    </a>
                  )}
                  {wallet.error && (
                    <span className="text-xs text-red-600 dark:text-red-400" title={wallet.error}>
                      Error: {wallet.error.substring(0, 30)}...
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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