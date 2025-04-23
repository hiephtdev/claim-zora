import { ethers } from "ethers";

// ====== Config ======
const RPC_URL = "https://lb.drpc.org/ogrpc?network=base&dkey=AsXxUELsPkqvm3U3i-T1JXAHux-uqT0R76jhFhW5UfFk";
const CLAIM_CONTRACT = "0x0000000002ba96c69b95e32caab8fc38bab8b3f8"; // Contract có hàm claim

const ABI = [
  "function allocations(address) view returns (uint256)",
  "function claim(address _claimTo) external",
  "function hasClaimed(address) view returns (bool)",
];

export type WalletStatus = {
  address: string;
  status: 'checking' | 'claimed' | 'eligible' | 'no-allocation' | 'error';
  allocation?: string;
  txHash?: string;
  error?: string;
};

export async function checkWallet(privateKey: string): Promise<WalletStatus> {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(CLAIM_CONTRACT, ABI, wallet);
    
    const hasClaimed = await contract.hasClaimed(wallet.address);
    if (hasClaimed) {
      return { 
        address: wallet.address, 
        status: 'claimed' 
      };
    }
    
    const allocation = await contract.allocations(wallet.address);
    if (allocation.toString() !== '0') {
      return { 
        address: wallet.address, 
        status: 'eligible',
        allocation: ethers.formatUnits(allocation, 18) 
      };
    } else {
      return { 
        address: wallet.address, 
        status: 'no-allocation' 
      };
    }
  } catch (err: any) {
    return { 
      address: privateKey.substring(0, 10) + '...', 
      status: 'error',
      error: err.message 
    };
  }
}

export async function claimTokens(privateKey: string): Promise<WalletStatus> {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(CLAIM_CONTRACT, ABI, wallet);
    
    const hasClaimed = await contract.hasClaimed(wallet.address);
    if (hasClaimed) {
      return { 
        address: wallet.address, 
        status: 'claimed' 
      };
    }
    
    const allocation = await contract.allocations(wallet.address);
    if (allocation.toString() === '0') {
      return { 
        address: wallet.address, 
        status: 'no-allocation' 
      };
    }
    
    const tx = await contract.claim(wallet.address);
    await tx.wait();
    
    return { 
      address: wallet.address, 
      status: 'claimed',
      txHash: tx.hash 
    };
  } catch (err: any) {
    return { 
      address: privateKey.substring(0, 10) + '...', 
      status: 'error',
      error: err.message 
    };
  }
}