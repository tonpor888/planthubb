/**
 * Global chat trigger hook
 * Allows any component to open the floating chat with specific context
 */

type ChatTriggerPayload = {
  sellerId: string;
  sellerName: string;
  orderId?: string;
};

// Global event emitter for chat triggers
class ChatTriggerEmitter {
  private listeners: Array<(payload: ChatTriggerPayload) => void> = [];

  subscribe(callback: (payload: ChatTriggerPayload) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  trigger(payload: ChatTriggerPayload) {
    this.listeners.forEach(cb => cb(payload));
  }
}

export const chatTrigger = new ChatTriggerEmitter();

export function useChatTrigger() {
  return {
    openChatWithSeller: (sellerId: string, sellerName: string, orderId?: string) => {
      chatTrigger.trigger({ sellerId, sellerName, orderId });
    }
  };
}
