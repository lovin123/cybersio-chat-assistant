import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { ScrollArea } from "./ui/ScrollArea";
import { Switch } from "./ui/Switch";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "./ui/Toast";
import { useToast } from "./ui/useToast";
import {
  ChatBubbleIcon,
  SunIcon,
  MoonIcon,
  PersonIcon,
  ExclamationTriangleIcon,
  UpdateIcon,
  PaperPlaneIcon,
} from "@radix-ui/react-icons";
import { cn } from "../utils/cn";

const ChatAssistant = () => {
  const { theme, toggleTheme } = useTheme();
  const { toast, toasts, dismiss } = useToast();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm CyberSIO Assistant, your intelligent help agent for the CyberSIO Platform. What would you like to know?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || "http://localhost:3001";
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);
    setError(null);

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from server");
      }

      const data = await response.json();

      if (data.success && data.response) {
        const assistantMessage = {
          id: Date.now() + 1,
          text: data.response,
          sender: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      const errorMessage =
        "Failed to send message. Please check your connection and try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ToastProvider>
      <div className="flex flex-col h-screen max-w-5xl mx-auto bg-background border-x border-border shadow-xl">
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-6 py-4 shadow-md flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <ChatBubbleIcon className="w-5 h-5" />
              CyberSIO Assistant
            </h1>
            <p className="text-sm text-primary-foreground/80 mt-1">
              Your intelligent help agent for tbSIEM & tbUEBA
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <SunIcon className="w-4 h-4" />
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                aria-label="Toggle theme"
              />
              <MoonIcon className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-3 shadow-sm",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-card-foreground border border-border"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {message.sender === "assistant" && (
                      <div className="w-5 h-5 mt-0.5 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
                        <ChatBubbleIcon className="w-3 h-3 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {message.text}
                      </p>
                      <span
                        className={cn(
                          "text-xs mt-2 block",
                          message.sender === "user"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    {message.sender === "user" && (
                      <PersonIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-card text-card-foreground border border-border rounded-lg px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1.5">
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-destructive text-sm">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {error}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border px-6 py-4 bg-card/50 backdrop-blur-sm">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !inputMessage.trim()}
              size="default"
              className="gap-2"
            >
              {loading ? (
                <>
                  <UpdateIcon className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <PaperPlaneIcon className="w-4 h-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastViewport />
      {toasts.map((toastItem) => (
        <Toast
          key={toastItem.id}
          open={toastItem.open}
          onOpenChange={(open) => !open && dismiss(toastItem.id)}
          variant={toastItem.variant || "default"}
        >
          <div className="flex-1">
            <ToastTitle>{toastItem.title}</ToastTitle>
            {toastItem.description && (
              <ToastDescription>{toastItem.description}</ToastDescription>
            )}
          </div>
          <ToastClose />
        </Toast>
      ))}
    </ToastProvider>
  );
};

export default ChatAssistant;
