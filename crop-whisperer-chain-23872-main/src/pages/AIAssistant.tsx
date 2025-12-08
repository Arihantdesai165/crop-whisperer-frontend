import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

import {
  MessageSquare,
  Send,
  Loader2,
  Mic,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceOutput, setVoiceOutput] = useState(true); // Voice ON by default

  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // ----------------------------------------------------
  // 🎤 START RECORDING
  // ----------------------------------------------------
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" }); // FIXED
        sendVoiceToAI(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      toast({
        title: "Microphone Error",
        description: "Cannot access microphone.",
        variant: "destructive",
      });
    }
  };

  // ----------------------------------------------------
  // 🛑 STOP RECORDING
  // ----------------------------------------------------
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // ----------------------------------------------------
  // 🎙 SEND AUDIO → BACKEND
  // ----------------------------------------------------
  const sendVoiceToAI = async (audioBlob: Blob) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("lang", language);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/voice-assistant`, {

        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        toast({
          title: "Error",
          description: "Voice processing failed.",
          variant: "destructive",
        });
        return;
      }

      // Add user transcription to chat
      setMessages((prev) => [
        ...prev,
        { role: "user", content: data.transcription },
      ]);

      sendToAI(data.transcription);
    } catch (err) {
      toast({
        title: "Error",
        description: "Voice processing failed.",
        variant: "destructive",
      });
    }
  };

  // ----------------------------------------------------
  // 🤖 SEND TEXT TO AI
  // ----------------------------------------------------
  const sendToAI = async (text: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/voice-assistant`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, lang: language }),
      });

      const data = await response.json();
      const reply = data.reply || "No response.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      // 🔊 Speak reply if voiceOutput = true
      if (voiceOutput) {
        const utterance = new SpeechSynthesisUtterance(reply);

        if (language === "kn") utterance.lang = "kn-IN";
        else if (language === "hi") utterance.lang = "hi-IN";
        else utterance.lang = "en-US";

        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // 💬 TEXT MANUAL SEND
  // ----------------------------------------------------
  const handleSend = () => {
    if (!input.trim()) return;

    const text = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsLoading(true);
    sendToAI(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto pt-4">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-bold">AI Farm Assistant</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* 🌍 Language selector */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="kn">Kannada</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
              </SelectContent>
            </Select>

            {/* 🔊 Voice Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setVoiceOutput(!voiceOutput);
                speechSynthesis.cancel();
              }}
            >
              {voiceOutput ? (
                <Volume2 className="w-5 h-5 text-green-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-red-600" />
              )}
            </Button>
          </div>
        </div>

        {/* CHAT WINDOW */}
        <Card className="p-6 mb-4 min-h-[480px] flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="w-16 h-16 mx-auto mb-3 opacity-40" />
                <p className="text-lg">Ask me anything about farming!</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* INPUT AREA */}
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your farming question..."
              className="resize-none"
              rows={2}
            />

            {/* 🎤 MIC button */}
            {!isRecording ? (
              <Button size="icon" onClick={startRecording}>
                <Mic className="w-5 h-5" />
              </Button>
            ) : (
              <Button size="icon" variant="destructive" onClick={stopRecording}>
                <Square className="w-5 h-5" />
              </Button>
            )}

            {/* SEND button */}
            <Button onClick={handleSend} size="icon" disabled={isLoading}>
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIAssistant;
