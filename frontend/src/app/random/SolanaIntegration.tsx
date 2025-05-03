// 'use client';

// import { useState } from 'react';
// import { useWallet } from '@solana/wallet-adapter-react';
// import * as web3 from '@solana/web3.js';

// export const SolanaIntegration = ({ 
//   recipient, 
//   onTransactionComplete 
// }) => {
//   const { publicKey, sendTransaction } = useWallet();
//   const [amount, setAmount] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState('');

//   const sendSol = async (e) => {
//     e.preventDefault();
    
//     if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
//       setError('Please enter a valid amount');
//       return;
//     }
    
//     if (!recipient.solanaAddress) {
//       setError('Recipient address not available');
//       return;
//     }
    
//     setIsProcessing(true);
//     setError('');
    
//     try {
//       const recipientPubkey = new web3.PublicKey(recipient.solanaAddress);
//       const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
      
//       const transaction = new web3.Transaction().add(
//         web3.SystemProgram.transfer({
//           fromPubkey: publicKey,
//           toPubkey: recipientPubkey,
//           lamports: web3.LAMPORTS_PER_SOL * parseFloat(amount)
//         })
//       );
      
//       // Get recent blockhash
//       const { blockhash } = await connection.getLatestBlockhash();
//       transaction.recentBlockhash = blockhash;
//       transaction.feePayer = publicKey;
      
//       // Send transaction
//       const signature = await sendTransaction(transaction, connection);
      
//       // Wait for confirmation
//       const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
//       if (confirmation.value.err) {
//         throw new Error('Transaction failed to confirm');
//       }
      
//       // Call the completion handler
//       onTransactionComplete({
//         status: 'success',
//         amount: amount,
//         signature: signature
//       });
      
//     } catch (err) {
//       console.error('Transaction error:', err);
//       setError(err.message || 'Transaction failed');
      
//       onTransactionComplete({
//         status: 'error',
//         error: err.message || 'Transaction failed'
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <div className="bg-gray-800 rounded-lg p-4 w-full">
//       <h3 className="text-lg font-medium mb-4">Send SOL</h3>
      
//       <form onSubmit={sendSol} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-300 mb-1">
//             Recipient
//           </label>
//           <div className="bg-gray-700 p-2 rounded text-sm">
//             {recipient.solanaAddress ? 
//               `${recipient.solanaAddress.substring(0, 8)}...${recipient.solanaAddress.substring(recipient.solanaAddress.length - 8)}` : 
//               'No wallet address available'}
//           </div>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-300 mb-1">
//             Amount (SOL)
//           </label>
//           <input
//             type="number"
//             step="0.001"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             placeholder="0.00"
//             className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
//           />
//         </div>
        
//         {error && (
//           <div className="text-red-400 text-sm py-1">
//             {error}
//           </div>
//         )}
        
//         <button
//           type="submit"
//           disabled={isProcessing || !publicKey || !recipient.solanaAddress}
//           className={`w-full py-2 px-4 rounded font-medium ${
//             isProcessing || !publicKey || !recipient.solanaAddress
//               ? 'bg-gray-600 cursor-not-allowed'
//               : 'bg-blue-600 hover:bg-blue-700'
//           } transition-colors`}
//         >
//           {isProcessing ? 'Processing...' : 'Send SOL'}
//         </button>
//       </form>
//     </div>
//   );
// };

'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Video, VideoOff, Mic, MicOff, Send, X, Wallet, Users } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, SystemProgram } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export interface TransactionInfo {
  status: 'success' | 'error';
  amount?: string | number;
  signature?: string;
  error?: string;
}

interface SolanaIntegrationProps {
  recipient: string;
  onTransactionComplete: (txInfo: TransactionInfo) => void;
}

export const SolanaIntegration: React.FC<SolanaIntegrationProps> = ({ 
  recipient, 
  onTransactionComplete 
}) => {
  const [amount, setAmount] = useState<string>('0.1');
  const [isLoading, setIsLoading] = useState(false);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const handleSendSol = async () => {
    if (!publicKey || !recipient) return;
    
    setIsLoading(true);
    
    try {
      // Convert recipient string to PublicKey
      const recipientPubKey = new PublicKey(recipient);
      
      // Parse amount to convert to lamports
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
        throw new Error("Invalid amount");
      }
      
      const lamports = parsedAmount * LAMPORTS_PER_SOL;
      
      // Create a transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports
        })
      );
      
      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed to confirm');
      }
      
      // Return success
      onTransactionComplete({
        status: 'success',
        amount: parsedAmount,
        signature
      });
      
    } catch (error) {
      console.error('Transaction error:', error);
      // Return error
      onTransactionComplete({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div>
        <label className="block mb-2 text-sm font-medium">
          Amount (SOL)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
          placeholder="0.1"
          min="0.000001"
          step="0.01"
        />
      </div>
      
      <div>
        <label className="block mb-2 text-sm font-medium">
          Recipient
        </label>
        <div className="p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 overflow-hidden overflow-ellipsis">
          {recipient || 'No recipient selected'}
        </div>
      </div>
      
      <button
        onClick={handleSendSol}
        disabled={isLoading || !recipient || !publicKey}
        className={`py-2.5 px-5 rounded-lg font-medium text-center ${
          isLoading || !recipient || !publicKey 
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isLoading ? 'Processing...' : 'Send SOL'}
      </button>
    </div>
  );
};