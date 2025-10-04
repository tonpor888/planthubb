'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../providers/AuthProvider';
import { 
  createChatRoom, 
  sendMessage, 
  getChatMessages, 
  subscribeToChatMessages,
  markMessagesAsRead,
  closeChatRoom,
  type ChatMessage,
  type ChatRoom 
} from '../../services/firebase/chat.service';
import { MessageCircle, X, Send, Package, User, MapPin, CreditCard } from 'lucide-react';

interface OrderSummary {
  id: string;
  status: string;
  status_th: string;
  paymentMethod: string;
  paymentMethod_th: string;
  total: number;
  updatedAt: Date | null;
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  sellerId: string;
}

interface SellerChatWindowProps {
  order: OrderSummary | null;
  onClose: () => void;
}

export default function SellerChatWindow({ order, onClose }: SellerChatWindowProps) {
  const { firebaseUser, profile } = useAuthContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isChatEnded, setIsChatEnded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (order && firebaseUser && profile) {
      initializeChat();
    }
    
    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [order, firebaseUser, profile]);

  const initializeChat = async () => {
    if (!firebaseUser || !profile || !order) return;
    
    setIsLoading(true);
    try {
      // ไม่สร้างห้องแชททันที ให้รอจนกว่าจะส่งข้อความจริง
      setChatRoomId(null);
      setMessages([]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing chat:', error);
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !firebaseUser || !profile || !order || isSending) return;
    
    setIsSending(true);
    try {
      let chatId = chatRoomId;
      
      // ถ้ายังไม่มีห้องแชท ให้สร้างใหม่
      if (!chatId) {
        chatId = await createChatRoom(
          'seller_support',
          firebaseUser.uid,
          `${profile.firstName} ${profile.lastName}`.trim(),
          order.sellerId || '', // sellerId จากออเดอร์
          '', // sellerName - จะหาได้จากข้อมูลร้านค้า
          order.id // orderId
        );
        setChatRoomId(chatId);
        
        // ตั้งค่า real-time listener หลังจากสร้างห้องแชท
        const unsubscribe = subscribeToChatMessages(chatId, (newMessages) => {
          setMessages(newMessages);
          // mark messages as read
          markMessagesAsRead(chatId!, firebaseUser.uid);
          
          // ตรวจสอบว่ามีข้อความระบบแจ้งจบสนทนาหรือไม่
          const hasSystemEndMessage = newMessages.some(msg => 
            msg.senderRole === 'system' && msg.messageType === 'system_notification'
          );
          if (hasSystemEndMessage) {
            setIsChatEnded(true);
          }
        });
        
        // เก็บ unsubscribe function
        unsubscribeRef.current = unsubscribe;
      }
      
      await sendMessage(
        chatId,
        firebaseUser.uid,
        `${profile.firstName} ${profile.lastName}`.trim(),
        'customer',
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
    if (chatRoomId && firebaseUser && profile) {
      await closeChatRoom(
        chatRoomId, 
        firebaseUser.uid, 
        `${profile.firstName} ${profile.lastName}`.trim()
      );
      setIsChatEnded(true);
    }
    onClose();
  };

  const handleEndChat = async () => {
    if (chatRoomId && firebaseUser && profile && confirm('คุณแน่ใจหรือไม่ที่จะจบการสนทนา?')) {
      await closeChatRoom(
        chatRoomId, 
        firebaseUser.uid, 
        `${profile.firstName} ${profile.lastName}`.trim()
      );
      setIsChatEnded(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!order) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-96 h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">ติดต่อร้านค้า</h3>
                <p className="text-sm text-white/80">ออเดอร์ #{order.id.slice(-8).toUpperCase()}</p>
              </div>
            </div>
            <button
              onClick={handleCloseChat}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Order Details */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="font-medium">สินค้า:</span>
              <span className="text-gray-600">{order.items?.length || 0} รายการ</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <span className="font-medium">ยอดรวม:</span>
              <span className="text-gray-600">฿{order.total.toLocaleString('th-TH')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">สถานะ:</span>
              <span className="text-gray-600">{order.status_th}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : !chatRoomId ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>เริ่มต้นการสนทนากับร้านค้า</p>
              <p className="text-sm text-gray-400 mt-2">พิมพ์ข้อความเพื่อเริ่มต้นการสนทนา</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>เริ่มต้นการสนทนากับร้านค้า</p>
            </div>
          ) : (
            messages.map((message) => {
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
                  className={`flex ${message.senderRole === 'customer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.senderRole === 'customer'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {message.senderRole === 'customer' ? 'คุณ' : 'ร้านค้า'}
                    </div>
                    <div className="text-sm">{message.message}</div>
                    <div className={`text-xs mt-1 ${
                      message.senderRole === 'customer' ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString('th-TH', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          {isChatEnded ? (
            <div className="text-center text-gray-500 py-4">
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-sm">การสนทนาได้จบลงแล้ว</p>
                <p className="text-xs text-gray-400 mt-1">ไม่สามารถส่งข้อความเพิ่มเติมได้</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="พิมพ์ข้อความ..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="bg-blue-500 text-white p-2 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleEndChat}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                  จบสนทนา
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
