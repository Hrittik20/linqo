'use client'

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Video, Users, Send, Wallet, Info, Settings, UserPlus, X, Clock } from 'lucide-react';

export default function ChatRoom() {
  const router = useRouter();
  const { id } = router.query;
  
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [isTypingCrypto, setIsTypingCrypto] = useState(false);
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Mock room data
  const roomData = {
    id: id,
    name: "Crypto Traders",
    category: "Finance",
    description: "A community of crypto enthusiasts discussing the latest market trends, technical analysis, and trading strategies. Share your insights and learn from others.",
    rules: "Be respectful to others. No spamming or excessive self-promotion. Don't share financial advice without disclaimers.",
    createdAt: "2025-01-15T12:00:00Z",
    creator: "0x4a8...9f3b",
    activeUsers: 28,
    totalUsers: 143
  };

  // Mock participants
  const participants = [
    { id: 1, address: "0x1a2...3b4c", isActive: true, joinedAt: "10:15 AM" },
    { id: 2, address: "0x4d5...6e7f", isActive: true, joinedAt: "10:20 AM" },
    { id: 3, address: "0x8g9...0h1i", isActive: true, joinedAt: "10:32 AM" },
    { id: 4, address: "0xj2k...3l4m", isActive: true, joinedAt: "10:45 AM" },
    { id: 5, address: "0x5n6...7o8p", isActive: false, joinedAt: "09:30 AM" },
    { id: 6, address: "0x9q0...1r2s", isActive: false, joinedAt: "09:15 AM" },
    { id: 7, address: "0x3t4...5u6v", isActive: false, joinedAt: "08:45 AM" }
  ];

  // Initial messages
  useEffect(() => {
    setChatMessages([
      { sender: '0x4d5...6e7f', content: 'Have you all seen the recent price movement?', timestamp: '10:21 AM' },
      { sender: '0x8g9...0h1i', content: 'Yes, quite a volatile day!', timestamp: '10:33 AM' },
      { sender: 'System', content: '0xj2k...3l4m has joined the room', timestamp: '10:45 AM', isSystem: true },
      { sender: '0x1a2...3b4c', content: 'Welcome! We were just discussing the market dip', timestamp: '10:46 AM' },
      { sender: '0xj2k...3l4m', content: 'Thanks! What do you think caused it?', timestamp: '10:47 AM' },
      { sender: '0x4d5...6e7f', content: 'Probably the news about the new regulations', timestamp: '10:48 AM' },
      { sender: 'System', content: '0x4d5...6e7f sent 0.05 ETH to 0xj2k...3l4m', timestamp: '10:50 AM', isTransaction: true }
    ]);
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '') return;
    
    setChatMessages([...chatMessages, { 
      sender: '0x1a2...3b4c', 
      content: message, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }]);
    setMessage('');
    
    // Mock response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        sender: '0x4d5...6e7f', 
        content: 'That\'s an interesting point!', 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    }, 2000);
  };

  const sendCrypto = (e) => {
    e.preventDefault();
    if (cryptoAmount.trim() === '' || !selectedUser) return;
    
    setChatMessages([...chatMessages, { 
      sender: 'System', 
      content: `0x1a2...3b4c sent ${cryptoAmount} ETH to ${selectedUser}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isTransaction: true
    }]);
    
    setIsTypingCrypto(false);
    setCryptoAmount('');
    setSelectedUser(null);
  };

  const startCryptoTransfer = (user) => {
    setSelectedUser(user);
    setIsTypingCrypto(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Head>
        <title>{roomData.name} | Linqo</title>
        <meta name="description" content={`Join the ${roomData.name} room on Linqo`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="border-b border-gray-800 backdrop-blur-md bg-gray-900/80 fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/rooms" className="flex items-center space-x-2 text-gray-300 hover:text-white transition">
              <ArrowLeft size={18} />
              <span>Back to Rooms</span>
            </Link>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowRoomInfo(!showRoomInfo)}
                className="p-2 text-gray-400 hover:text-white transition"
              >
                <Info size={20} />
              </button>
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="flex items-center space-x-1 text-gray-400 hover:text-white transition"
              >
                <Users size={20} />
                <span className="text-sm">{roomData.activeUsers}</span>
              </button>
            </div>
            <div className="px-4 py-2 bg-gray-800 rounded-full">
              <span className="text-sm font-medium text-gray-200">0x1a2...3b4c</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16 flex-1 flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
          {/* Room Title */}
          <div className="p-4 border-b border-gray-800 bg-gray-900/50">
            <h1 className="text-xl font-bold">{roomData.name}</h1>
            <p className="text-sm text-gray-400">{roomData.category} • {roomData.activeUsers} online</p>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === '0x1a2...3b4c' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${
                    msg.isSystem 
                      ? 'bg-gray-800 text-gray-300 text-center w-full' 
                      : msg.sender === '0x1a2...3b4c' 
                        ? 'bg-blue-600' 
                        : 'bg-gray-700'
                  } ${msg.isTransaction ? 'border border-blue-500/30 bg-blue-500/10' : ''}`}
                >
                  {!msg.isSystem && (
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-xs opacity-70">{msg.sender}</div>
                      <div className="text-xs opacity-50">{msg.timestamp}</div>
                    </div>
                  )}
                  <div className={msg.isSystem ? 'text-sm' : ''}>{msg.content}</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t border-gray-800 bg-gray-900">
            {isTypingCrypto ? (
              <form onSubmit={sendCrypto} className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden flex items-center">
                  <Wallet className="mx-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={cryptoAmount}
                    onChange={(e) => setCryptoAmount(e.target.value)}
                    placeholder={`Enter ETH amount to send to ${selectedUser}...`}
                    className="bg-transparent p-3 outline-none w-full text-white"
                    autoFocus
                  />
                </div>
                <button 
                  type="submit"
                  className="p-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  <Send size={18} />
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setIsTypingCrypto(false);
                    setSelectedUser(null);
                  }}
                  className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                >
                  <X size={18} />
                </button>
              </form>
            ) : (
              <form onSubmit={sendMessage} className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="bg-transparent p-3 outline-none w-full text-white"
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setSelectedUser(participants[1].address);
                    setIsTypingCrypto(true);
                  }}
                  className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                >
                  <Wallet size={18} />
                </button>
                <button 
                  type="submit"
                  className="p-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  <Send size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
        
        {/* Participants Sidebar */}
        <div className={`w-64 bg-gray-800 border-l border-gray-700 h-[calc(100vh-4rem)] transform transition-transform duration-300 ease-in-out ${showParticipants ? 'translate-x-0' : 'translate-x-full'} fixed right-0 top-16 lg:static lg:transform-none ${!showParticipants && 'lg:block hidden'}`}>
          <div className="p-4 border-b border-gray-700">
            <h2 className="font-bold">Participants ({participants.length})</h2>
            <p className="text-xs text-gray-400">{participants.filter(p => p.isActive).length} online</p>
          </div>
          <div className="overflow-y-auto h-[calc(100%-56px)]">
            {participants.map((user) => (
              <div key={user.id} className="p-4 hover:bg-gray-700 flex items-center justify-between border-b border-gray-700/50">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${user.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <div>
                    <div className="font-medium">{user.address}</div>
                    <div className="text-xs text-gray-400 flex items-center">
                      <Clock size={10} className="mr-1" /> {user.joinedAt}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => startCryptoTransfer(user.address)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Wallet size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Room Info Sidebar */}
        <div className={`w-64 bg-gray-800 border-l border-gray-700 h-[calc(100vh-4rem)] transform transition-transform duration-300 ease-in-out ${showRoomInfo ? 'translate-x-0' : '-translate-x-full'} fixed left-0 top-16 lg:static lg:transform-none ${!showRoomInfo && 'lg:hidden'}`}>
          <div className="p-4 border-b border-gray-700">
            <h2 className="font-bold">Room Info</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400">About</h3>
              <p className="mt-1 text-sm">{roomData.description}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Rules</h3>
              <p className="mt-1 text-sm">{roomData.rules}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Created</h3>
              <p className="mt-1 text-sm">{new Date(roomData.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Creator</h3>
              <p className="mt-1 text-sm">{roomData.creator}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Total Members</h3>
              <p className="mt-1 text-sm">{roomData.totalUsers}</p>
            </div>
            
            <div className="pt-4 border-t border-gray-700">
              <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg flex items-center justify-center space-x-2">
                <Video size={16} />
                <span>Start Video Chat</span>
              </button>
              <button className="mt-2 w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg flex items-center justify-center space-x-2">
                <UserPlus size={16} />
                <span>Invite Friends</span>
              </button>
              <button className="mt-2 w-full bg-gray-700 hover:bg-gray-600 py-2 rounded-lg flex items-center justify-center space-x-2">
                <Settings size={16} />
                <span>Room Settings</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}