'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../../providers/AuthProvider';
import { 
  getUserChatRooms,
  getChatMessages,
  sendMessage,
  subscribeToChatMessages,
  subscribeToChatRooms,
  markMessagesAsRead,
  closeChatRoom,
  type ChatMessage,
  type ChatRoom 
} from '../../../services/firebase/chat.service';
import { MessageCircle, Send, X, CheckCircle, Clock, AlertCircle, Store, Package } from 'lucide-react';

export default function SellerChatPage() {
  const { firebaseUser, profile } = useAuthContext();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'closed' | 'pending'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (firebaseUser && (profile?.role === 'seller' || profile?.role === 'admin')) {
      // ไม่เรียก loadChatRooms() เพราะมี real-time listener แล้ว
      
      // เพิ่ม real-time listener สำหรับ chat rooms
      const unsubscribeRooms = subscribeToChatRooms(firebaseUser.uid, profile?.role === 'admin' ? 'admin' : 'seller', (newChatRooms) => {
        setChatRooms(newChatRooms);
        setIsLoading(false); // หยุดการหมุนเมื่อได้ข้อมูลแล้ว
      });
      
      return () => {
        unsubscribeRooms();
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      };
    }
  }, [firebaseUser, profile]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id!);
      
      // เพิ่ม real-time listener สำหรับข้อความใหม่
      const unsubscribe = subscribeToChatMessages(selectedChat.id!, (newMessages) => {
        setMessages(newMessages);
        // mark messages as read
        if (firebaseUser) {
          markMessagesAsRead(selectedChat.id!, firebaseUser.uid);
        }
      });
      
      // เก็บ unsubscribe function
      unsubscribeRef.current = unsubscribe;
      
      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      };
    }
  }, [selectedChat, firebaseUser]);


  const loadMessages = async (chatId: string) => {
    try {
      const msgs = await getChatMessages(chatId);
      setMessages(msgs);
      
      // Mark messages as read
      if (firebaseUser) {
        await markMessagesAsRead(chatId, firebaseUser.uid);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !firebaseUser || !profile || isSending) return;
    
    setIsSending(true);
    try {
      await sendMessage(
        selectedChat.id!,
        firebaseUser.uid,
        `${profile.firstName} ${profile.lastName}`.trim(),
        'seller',
        newMessage.trim()
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseChat = async () => {
    if (selectedChat && firebaseUser && profile) {
      await closeChatRoom(
        selectedChat.id!, 
        firebaseUser.uid, 
        `${profile.firstName} ${profile.lastName}`.trim()
      );
      // ไม่ต้องเรียก loadChatRooms() เพราะ real-time listener จะอัปเดตให้เอง
      setSelectedChat(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <X className="w-4 h-4 text-gray-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'กำลังดำเนินการ';
      case 'closed':
        return 'จบการสนทนา';
      case 'pending':
        return 'รอการตอบกลับ';
      default:
        return 'ไม่ทราบสถานะ';
    }
  };

  const filteredChatRooms = chatRooms.filter(room => {
    if (filter === 'all') return true;
    return room.status === filter;
  });

  if (profile?.role !== 'seller' && profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-gray-600">หน้านี้สำหรับร้านค้าและผู้ดูแลระบบเท่านั้น</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex h-[600px]">
            {/* Chat Rooms List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Store className="w-6 h-6 text-blue-500" />
                  <h2 className="text-xl font-semibold text-gray-900">แชทร้านค้า</h2>
                </div>
                
                {/* Filter Buttons */}
                <div className="flex gap-2 mb-4">
                  {[
                    { key: 'all', label: 'ทั้งหมด' },
                    { key: 'active', label: 'กำลังดำเนินการ' },
                    { key: 'pending', label: 'รอตอบกลับ' },
                    { key: 'closed', label: 'จบแล้ว' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key as any)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        filter === key
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Rooms */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : filteredChatRooms.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>ไม่มีแชทในหมวดนี้</p>
                  </div>
                ) : (
                  filteredChatRooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => setSelectedChat(room)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedChat?.id === room.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {room.customerName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            ออเดอร์: {room.orderId || 'ไม่ระบุ'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {room.chatType === 'seller_support' ? 'แชทร้านค้า' : 'แชทสนับสนุน'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(room.status)}
                          {room.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {room.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="truncate flex-1 mr-2">
                          {room.lastMessage || 'ยังไม่มีข้อความ'}
                        </span>
                        <span>
                          {room.lastMessageTime?.toLocaleDateString('th-TH')}
                        </span>
                      </div>
                      
                      <div className="mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          room.status === 'active' ? 'bg-green-100 text-green-700' :
                          room.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {getStatusIcon(room.status)}
                          {getStatusText(room.status)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedChat.customerName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ออเดอร์: {selectedChat.orderId || 'ไม่ระบุ'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                          selectedChat.status === 'active' ? 'bg-green-100 text-green-700' :
                          selectedChat.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {getStatusIcon(selectedChat.status)}
                          {getStatusText(selectedChat.status)}
                        </span>
                        {selectedChat.status === 'active' && (
                          <button
                            onClick={handleCloseChat}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                          >
                            จบการสนทนา
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-4 border-b border-gray-200 bg-blue-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">รายละเอียดออเดอร์</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">เลขออเดอร์:</span>
                        <span className="ml-2 font-medium">#{selectedChat.orderId?.slice(-8).toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">ลูกค้า:</span>
                        <span className="ml-2 font-medium">{selectedChat.customerName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">ประเภทแชท:</span>
                        <span className="ml-2 font-medium">
                          {selectedChat.chatType === 'seller_support' ? 'แชทร้านค้า' : 'แชทสนับสนุน'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">สถานะ:</span>
                        <span className="ml-2 font-medium">{getStatusText(selectedChat.status)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((message) => {
                      // ข้อความระบบ
                      if (message.senderRole === 'system') {
                        return (
                          <div key={message.id} className="flex justify-center">
                            <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm">
                              {message.message}
                            </div>
                          </div>
                        );
                      }

                      // ข้อความปกติ
                      return (
                        <div
                          key={message.id}
                          className={`flex ${message.senderRole === 'seller' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                              message.senderRole === 'seller'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <div className="text-sm font-medium mb-1">
                              {message.senderRole === 'seller' ? 'คุณ' : 'ลูกค้า'}
                            </div>
                            <div className="text-sm">{message.message}</div>
                            <div className={`text-xs mt-1 ${
                              message.senderRole === 'seller' ? 'text-white/70' : 'text-gray-500'
                            }`}>
                              {message.timestamp.toLocaleTimeString('th-TH', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="พิมพ์ข้อความ..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSending || selectedChat.status === 'closed'}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSending || selectedChat.status === 'closed'}
                        className="bg-blue-500 text-white p-2 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">เลือกการสนทนา</h3>
                    <p>เลือกการสนทนาจากรายการด้านซ้ายเพื่อเริ่มต้นการตอบกลับ</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
