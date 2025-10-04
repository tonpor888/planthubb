'use client';

import { MessageCircle } from 'lucide-react';

interface FloatingChatButtonProps {
  onClick?: () => void;
}

export default function FloatingChatButton({ onClick }: FloatingChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-28 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-2xl shadow-blue-500/40 transition-all duration-300 hover:scale-110 hover:shadow-blue-500/60"
      aria-label="Chat Support"
    >
      <MessageCircle className="h-7 w-7" />
    </button>
  );
}
