'use client';

import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useAuthContext } from '../providers/AuthProvider';
import ChatPanel from './ChatPanel';
import { chatTrigger } from '../hooks/useChatTrigger';

interface FloatingChatButtonProps {
  onClick?: () => void;
  unreadCount?: number;
  onUnreadUpdate?: (count: number) => void;
}

export default function FloatingChatButton({ onClick, unreadCount = 0, onUnreadUpdate }: FloatingChatButtonProps) {
  const { profile } = useAuthContext();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  useEffect(() => {
    setTotalUnreadCount(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    const unsubscribe = chatTrigger.subscribe((payload) => {
      console.log('🎯 FloatingChatButton received chat trigger:', payload);
      setIsChatOpen(true);
    });

    return unsubscribe;
  }, [profile]);

  // Only show for authenticated users (customers, sellers, admins)
  if (!profile) {
    return null;
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsChatOpen(true);
    }
  };

  const handleUnreadCountChange = (count: number) => {
    setTotalUnreadCount(count);
    onUnreadUpdate?.(count);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };
  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-8 right-28 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-2xl shadow-blue-500/40 transition-all duration-300 hover:scale-110 hover:shadow-blue-500/60"
        aria-label="Chat Support"
      >
        <MessageCircle className="h-7 w-7" />
        {totalUnreadCount > 0 && (
          <span className="absolute -right-1 -top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white shadow-lg">
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </span>
        )}
      </button>
      
      <ChatPanel 
        isOpen={isChatOpen} 
        onClose={handleCloseChat}
        onUnreadCountChange={handleUnreadCountChange}
      />
    </>
  );
}
