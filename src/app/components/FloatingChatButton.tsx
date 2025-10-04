'use client';

import { MessageCircle } from 'lucide-react';

interface FloatingChatButtonProps {
  onClick?: () => void;
}

export default function FloatingChatButton({ onClick }: FloatingChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 z-40 bg-gradient-to-r from-emerald-500 to-lime-400 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
