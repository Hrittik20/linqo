'use client'

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Video, VideoOff, Mic, MicOff, Send, X, Wallet } from 'lucide-react';
import { TEST } from '../test/page';
import { BrowserRouter } from 'react-router-dom';

export default function RandomConnect() {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isTypingCrypto, setIsTypingCrypto] = useState(false);
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [fullscreen, setFullscreen] = useState(false);

  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [localVideoTrack, setlocalVideoTrack] = useState<MediaStreamTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [joined, setJoined] = useState(false);

  const getCam = async () => {
    try {
      const stream = await window.navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
  
      const audioTrack = stream.getAudioTracks()[0];
      const videoTrack = stream.getVideoTracks()[0];
      setLocalAudioTrack(audioTrack);
      setlocalVideoTrack(videoTrack);
  
      if (videoRef.current) {
        videoRef.current.srcObject = new MediaStream([videoTrack]);
  
        // Wait for the video metadata to load before playing
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
          }
        };
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
    //checkAudio(stream); // Check audio stream
  }

  //TOGGLE VIDEO & AUDIO

  const toggleVideo = () => {
    if (videoEnabled) {
      // Stop the video track to turn off the camera
      if (localVideoTrack) {
        localVideoTrack.stop(); // Stop the video track
      }
      setlocalVideoTrack(null); // Clear the video track reference
      setIsConnected(false);
    } else {
      // Reinitialize the video track
      window.navigator.mediaDevices.getUserMedia({
        video: true,
      })
      .then((stream) => {
        const videoTrack = stream.getVideoTracks()[0];
        setlocalVideoTrack(videoTrack);
        setIsConnected(true);
  
        if (videoRef.current) {
          videoRef.current.srcObject = new MediaStream([videoTrack]);
    
          // Wait for the video metadata to load before playing
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play();
            }
          };
        }
      })
      .catch((error) => {
        console.error("Error accessing video:", error);
      });
    }
    setVideoEnabled(!videoEnabled);
  };
  
  const toggleAudio = () => {
    if (localAudioTrack) {
      if (audioEnabled) {
        localAudioTrack.enabled = false; // Disable the audio track
      } else {
        localAudioTrack.enabled = true; // Enable the audio track
      }
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleFullscreen = () => setFullscreen(!fullscreen);

  // Mock connection effect
  // useEffect(() => {
  //   if (isConnecting) {
  //     const timer = setTimeout(() => {
  //       setIsConnecting(false);
  //       setIsConnected(true);
  //     }, 3000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [isConnecting]);

  useEffect(() => {
    if (videoRef && videoRef.current) {
        getCam()
      }
  }, [videoRef]);


  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '') return;
    
    setChatMessages([...chatMessages, { sender: 'You', content: message }]);
    setMessage('');
    
    // Mock response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'Stranger', content: 'That sounds interesting!' }]);
    }, 1500);
  };

  const sendCrypto = (e) => {
    e.preventDefault();
    if (cryptoAmount.trim() === '') return;
    
    setChatMessages([...chatMessages, { 
      sender: 'System', 
      content: `You sent ${cryptoAmount} ETH to Stranger`,
      isTransaction: true
    }]);
    
    setIsTypingCrypto(false);
    setCryptoAmount('');
  };

  const disconnect = () => {
    setIsConnected(false);
    setIsConnecting(true);
    setChatMessages([]);
    
    // Reconnect after a short delay
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 3000);
  };

  //TESTING

  const checkAudio = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
  
    source.connect(analyser);
  
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const checkAudioInterval = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      const audioLevel = dataArray.reduce((a, b) => a + b, 0);
  
      if (audioLevel > 0) {
        console.log("Audio is coming through!");
      } else {
        console.log("No audio detected.");
      }
    }, 500);
  
    return () => clearInterval(checkAudioInterval); // Cleanup function
  };

  if(!joined) {
    return (
      <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
        <Head>
          <title>Random Connect | Linqo</title>
          <meta name="description" content="Connect with random strangers on Linqo" />
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
                Linqo
              </div>
              <div className="px-4 py-2 bg-gray-800 rounded-full">
                <span className="text-sm font-medium text-gray-200">0x1a2...3b4c</span>
              </div>
            </div>
          </div>
        </header>

        <main className="pt-16 h-[calc(100vh-4rem)] flex flex-col">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            {/* Video Areas */}
            <div className="relative rounded-4xl h-[400px] overflow-hidden bg-gray-900 border border-gray-700">
              {/* User Video */}
              <div className="absolute inset-0">
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-500">
                <video
                  autoPlay
                  ref={videoRef}
                  className={`w-full h-full object-cover transform scale-x-[-1] ${
                    isConnected ? '' : 'hidden'
                  }`}
                ></video>
                {!isConnected && (
                  <div className="text-center">
                    <VideoOff size={48} className="mx-auto mb-2" />
                    <p>Disconnected</p>
                  </div>
                )}
                </div>
              </div>

              {/* Top Controls */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button 
                onClick={toggleFullscreen}
                className="p-2 bg-gray-800 bg-opacity-70 hover:bg-opacity-100 rounded-full transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {fullscreen ? (
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                  ) : (
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  )}
                </svg>
              </button>
            </div>

            {/* Mute Icon */}
            {!audioEnabled && (
              <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-70 p-2 rounded-full">
                <MicOff size={20} className="text-red-500" />
              </div>
            )}
              
              {/* Controls Overlay */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-3">
                <button 
                  onClick={toggleVideo}
                  className={`p-3 rounded-full ${videoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
                >
                  {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                </button>
                <button 
                  onClick={toggleAudio}
                  className={`p-3 rounded-full ${audioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
                >
                  {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
                <button 
                  onClick={disconnect}
                  className="p-3 bg-red-500 hover:bg-red-600 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="relative rounded-4xl h-[400px] overflow-hidden bg-gray-800 border border-gray-700 flex items-center justify-center">
              {/* Stranger Video */}
              <div className="absolute inset-0">
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-500">
                  {isConnecting ? (
                    <div className="text-center">
                      <div className="mb-4">
                        <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-700 rounded-full animate-spin mx-auto"></div>
                      </div>
                      <p className="text-lg">Finding someone to chat with...</p>
                    </div>
                  ) : isConnected ? (
                    "Stranger's Camera"
                  ) : (
                    <div className="text-center">
                      <div className="mb-4">
                        <X size={48} className="mx-auto" />
                      </div>
                      <p className="text-lg">Disconnected</p>
                      <button 
                        onClick={() => setIsConnecting(true)}
                        className="mt-4 bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-full"
                      >
                        Find New Match
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => {
                setJoined(true);
            }}>Join
          </button>

          {/* Chat Area */}
          <div className="h-64 lg:h-72 border-t border-gray-800 bg-gray-900 p-4 flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${
                      msg.sender === 'System' 
                        ? 'bg-gray-800 text-gray-300 text-center w-full' 
                        : msg.sender === 'You' 
                          ? 'bg-blue-600' 
                          : 'bg-gray-700'
                    } ${msg.isTransaction ? 'border border-blue-500/30 bg-blue-500/10' : ''}`}
                  >
                    {msg.sender !== 'System' && (
                      <div className="text-xs opacity-70 mb-1">{msg.sender}</div>
                    )}
                    <div>{msg.content}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 mb-9">
              {isTypingCrypto ? (
                <form onSubmit={sendCrypto} className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-800 rounded-full overflow-hidden flex items-center">
                    <Wallet className="mx-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={cryptoAmount}
                      onChange={(e) => setCryptoAmount(e.target.value)}
                      placeholder="Enter ETH amount..."
                      className="bg-transparent p-3 outline-none w-full text-white"
                      autoFocus
                    />
                  </div>
                  <button 
                    type="submit"
                    className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition"
                  >
                    <Send size={18} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsTypingCrypto(false)}
                    className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition"
                  >
                    <X size={18} />
                  </button>
                </form>
              ) : (
                <form onSubmit={sendMessage} className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-800 rounded-full overflow-hidden">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="bg-transparent p-3 outline-none w-full text-white"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsTypingCrypto(true)}
                    className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition"
                  >
                    <Wallet size={18} />
                  </button>
                  <button 
                    type="submit"
                    className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition"
                  >
                    <Send size={18} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  } else {
    return (
      <BrowserRouter>
        <TEST name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} />
      </BrowserRouter>
    );
  }
}