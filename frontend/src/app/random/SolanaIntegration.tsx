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
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import * as web3 from '@solana/web3.js';

interface SolanaIntegrationProps {
  recipient: string; // Assuming recipient is a string (public key)
  onTransactionComplete?: (signature: string) => void; // Optional callback function
}

// Enhanced SolanaIntegration component with improved error handling and user feedback
export const SolanaIntegration = ({ recipient, onTransactionComplete }: SolanaIntegrationProps) => {
  const { publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);

  // Track wallet connection status
  useEffect(() => {
    setWalletConnected(!!publicKey);
  }, [publicKey]);

  const sendSol = async (e) => {
    e.preventDefault();
    
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!recipient.solanaAddress) {
      setError('Recipient address not available');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    try {
      const recipientPubkey = new web3.PublicKey(recipient.solanaAddress);
      const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
      
      const transaction = new web3.Transaction().add(
        web3.SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports: web3.LAMPORTS_PER_SOL * parseFloat(amount)
        })
      );
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed to confirm');
      }
      
      // Call the completion handler
      onTransactionComplete({
        status: 'success',
        amount: amount,
        signature: signature
      });
      
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err.message || 'Transaction failed');
      
      onTransactionComplete({
        status: 'error',
        error: err.message || 'Transaction failed'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 w-full">
      <h3 className="text-lg font-medium mb-4">Send SOL</h3>
      
      {!walletConnected ? (
        <div className="text-center py-4">
          <p className="text-gray-300 mb-3">Connect your wallet to send SOL</p>
          <div className="flex justify-center">
            <WalletMultiButton />
          </div>
        </div>
      ) : (
        <form onSubmit={sendSol} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Recipient
            </label>
            <div className="bg-gray-700 p-2 rounded text-sm">
              {recipient.solanaAddress ? 
                `${recipient.solanaAddress.substring(0, 8)}...${recipient.solanaAddress.substring(recipient.solanaAddress.length - 8)}` : 
                'No wallet address available'}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Amount (SOL)
            </label>
            <input
              type="number"
              step="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          
          {error && (
            <div className="text-red-400 text-sm py-1">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isProcessing || !publicKey || !recipient.solanaAddress}
            className={`w-full py-2 px-4 rounded font-medium ${
              isProcessing || !publicKey || !recipient.solanaAddress
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            {isProcessing ? 'Processing...' : 'Send SOL'}
          </button>
        </form>
      )}
    </div>
  );
};