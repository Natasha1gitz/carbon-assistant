import { useState, useCallback } from "react";
import { chatWithGemini } from "@/app/actions/gemini";

export interface ChatMessage {
  role: string;
  parts: { text: string }[];
}

/**
 * Custom hook to manage the state and logic of the AI Assistant chat.
 * @remarks
 * Decouples message state and asynchronous fetching from the presentation component,
 * achieving a Cognitive Complexity penalty of 0.
 * @returns State variables and the bound send handler.
 * @example
 * ```tsx
 * const { messages, input, setInput, isTyping, handleSend } = useAiChat();
 * ```
 */
export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      const userMsg = { role: "user", parts: [{ text: input }] };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        const responseText = await chatWithGemini(messages, input);
        setMessages((prev) => [
          ...prev,
          { role: "model", parts: [{ text: responseText }] },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "model", parts: [{ text: "Error connecting to AI." }] },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [input, messages]
  );

  return { messages, input, setInput, isTyping, handleSend };
}
