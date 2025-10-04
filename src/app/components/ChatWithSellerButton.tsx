'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatWithSeller from './ChatWithSeller';

interface ChatWithSellerButtonProps {
  sellerId: string;
  sellerName: string;
  orderId?: string;
}

export default function ChatWithSellerButton({ 
  sellerId, 
  sellerName, 
  orderId 
}: ChatWithSellerButtonProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsChatOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
      >
        <MessageCircle className="w-4 h-4" />
        ติดต่อร้านค้า
      </button>

      <ChatWithSeller 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        sellerId={sellerId}
        sellerName={sellerName}
        orderId={orderId}
      />
    </>
  );
}
