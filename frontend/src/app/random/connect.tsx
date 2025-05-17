// 'use client'

// import { useParams, useRouter, useSearchParams } from "next/navigation";
// import { useEffect, useRef, useState } from "react";
// import { Socket, io } from "socket.io-client";
// import React from 'react';
// import Head from 'next/head';
// import Link from 'next/link';
// import { ArrowLeft, Video, VideoOff, Mic, MicOff, Send, X, Wallet, Users } from 'lucide-react';


// const URL = "http://localhost:3000";

// export const Connect = ({
//   name,
//   localAudioTrack,
//   localVideoTrack,
// }: {
//   name: string,
//   localAudioTrack: MediaStreamTrack | null,
//   localVideoTrack: MediaStreamTrack | null,
// }) => {
//     const [searchParams, setSearchParams] = useSearchParams();
//     const [lobby, setLobby] = useState(true);
//     const [socket, setSocket] = useState<null | Socket>(null);
//     const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
//     const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(null);
//     const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
//     const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
//     const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
//     const remoteVideoRef = useRef<HTMLVideoElement>();
//     const localVideoRef = useRef<HTMLVideoElement>();


//     const [isConnecting, setIsConnecting] = useState(true);
//     const [isConnected, setIsConnected] = useState(true);
//     const [message, setMessage] = useState('');
//     const [chatMessages, setChatMessages] = useState([]);
//     const [videoEnabled, setVideoEnabled] = useState(true);
//     const [audioEnabled, setAudioEnabled] = useState(true);
//     const [isTypingCrypto, setIsTypingCrypto] = useState(false);
//     const [cryptoAmount, setCryptoAmount] = useState('');
//     const [fullscreen, setFullscreen] = useState(false);
//     const videoRef = useRef<HTMLVideoElement>(null);

//     const [joined, setJoined] = useState(false);
//     const [roomId, setRoomId] = useState<string | null>(null);
//     const [remoteName, setRemoteName] = useState("Stranger");
//     const { id } = useParams() 

//     //TOGGLE VIDEO & AUDIO

//     const toggleVideo = () => {
//     if (videoEnabled) {
//         // Stop the video track to turn off the camera
//         if (localVideoTrack) {
//         localVideoTrack.stop(); // Stop the video track
//         }
//         setlocalVideoTrack(null); // Clear the video track reference
//         setIsConnected(false);
//     } else {
//         // Reinitialize the video track
//         window.navigator.mediaDevices.getUserMedia({
//         video: true,
//         })
//         .then((stream) => {
//         const videoTrack = stream.getVideoTracks()[0];
//         setlocalVideoTrack(videoTrack);
//         setIsConnected(true);
    
//         if (videoRef.current) {
//             videoRef.current.srcObject = new MediaStream([videoTrack]);
    
//             // Wait for the video metadata to load before playing
//             videoRef.current.onloadedmetadata = () => {
//             if (videoRef.current) {
//                 videoRef.current.play();
//             }
//             };
//         }
//         })
//         .catch((error) => {
//         console.error("Error accessing video:", error);
//         });
//     }
//     setVideoEnabled(!videoEnabled);
//     };
    
//     const toggleAudio = () => {
//     if (localAudioTrack) {
//         if (audioEnabled) {
//         localAudioTrack.enabled = false; // Disable the audio track
//         } else {
//         localAudioTrack.enabled = true; // Enable the audio track
//         }
//         setAudioEnabled(!audioEnabled);
//     }
//     };

//     const toggleFullscreen = () => setFullscreen(!fullscreen);


//     const sendMessage = (e) => {
//     e.preventDefault();
//     if (message.trim() === '') return;
    
//     setChatMessages([...chatMessages, { sender: 'You', content: message }]);
//     setMessage('');
    
//     // Mock response
//     setTimeout(() => {
//         setChatMessages(prev => [...prev, { sender: 'Stranger', content: 'That sounds interesting!' }]);
//     }, 1500);
//     };

//     const sendCrypto = (e) => {
//     e.preventDefault();
//     if (cryptoAmount.trim() === '') return;
    
//     setChatMessages([...chatMessages, { 
//         sender: 'System', 
//         content: `You sent ${cryptoAmount} ETH to Stranger`,
//         isTransaction: true
//     }]);
    
//     setIsTypingCrypto(false);
//     setCryptoAmount('');
//     };

//     const disconnect = () => {
//     setIsConnected(false);
//     setIsConnecting(true);
//     setChatMessages([]);
    
//     // Reconnect after a short delay
//     setTimeout(() => {
//         setIsConnecting(false);
//         setIsConnected(true);
//     }, 3000);
//     };

//     useEffect(() => {
//       const socket = io(URL);
//       socket.on('send-offer', async ({roomId}) => {
//           console.log("sending offer");
//           setLobby(false);
//           const pc = new RTCPeerConnection();

//           setSendingPc(pc);
//           if (localVideoTrack) {
//               console.error("added tack");
//               console.log(localVideoTrack)
//               pc.addTrack(localVideoTrack)
//           }
//           if (localAudioTrack) {
//               console.error("added tack");
//               console.log(localAudioTrack)
//               pc.addTrack(localAudioTrack)
//           }

//           pc.onicecandidate = async (e) => {
//               console.log("receiving ice candidate locally");
//               if (e.candidate) {
//                  socket.emit("add-ice-candidate", {
//                   candidate: e.candidate,
//                   type: "sender",
//                   roomId
//                  })
//               }
//           }

//           pc.onnegotiationneeded = async () => {
//               console.log("on negotiation neeeded, sending offer");
//               const sdp = await pc.createOffer();
//               //@ts-ignore
//               pc.setLocalDescription(sdp)
//               socket.emit("offer", {
//                   sdp,
//                   roomId
//               })
//           }
//       });

//       socket.on("offer", async ({roomId, sdp: remoteSdp}) => {
//           console.log("received offer");
//           setLobby(false);
//           const pc = new RTCPeerConnection();
//           pc.setRemoteDescription(remoteSdp)
//           const sdp = await pc.createAnswer();
//           //@ts-ignore
//           pc.setLocalDescription(sdp)
//           const stream = new MediaStream();
//           if (remoteVideoRef.current) {
//               remoteVideoRef.current.srcObject = stream;
//           }

//           setRemoteMediaStream(stream);
//           // trickle ice 
//           setReceivingPc(pc);
//           window.pcr = pc;
//           pc.ontrack = (e) => {
//               alert("ontrack");
//               // console.error("inside ontrack");
//               // const {track, type} = e;
//               // if (type == 'audio') {
//               //     // setRemoteAudioTrack(track);
//               //     // @ts-ignore
//               //     remoteVideoRef.current.srcObject.addTrack(track)
//               // } else {
//               //     // setRemoteVideoTrack(track);
//               //     // @ts-ignore
//               //     remoteVideoRef.current.srcObject.addTrack(track)
//               // }
//               // //@ts-ignore
//               // remoteVideoRef.current.play();
//           }

//           pc.onicecandidate = async (e) => {
//               if (!e.candidate) {
//                   return;
//               }
//               console.log("omn ice candidate on receiving seide");
//               if (e.candidate) {
//                  socket.emit("add-ice-candidate", {
//                   candidate: e.candidate,
//                   type: "receiver",
//                   roomId
//                  })
//               }
//           }

//           socket.emit("answer", {
//               roomId,
//               sdp: sdp
//           });
//           setTimeout(() => {
//               const track1 = pc.getTransceivers()[0].receiver.track
//               const track2 = pc.getTransceivers()[1].receiver.track
//               console.log(track1);
//               if (track1.kind === "video") {
//                   setRemoteAudioTrack(track2)
//                   setRemoteVideoTrack(track1)
//               } else {
//                   setRemoteAudioTrack(track1)
//                   setRemoteVideoTrack(track2)
//               }
//               //@ts-ignore
//               remoteVideoRef.current.srcObject.addTrack(track1)
//               //@ts-ignore
//               remoteVideoRef.current.srcObject.addTrack(track2)
//               //@ts-ignore
//               remoteVideoRef.current.play();
//               // if (type == 'audio') {
//               //     // setRemoteAudioTrack(track);
//               //     // @ts-ignore
//               //     remoteVideoRef.current.srcObject.addTrack(track)
//               // } else {
//               //     // setRemoteVideoTrack(track);
//               //     // @ts-ignore
//               //     remoteVideoRef.current.srcObject.addTrack(track)
//               // }
//               // //@ts-ignore
//           }, 5000)
//       });

//       socket.on("answer", ({roomId, sdp: remoteSdp}) => {
//           setLobby(false);
//           setSendingPc(pc => {
//               pc?.setRemoteDescription(remoteSdp)
//               return pc;
//           });
//           console.log("loop closed");
//       })

//       socket.on("lobby", () => {
//           setLobby(true);
//       })

//       socket.on("add-ice-candidate", ({candidate, type}) => {
//           console.log("add ice candidate from remote");
//           console.log({candidate, type})
//           if (type == "sender") {
//               setReceivingPc(pc => {
//                   if (!pc) {
//                       console.error("receicng pc nout found")
//                   } else {
//                       console.error(pc.ontrack)
//                   }
//                   pc?.addIceCandidate(candidate)
//                   return pc;
//               });
//           } else {
//               setSendingPc(pc => {
//                   if (!pc) {
//                       console.error("sending pc nout found")
//                   } else {
//                       // console.error(pc.ontrack)
//                   }
//                   pc?.addIceCandidate(candidate)
//                   return pc;
//               });
//           }
//       })

//       setSocket(socket)
//   }, [name])

//     useEffect(() => {
//         if (localVideoRef.current && localVideoTrack) {
//           localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
//           localVideoRef.current.play().catch((error) => {
//             console.error("Error playing local video:", error);
//           });
//         }
//       }, [localVideoTrack]);

//     return (
//       <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
//         <Head>
//           <title>Random Connect | Linqo</title>
//           <meta name="description" content="Connect with random strangers on Linqo" />
//           <link rel="icon" href="/favicon.ico" />
//           <h1>Page {id}</h1>
//         </Head>

//         {/* Header */}
//         <header className="border-b border-gray-800 backdrop-blur-md bg-gray-900/80 fixed w-full z-10">
//           <div className="max-w-7xl mx-auto px-4">
//             <div className="flex justify-between items-center h-16">
//               <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-white transition">
//                 <ArrowLeft size={18} />
//                 <span>Back to Home</span>
//               </Link>
//               <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
//                 Linqo
//               </div>
//               <div className="px-4 py-2 bg-gray-800 rounded-full">
//                 <span className="text-sm font-medium text-gray-200">0x1a2...3b4c</span>
//               </div>
//             </div>
//           </div>
//         </header>

//         <main className="pt-16 h-[calc(100vh-4rem)] flex flex-col">
//           <h1>Room ID: {roomId || "Waiting for room..."}</h1>
//           <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
//             {/* Video Areas */}
//             <div className="relative rounded-4xl h-[400px] overflow-hidden bg-gray-900 border border-gray-700">
//               {/* User Video */}
//               <div className="absolute inset-0">
//                 <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-500">
//                 <video
//                   autoPlay
//                   ref={localVideoRef}
//                   className={`w-full h-full object-cover transform scale-x-[-1] ${
//                     isConnected ? '' : 'hidden'
//                   }`}
//                 ></video>
//                 {!isConnected && (
//                   <div className="text-center">
//                     <VideoOff size={48} className="mx-auto mb-2" />
//                     <p>Disconnected</p>
//                   </div>
//                 )}
//                 </div>
//               </div>

//               {/* Add user name overlay */}
//               <div className="absolute bottom-14 left-4 bg-gray-900/70 px-3 py-1 rounded-lg text-sm backdrop-blur-sm">
//                 {name} (You)
//               </div>

//               {/* Top Controls */}
//             <div className="absolute top-4 right-4 flex space-x-2">
//               <button 
//                 onClick={toggleFullscreen}
//                 className="p-2 bg-gray-800 bg-opacity-70 hover:bg-opacity-100 rounded-full transition-all"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   {fullscreen ? (
//                     <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
//                   ) : (
//                     <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
//                   )}
//                 </svg>
//               </button>
//             </div>

//             {/* Mute Icon */}
//             {!audioEnabled && (
//               <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-70 p-2 rounded-full">
//                 <MicOff size={20} className="text-red-500" />
//               </div>
//             )}
              
//               {/* Controls Overlay */}
//               <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-3">
//                 <button 
//                   onClick={toggleVideo}
//                   className={`p-3 rounded-full ${videoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
//                 >
//                   {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
//                 </button>
//                 <button 
//                   onClick={toggleAudio}
//                   className={`p-3 rounded-full ${audioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
//                 >
//                   {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
//                 </button>
//                 <button 
//                   onClick={disconnect}
//                   className="p-3 bg-red-500 hover:bg-red-600 rounded-full"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>
//             </div>

//             <div className="relative rounded-4xl h-[400px] overflow-hidden bg-gray-800 border border-gray-700 flex items-center justify-center">
//               {/* Stranger Video */}
//               <div className="absolute inset-0">
//                 <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-500">
//                   <video
//                     autoPlay
//                     ref={remoteVideoRef}
//                     className={`w-full h-full object-cover transform scale-x-[-1]`}
//                     ></video>   
//                 </div>
//               </div>
//               {/* Add remote user name overlay */}
//               {remoteVideoTrack && (
//                 <div className="absolute bottom-14 left-4 bg-gray-900/70 px-3 py-1 rounded-lg text-sm backdrop-blur-sm">
//                   {remoteName}
//                 </div>
//               )}
//             </div>
//           </div>

//           <button onClick={() => {
//                 setJoined(true);
//             }}>Disconnect
//           </button>

//           {/* Chat Area */}
//           <div className="h-64 lg:h-72 border-t border-gray-800 bg-gray-900 p-4 flex flex-col">
//             <div className="flex-1 overflow-y-auto pr-2 space-y-3">
//               {chatMessages.map((msg, index) => (
//                 <div key={index} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
//                   <div 
//                     className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${
//                       msg.sender === 'System' 
//                         ? 'bg-gray-800 text-gray-300 text-center w-full' 
//                         : msg.sender === 'You' 
//                           ? 'bg-blue-600' 
//                           : 'bg-gray-700'
//                     } ${msg.isTransaction ? 'border border-blue-500/30 bg-blue-500/10' : ''}`}
//                   >
//                     {msg.sender !== 'System' && (
//                       <div className="text-xs opacity-70 mb-1">{msg.sender}</div>
//                     )}
//                     <div>{msg.content}</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
            
//             <div className="mt-3 mb-9">
//               {isTypingCrypto ? (
//                 <form onSubmit={sendCrypto} className="flex items-center space-x-2">
//                   <div className="flex-1 bg-gray-800 rounded-full overflow-hidden flex items-center">
//                     <Wallet className="mx-3 text-gray-400" size={18} />
//                     <input
//                       type="text"
//                       value={cryptoAmount}
//                       onChange={(e) => setCryptoAmount(e.target.value)}
//                       placeholder="Enter ETH amount..."
//                       className="bg-transparent p-3 outline-none w-full text-white"
//                       autoFocus
//                     />
//                   </div>
//                   <button 
//                     type="submit"
//                     className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition"
//                   >
//                     <Send size={18} />
//                   </button>
//                   <button 
//                     type="button"
//                     onClick={() => setIsTypingCrypto(false)}
//                     className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition"
//                   >
//                     <X size={18} />
//                   </button>
//                 </form>
//               ) : (
//                 <form onSubmit={sendMessage} className="flex items-center space-x-2">
//                   <div className="flex-1 bg-gray-800 rounded-full overflow-hidden">
//                     <input
//                       type="text"
//                       value={message}
//                       onChange={(e) => setMessage(e.target.value)}
//                       placeholder="Type a message..."
//                       className="bg-transparent p-3 outline-none w-full text-white"
//                     />
//                   </div>
//                   <button 
//                     type="button"
//                     onClick={() => setIsTypingCrypto(true)}
//                     className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition"
//                   >
//                     <Wallet size={18} />
//                   </button>
//                   <button 
//                     type="submit"
//                     className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition"
//                   >
//                     <Send size={18} />
//                   </button>
//                 </form>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>
//     )
// }



'use client'

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Video, VideoOff, Mic, MicOff, X, Wallet, Users } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { SolanaIntegration } from "./SolanaIntegration";

// Define interface for the transaction info
interface TransactionInfo {
  status: 'success' | 'error';
  amount?: string | number;
  signature?: string;
  error?: string;
}

// const URL = "https://linqo-backend-e5jlyaech-hrittiks-projects-9bda8799.vercel.app/";

const URL = "https://linqo-azure.vercel.app/";

interface ConnectProps {
  name: string;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
  onVideoTrackChange?: (track: MediaStreamTrack | null) => void;
}

export const Connect = ({
  name,
  localAudioTrack,
  localVideoTrack,
  onVideoTrackChange,
}: ConnectProps) => {
    const [searchParams] = useSearchParams();
    const [lobby, setLobby] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [sendingPc, setSendingPc] = useState<RTCPeerConnection | null>(null);
    const [receivingPc, setReceivingPc] = useState<RTCPeerConnection | null>(null);
    const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);

    const { publicKey } = useWallet();
    const [peerWalletAddress, setPeerWalletAddress] = useState<string | null>(null);

    const [isConnected, setIsConnected] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [isTransactionOpen, setIsTransactionOpen] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);

    const [transactions, setTransactions] = useState<Array<any>>([]);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [remoteName, setRemoteName] = useState("Stranger");
    const { id } = useParams();

    // Toggle video
    const toggleVideo = () => {
      if (videoEnabled) {
          // Stop the video track to turn off the camera
          if (localVideoTrack) {
            localVideoTrack.stop(); // Stop the video track
          }
          // Use the callback prop instead of trying to set state directly
          if (onVideoTrackChange) {
              onVideoTrackChange(null);
          }
          setIsConnected(false);
      } else {
          // Reinitialize the video track
          window.navigator.mediaDevices.getUserMedia({
            video: true,
          })
          .then((stream) => {
            const videoTrack = stream.getVideoTracks()[0];
            // Use the callback prop to update the parent's state
            if (onVideoTrackChange) {
                onVideoTrackChange(videoTrack);
            }
            setIsConnected(true);
        
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = new MediaStream([videoTrack]);
        
                // Wait for the video metadata to load before playing
                localVideoRef.current.onloadedmetadata = () => {
                  if (localVideoRef.current) {
                    localVideoRef.current.play();
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

    const disconnect = () => {
      setIsConnected(false);
      
      // Disconnect from socket room
      if (socket && roomId) {
        socket.emit('leave-room', { roomId });
      }
      
      setTransactions([]);
      
      // Cleanup peer connections
      if (sendingPc) {
        sendingPc.close();
        setSendingPc(null);
      }
      
      if (receivingPc) {
        receivingPc.close();
        setReceivingPc(null);
      }
      
      // Reset state
      setRoomId(null);
      setPeerWalletAddress(null);
      setRemoteName("Stranger");
      setRemoteVideoTrack(null);
      setRemoteAudioTrack(null);
      setLobby(true);
    };

    // Share wallet address when connected
    useEffect(() => {
      if (socket && publicKey && roomId) {
        // Share your wallet address when connected
        socket.emit('wallet-address', { 
          roomId, 
          address: publicKey.toString() 
        });
        
        // Listen for peer's wallet address
        socket.on('wallet-address', ({ address }) => {
          setPeerWalletAddress(address);
        });
      }
    }, [socket, publicKey, roomId]);

    useEffect(() => {
      const socketInstance = io(URL);
      socketInstance.on('send-offer', async ({roomId}) => {
          console.log("sending offer");
          setLobby(false);
          setRoomId(roomId);
          const pc = new RTCPeerConnection();

          setSendingPc(pc);
          if (localVideoTrack) {
              console.error("added track");
              console.log(localVideoTrack)
              pc.addTrack(localVideoTrack)
          }
          if (localAudioTrack) {
              console.error("added track");
              console.log(localAudioTrack)
              pc.addTrack(localAudioTrack)
          }

          pc.onicecandidate = async (e) => {
              console.log("receiving ice candidate locally");
              if (e.candidate) {
                 socketInstance.emit("add-ice-candidate", {
                  candidate: e.candidate,
                  type: "sender",
                  roomId
                 })
              }
          }

          pc.onnegotiationneeded = async () => {
              console.log("on negotiation needed, sending offer");
              const sdp = await pc.createOffer();
              pc.setLocalDescription(sdp)
              socketInstance.emit("offer", {
                  sdp,
                  roomId
              })
          }
      });

      socketInstance.on("offer", async ({roomId, sdp: remoteSdp}) => {
          console.log("received offer");
          setLobby(false);
          setRoomId(roomId);
          const pc = new RTCPeerConnection();
          pc.setRemoteDescription(remoteSdp)
          const sdp = await pc.createAnswer();
          pc.setLocalDescription(sdp)
          const stream = new MediaStream();
          if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = stream;
          }

          setRemoteMediaStream(stream);
          // trickle ice 
          setReceivingPc(pc);
          (window as any).pcr = pc;
          pc.ontrack = (e) => {
              alert("ontrack");
          }

          pc.onicecandidate = async (e) => {
              if (!e.candidate) {
                  return;
              }
              console.log("on ice candidate on receiving side");
              if (e.candidate) {
                 socketInstance.emit("add-ice-candidate", {
                  candidate: e.candidate,
                  type: "receiver",
                  roomId
                 })
              }
          }

          socketInstance.emit("answer", {
              roomId,
              sdp: sdp
          });
          setTimeout(() => {
              const track1 = pc.getTransceivers()[0].receiver.track
              const track2 = pc.getTransceivers()[1].receiver.track
              console.log(track1);
              if (track1.kind === "video") {
                  setRemoteAudioTrack(track2)
                  setRemoteVideoTrack(track1)
              } else {
                  setRemoteAudioTrack(track1)
                  setRemoteVideoTrack(track2)
              }
              if (remoteVideoRef.current && remoteVideoRef.current.srcObject instanceof MediaStream) {
                remoteVideoRef.current.srcObject.addTrack(track1)
                remoteVideoRef.current.srcObject.addTrack(track2)
                remoteVideoRef.current.play();
              }
          }, 5000)
      });

      socketInstance.on("answer", ({roomId, sdp: remoteSdp}) => {
          setLobby(false);
          setSendingPc(pc => {
              pc?.setRemoteDescription(remoteSdp)
              return pc;
          });
          console.log("loop closed");
      });

      socketInstance.on("lobby", () => {
          setLobby(true);
      });

      socketInstance.on("add-ice-candidate", ({candidate, type}) => {
          console.log("add ice candidate from remote");
          console.log({candidate, type})
          if (type == "sender") {
              setReceivingPc(pc => {
                  if (!pc) {
                      console.error("receiving pc not found")
                  } else {
                      console.error(pc.ontrack)
                  }
                  pc?.addIceCandidate(candidate)
                  return pc;
              });
          } else {
              setSendingPc(pc => {
                  if (!pc) {
                      console.error("sending pc not found")
                  } else {
                      // console.error(pc.ontrack)
                  }
                  pc?.addIceCandidate(candidate)
                  return pc;
              });
          }
      });
      
      // Listen for crypto transactions
      socketInstance.on('crypto-received', ({ amount, signature }) => {
        setTransactions(prev => [...prev, { 
          type: 'received', 
          amount,
          signature
        }]);
      });

      setSocket(socketInstance);
      
      // Cleanup function
      return () => {
        socketInstance.disconnect();
      };
    }, [name, localAudioTrack, localVideoTrack]);

    useEffect(() => {
      if (localVideoRef.current && localVideoTrack) {
        localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
        localVideoRef.current.play().catch((error) => {
          console.error("Error playing local video:", error);
        });
      }
    }, [localVideoTrack]);

    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Head>
          <title>Video Connect | Linqo</title>
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
              <div className="px-4 py-2 flex items-center">
                <WalletMultiButton className="wallet-adapter-button-small" />
              </div>
            </div>
          </div>
        </header>

        <main className="pt-16 h-[calc(100vh-4rem)] flex flex-col">
          {lobby ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8 bg-gray-800 rounded-xl max-w-md">
                <Users className="mx-auto mb-4 text-blue-400" size={48} />
                <h2 className="text-2xl font-bold mb-2">Waiting for Connection</h2>
                <p className="text-gray-300 mb-4">Looking for someone to connect with...</p>
                <div className="animate-pulse w-12 h-1 bg-blue-500 mx-auto rounded-full"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                {/* Video Areas */}
                <div className="relative rounded-xl h-[400px] overflow-hidden bg-gray-900 border border-gray-700">
                  {/* User Video */}
                  <div className="absolute inset-0">
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-500">
                      <video
                        autoPlay
                        ref={localVideoRef}
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

                  {/* Add user name overlay */}
                  <div className="absolute bottom-14 left-4 bg-gray-900/70 px-3 py-1 rounded-lg text-sm backdrop-blur-sm">
                    {name} (You)
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

                <div className="relative rounded-xl h-[400px] overflow-hidden bg-gray-800 border border-gray-700 flex items-center justify-center">
                  {/* Stranger Video */}
                  <div className="absolute inset-0">
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-500">
                      <video
                        autoPlay
                        ref={remoteVideoRef}
                        className={`w-full h-full object-cover transform scale-x-[-1]`}
                      ></video>
                      {!remoteVideoTrack && (
                        <div className="text-center">
                          <VideoOff size={48} className="mx-auto mb-2" />
                          <p>Waiting for video...</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Add remote user name overlay */}
                  {remoteVideoTrack && (
                    <div className="absolute bottom-14 left-4 bg-gray-900/70 px-3 py-1 rounded-lg text-sm backdrop-blur-sm">
                      {remoteName}
                      {peerWalletAddress && (
                        <span className="ml-2 text-xs text-blue-300">
                          ({peerWalletAddress.substring(0, 4)}...{peerWalletAddress.substring(peerWalletAddress.length - 4)})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction Area */}
              <div className="h-64 lg:h-72 border-t border-gray-800 bg-gray-900 p-4 flex flex-col">
                {isTransactionOpen ? (
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between mb-4">
                      <h3 className="text-lg font-medium">Send SOL to {remoteName}</h3>
                      <button 
                        onClick={() => setIsTransactionOpen(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <SolanaIntegration
                      recipient={peerWalletAddress || ''}
                      onTransactionComplete={(txInfo: TransactionInfo) => {
                        if (txInfo.status === 'success') {
                          setTransactions(prev => [...prev, { 
                            type: 'sent', 
                            amount: txInfo.amount,
                            signature: txInfo.signature
                          }]);
                          
                          if (socket) {
                            socket.emit('crypto-sent', { 
                              roomId, 
                              amount: txInfo.amount,
                              signature: txInfo.signature 
                            });
                          }
                        } else {
                          setTransactions(prev => [...prev, { 
                            type: 'error', 
                            message: `Transaction failed: ${txInfo.error}`
                          }]);
                        }
                        setIsTransactionOpen(false);
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Transaction History</h3>
                      <button 
                        onClick={() => peerWalletAddress ? setIsTransactionOpen(true) : alert("Peer's wallet address not available")}
                        disabled={!peerWalletAddress}
                        className={`flex items-center space-x-2 py-2 px-4 rounded-lg ${
                          peerWalletAddress ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 cursor-not-allowed'
                        }`}
                      >
                        <Wallet size={16} />
                        <span>Send SOL</span>
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                      {transactions.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <Wallet size={40} className="mx-auto mb-3 opacity-50" />
                            <p>No transactions yet</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {transactions.map((tx, index) => (
                            <div key={index} className={`p-3 rounded-lg border ${
                              tx.type === 'sent' 
                                ? 'border-blue-500/30 bg-blue-500/10' 
                                : tx.type === 'received'
                                  ? 'border-green-500/30 bg-green-500/10'
                                  : 'border-red-500/30 bg-red-500/10'
                            }`}>
                              {tx.type === 'sent' && (
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">Sent {tx.amount} SOL</p>
                                    <p className="text-sm text-gray-400">To: {remoteName}</p>
                                  </div>
                                  {tx.signature && (
                                    <a 
                                      href={`https://explorer.solana.com/tx/${tx.signature}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-400 hover:underline"
                                    >
                                      View Transaction
                                    </a>
                                  )}
                                </div>
                              )}
                              {tx.type === 'received' && (
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">Received {tx.amount} SOL</p>
                                    <p className="text-sm text-gray-400">From: {remoteName}</p>
                                  </div>
                                  {tx.signature && (
                                    <a 
                                      href={`https://explorer.solana.com/tx/${tx.signature}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-400 hover:underline"
                                    >
                                      View Transaction
                                    </a>
                                  )}
                                </div>
                              )}
                              {tx.type === 'error' && (
                                <div>
                                  <p className="font-medium text-red-400">Transaction Failed</p>
                                  <p className="text-sm">{tx.message}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    )
};