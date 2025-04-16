'use client'

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Search, Users, Star, MessageCircle, Zap, TrendingUp, Plus } from 'lucide-react';

export default function Rooms() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock room data
  const rooms = [
    {
      id: 1,
      name: "Crypto Traders",
      category: "Finance",
      members: 143,
      description: "Discuss trading strategies and market trends",
      active: true,
      featured: true
    },
    {
      id: 2,
      name: "NFT Artists",
      category: "Art",
      members: 89,
      description: "Connect with artists and collectors in the NFT space",
      active: true,
      featured: false
    },
    {
      id: 3,
      name: "DeFi Explorers",
      category: "Finance",
      members: 67,
      description: "Learn about yield farming, staking and DeFi opportunities",
      active: true,
      featured: false
    },
    {
      id: 4,
      name: "Web3 Developers",
      category: "Technology",
      members: 212,
      description: "Technical discussions about blockchain development",
      active: true,
      featured: true
    },
    {
      id: 5,
      name: "Metaverse Meetup",
      category: "Social",
      members: 115,
      description: "Virtual hangout for metaverse enthusiasts",
      active: true,
      featured: false
    },
    {
      id: 6,
      name: "DAO Governance",
      category: "Business",
      members: 54,
      description: "Discuss decentralized governance models and voting",
      active: true,
      featured: false
    }
  ];

  // Filter rooms based on search term
  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Featured rooms
  const featuredRooms = rooms.filter(room => room.featured);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Rooms | Linqo</title>
        <meta name="description" content="Join chat rooms on Linqo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="border-b border-gray-800 backdrop-blur-md bg-gray-900/80 fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-white transition">
              <ArrowLeft size={18} />
              <span>Back to Home</span>
            </Link>
            <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
              Linqo Rooms
            </div>
            <div className="px-4 py-2 bg-gray-800 rounded-full">
              <span className="text-sm font-medium text-gray-200">0x1a2...3b4c</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-7xl mx-auto">
        {/* Search and Create Room */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search rooms by name, category or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 hover:opacity-90 transition whitespace-nowrap">
            <Plus size={18} />
            <span>Create Room</span>
          </button>
        </div>

        {/* Featured Rooms */}
        {featuredRooms.length > 0 && searchTerm === '' && (
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Star className="text-yellow-400 mr-2" size={20} />
              <h2 className="text-xl font-bold">Featured Rooms</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredRooms.map(room => (
                <Link href={`/room/${room.id}`} key={room.id}>
                  <div className="border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 hover:border-blue-500 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">{room.name}</h3>
                        <p className="text-sm text-gray-400 mt-1">{room.category}</p>
                      </div>
                      <span className="flex items-center text-sm text-gray-400">
                        <Users size={16} className="mr-1" />
                        {room.members}
                      </span>
                    </div>
                    <p className="mt-4 text-gray-300">{room.description}</p>
                    <div className="mt-4 flex items-center text-blue-400">
                      <MessageCircle size={16} className="mr-2" />
                      <span>Join Conversation</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All/Filtered Rooms */}
        <div>
          <div className="flex items-center mb-6">
            {searchTerm ? (
              <>
                <Search className="text-gray-400 mr-2" size={20} />
                <h2 className="text-xl font-bold">
                  Search Results {filteredRooms.length > 0 ? `(${filteredRooms.length})` : ''}
                </h2>
              </>
            ) : (
              <>
                <Zap className="text-blue-400 mr-2" size={20} />
                <h2 className="text-xl font-bold">All Rooms</h2>
              </>
            )}
          </div>

          {filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No rooms found matching your search criteria.</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-4 text-blue-400 hover:text-blue-300"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map(room => (
                <Link href={`/room/${room.id}`} key={room.id}>
                  <div className="border border-gray-700 bg-gray-800 rounded-xl p-4 hover:border-blue-500/50 hover:bg-gray-800/80 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{room.name}</h3>
                        <p className="text-xs text-gray-400">{room.category}</p>
                      </div>
                      <span className="flex items-center text-xs text-gray-400">
                        <Users size={14} className="mr-1" />
                        {room.members}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-gray-300 line-clamp-2">{room.description}</p>
                    <div className="mt-3 flex items-center text-sm text-blue-400">
                      <MessageCircle size={14} className="mr-1" />
                      <span>Join</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Trending Topics */}
        {searchTerm === '' && (
          <div className="mt-16 mb-8">
            <div className="flex items-center mb-6">
              <TrendingUp className="text-green-400 mr-2" size={20} />
              <h2 className="text-xl font-bold">Trending Topics</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {['#NFTs', '#DeFi', '#Bitcoin', '#Ethereum', '#DAOs', '#Solana', '#GameFi', '#Web3Jobs', '#Metaverse'].map(tag => (
                <span 
                  key={tag} 
                  className="px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700 cursor-pointer text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Linqo. All rights reserved.
        </div>
      </footer>
    </div>
  );
}