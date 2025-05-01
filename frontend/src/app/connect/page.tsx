'use client'

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Socket, io } from "socket.io-client";
import { ArrowLeft, Video, VideoOff, Mic, MicOff, Send, X, Wallet, Users } from 'lucide-react';

const URL = "http://localhost:3000";

export default function Connect() {
  // Get user data from localStorage
  const [userData, setUserData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lobby, setLobby] = useState(true);
  const [roomId, setRoomId] = useState(null);
  const [remoteName, setRemoteName] = useState("Stranger");

  // Media state
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState(null);
  const [remoteAudioTrack, setRemoteAudioTrack] = useState(null);
  const [remoteMediaStream, setRemoteMediaStream] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  // WebRTC connections
  const [sendingPc, setSendingPc] = useState(null);
  const [receivingPc, setReceivingPc] = useState(null);
  
  // Chat state
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isTypingCrypto, setIsTypingCrypto] = useState(false);
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Load user data on mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('linqo_user_data');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
        setVideoEnabled(parsedData.videoEnabled);
        setAudioEnabled(parsedData.audioEnabled);
        setRoomId(parsedData.roomId);
        
        // Get media tracks
        initializeMedia(parsedData.videoEnabled, parsedData.audioEnabled);
      } else {
        // Redirect to setup page if no user data
        router.push('/random');
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      router.push('/random');
    }
  }, [router]);

  // Initialize WebRTC and Socket.io connection
  useEffect(() => {
    if (!userData || !localVideoTrack) return;

    const newSocket = io(URL);
    
    // Emit join event when socket connects
    newSocket.on('connect', () => {
      console.log("Socket connected");
      // Join room with roomId from URL or localStorage
      const room = searchParams.get('room') || userData.roomId;
      if (room) {
        console.log(`Joining room: ${room}`);
        newSocket.emit('join-room', { roomId: room, name: userData.username });
      }
    });

    // Handle when we should create and send an offer
    newSocket.on('send-offer', async ({ roomId }) => {
      console.log("Sending offer");
      setLobby(false);
      setIsConnecting(false);
      setIsConnected(true);
      
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      setSendingPc(pc);
      
      // Add tracks
      if (localVideoTrack) {
        pc.addTrack(localVideoTrack);
      }
      if (localAudioTrack) {
        pc.addTrack(localAudioTrack);
      }

      // Handle ICE candidates
      pc.onicecandidate = async (e) => {
        if (e.candidate) {
          newSocket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "sender",
            roomId
          });
        }
      };

      // Create and send offer when needed
      pc.onnegotiationneeded = async () => {
        try {
          const sdp = await pc.createOffer();
          await pc.setLocalDescription(sdp);
          newSocket.emit("offer", {
            sdp,
            roomId
          });
        } catch (error) {
          console.error("Error creating offer:", error);
        }
      };
    });

    // Handle when we receive an offer from another peer
    newSocket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
      console.log("Received offer");
      setLobby(false);
      setIsConnecting(false);
      setIsConnected(true);
      
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      
      // Set remote description from the offer we received
      await pc.setRemoteDescription(new RTCSessionDescription(remoteSdp));
      
      // Create answer
      const sdp = await pc.createAnswer();
      await pc.setLocalDescription(sdp);
      
      // Create a media stream for the remote video
      const stream = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      
      setRemoteMediaStream(stream);
      setReceivingPc(pc);
      
      // Handle incoming tracks
      pc.ontrack = (event) => {
        console.log("Got remote track:", event.track.kind);
        if (event.track.kind === 'video') {
          setRemoteVideoTrack(event.track);
        } else if (event.track.kind === 'audio') {
          setRemoteAudioTrack(event.track);
        }
        
        if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
          remoteVideoRef.current.srcObject.addTrack(event.track);
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = async (e) => {
        if (e.candidate) {
          newSocket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "receiver",
            roomId
          });
        }
      };

      // Send answer back
      newSocket.emit("answer", {
        roomId,
        sdp: sdp
      });
    });

    // Handle when we receive an answer to our offer
    newSocket.on("answer", ({ roomId, sdp: remoteSdp }) => {
      console.log("Received answer");
      setLobby(false);
      setSendingPc(pc => {
        if (pc) {
          pc.setRemoteDescription(new RTCSessionDescription(remoteSdp))
            .catch(err => console.error("Error setting remote description:", err));
        }
        return pc;
      });
    });

    // Handle when we're back in the lobby
    newSocket.on("lobby", () => {
      setLobby(true);
      setIsConnecting(true);
      setIsConnected(false);
    });

    // Handle ICE candidates from remote peer
    newSocket.on("add-ice-candidate", ({ candidate, type }) => {
      console.log("Received ICE candidate:", type);
      if (type === "sender") {
        setReceivingPc(pc => {
          if (pc) {
            pc.addIceCandidate(new RTCIceCandidate(candidate))
              .catch(err => console.error("Error adding ICE candidate:", err));
          }
          return pc;
        });
      } else {
        setSendingPc(pc => {
          if (pc) {
            pc.addIceCandidate(new RTCIceCandidate(candidate))
              .catch(err => console.error("Error adding ICE candidate:", err));
          }
          return pc;
        });
      }
    });

    // Handle user information
    newSocket.on("user-connected", ({ name }) => {
      console.log("User connected:", name);
      setRemoteName(name);
      
      // Add system message to chat
      setChatMessages(prev => [
        ...prev, 
        { 
          sender: 'System', 
          content: `${name} has connected to the room`, 
        }
      ]);
    });

    // Handle chat messages
    newSocket.on("chat-message", ({ sender, message }) => {
      setChatMessages(prev => [
        ...prev, 
        { 
          sender: sender, 
          content: message, 
        }
      ]);
    });

    setSocket(newSocket);

    // Cleanup function
    return () => {
      if (sendingPc) {
        sendingPc.close();
      }
      if (receivingPc) {
        receivingPc.close();
      }
      newSocket.disconnect();
    };
  }, [userData, localVideoTrack, localAudioTrack, searchParams]);

  // Initialize local media streams
  const initializeMedia = async (videoEnabled = true, audioEnabled = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: audioEnabled,
      });
      
      const audioTrack = stream.getAudioTracks()[0];
      const videoTrack = stream.getVideoTracks()[0];
      
      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);
      
      if (videoTrack && localVideoRef.current) {
        const localStream = new MediaStream([videoTrack]);
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.play().catch(err => console.error("Error playing local video:", err));
      }
      
      setIsConnecting(false);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      setVideoEnabled(false);
      setAudioEnabled(false);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (videoEnabled) {
      if (localVideoTrack) {
        localVideoTrack.stop();
      }
      setLocalVideoTrack(null);
    } else {
      navigator.mediaDevices.getUserMedia({
        video: true,
      })
      .then((stream) => {
        const videoTrack = stream.getVideoTracks()[0];
        setLocalVideoTrack(videoTrack);
  
        if (localVideoRef.current) {
          const newStream = new MediaStream([videoTrack]);
          localVideoRef.current.srcObject = newStream;
          localVideoRef.current.play().catch(err => console.error("Error playing local video:", err));
        }
        
        // Add the track to the peer connection if it exists
        if (sendingPc) {
          const senders = sendingPc.getSenders();
          const videoSender = senders.find(s => s.track && s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(videoTrack);
          } else {
            sendingPc.addTrack(videoTrack);
          }
        }
      })
      .catch((error) => {
        console.error("Error accessing video:", error);
      });
    }
    setVideoEnabled(!videoEnabled);
  };
  
  // Toggle audio
  const toggleAudio = () => {
    if (localAudioTrack) {
      localAudioTrack.enabled = !audioEnabled;
      setAudioEnabled(!audioEnabled);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => setFullscreen(!fullscreen);

  // Send a message
  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '') return;
    
    // Add message to local chat
    setChatMessages([...chatMessages, { sender: 'You', content: message }]);
    
    // Send message via socket
    if (socket) {
      socket.emit('chat-message', { roomId, message });
    }
    
    setMessage('');
  };

  // Send crypto
  const sendCrypto = (e) => {
    e.preventDefault();
    if (cryptoAmount.trim() === '') return;
    
    setChatMessages([...chatMessages, { 
      sender: 'System', 
      content: `You sent ${cryptoAmount} ETH to ${remoteName}`,
      isTransaction: true
    }]);
    
    if (socket) {
      socket.emit('send-crypto', { roomId, amount: cryptoAmount });
    }
    
    setIsTypingCrypto(false);
    setCryptoAmount('');
  };

  // Disconnect from current room
  const disconnect = () => {
    if (socket) {
      socket.emit('leave-room', { roomId });
    }
    
    // Close peer connections
    if (sendingPc) {
      sendingPc.close();
      setSendingPc(null);
    }
    if (receivingPc) {
      receivingPc.close();
      setReceivingPc(null);
    }
    
    setIsConnected(false);
    setLobby(true);
    setChatMessages([]);
    
    // Navigate back to setup page
    router.push('/random');
  };

  // Show loading state if no user data yet
  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      <Head>
        <title>Connect | Linqo</title>
        <meta name="description" content="Connect with others on Linqo" />
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
        {/* Status indicator */}
        {lobby && (
          <div className="bg-blue-500 bg-opacity-10 border-b border-blue-500 border-opacity-20 py-2">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
              <Users size={16} className="mr-2 text-blue-400" />
              <span className="text-sm text-blue-300">Looking for someone to connect with...</span>
            </div>
          </div>
        )}

        {/* Video areas */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
          {/* Local video */}
          <div className="relative rounded-xl h-[400px] overflow-hidden bg-gray-900 border border-gray-700">
            <div className="absolute inset-0">
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-500">
                <video
                  autoPlay
                  ref={localVideoRef}
                  className={`w-full h-full object-cover transform scale-x-[-1] ${
                    videoEnabled ? '' : 'hidden'
                  }`}
                  muted
                ></video>
                {!videoEnabled && (
                  <div className="text-center">
                    <VideoOff size={48} className="mx-auto mb-2" />
                    <p>Camera Off</p>
                  </div>
                )}
              </div>
            </div>

            {/* Username overlay */}
            <div className="absolute bottom-14 left-4 bg-gray-900/70 px-3 py-1 rounded-lg text-sm backdrop-blur-sm">
              {userData?.username || "You"} (You)
            </div>

            {/* Mute icon */}
            {!audioEnabled && (
              <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-70 p-2 rounded-full">
                <MicOff size={20} className="text-red-500" />
              </div>
            )}
              
            {/* Controls overlay */}
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

          {/* Remote video */}
          <div className="relative rounded-xl h-[400px] overflow-hidden bg-gray-800 border border-gray-700 flex items-center justify-center">
            <div className="absolute inset-0">
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-500">
                {isConnecting || lobby ? (
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-700 rounded-full animate-spin mb-4"></div>
                    <p>Waiting for connection...</p>
                  </div>
                ) : (
                  <video
                    autoPlay
                    ref={remoteVideoRef}
                    className={`w-full h-full object-cover transform scale-x-[-1]`}
                  ></video>
                )}
              </div>
            </div>
            
            {/* Remote username overlay */}
            {remoteVideoTrack && (
              <div className="absolute bottom-14 left-4 bg-gray-900/70 px-3 py-1 rounded-lg text-sm backdrop-blur-sm">
                {remoteName}
              </div>
            )}
            
            {/* Fullscreen toggle */}
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
          </div>
        </div>

        {/* Chat area */}
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
          
          {/* Message input */}
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
}