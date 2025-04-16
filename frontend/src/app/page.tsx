'use client'

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowRight, Users, Shuffle, Wallet, Send } from 'lucide-react';

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);

  const connectWallet = () => {
    // Mock function for wallet connection
    setWalletConnected(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Linqo | Web3 Video Chat</title>
        <meta name="description" content="Connect with strangers and send crypto instantly" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <nav className="border-b border-gray-800 backdrop-blur-md bg-gray-900/80 fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
                Linqo
              </span>
            </div>
            <div className="flex items-center">
              {!walletConnected ? (
                <button 
                  onClick={connectWallet}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 py-2 px-4 rounded-full hover:opacity-90 transition"
                >
                  <Wallet size={18} />
                  <span>Connect Wallet</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="px-4 py-2 bg-gray-800 rounded-full">
                    <span className="text-sm font-medium text-gray-200">0x1a2...3b4c</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 text-transparent bg-clip-text">
              Meet Strangers. Send Crypto.
            </h1>
            <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
              Video chat with random people around the world and transfer cryptocurrency instantly. Web3 social interaction reimagined.
            </p>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/random" className="group">
                <div className="p-8 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-500 transition-all duration-300 flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                    <Shuffle className="text-blue-400 w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">Random Connect</h2>
                  <p className="text-gray-400 text-center mb-6">
                    Be paired with a random stranger and start chatting instantly
                  </p>
                  <span className="inline-flex items-center text-blue-400 group-hover:text-blue-300">
                    Start connecting <ArrowRight className="ml-2 w-4 h-4" />
                  </span>
                </div>
              </Link>
              
              <Link href="/rooms" className="group">
                <div className="p-8 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-purple-500 transition-all duration-300 flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                    <Users className="text-purple-400 w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">Join Rooms</h2>
                  <p className="text-gray-400 text-center mb-6">
                    Enter themed chat rooms and connect with multiple people
                  </p>
                  <span className="inline-flex items-center text-purple-400 group-hover:text-purple-300">
                    Browse rooms <ArrowRight className="ml-2 w-4 h-4" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Features Section */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose <span className="bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">Linqo</span>?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg bg-gray-800 border border-gray-700">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                  <Wallet className="text-blue-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Web3 Native</h3>
                <p className="text-gray-400">Connect with your crypto wallet and maintain complete control of your identity and assets.</p>
              </div>
              
              <div className="p-6 rounded-lg bg-gray-800 border border-gray-700">
                <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                  <Send className="text-purple-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Transfers</h3>
                <p className="text-gray-400">Send crypto to your chat partners instantly with minimal fees using Layer 2 solutions.</p>
              </div>
              
              <div className="p-6 rounded-lg bg-gray-800 border border-gray-700">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="text-indigo-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Community Rooms</h3>
                <p className="text-gray-400">Join interest-based rooms or create your own to find like-minded individuals.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
                Linqo
              </span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white">FAQ</a>
              <a href="#" className="text-gray-400 hover:text-white">Contact</a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Linqo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
