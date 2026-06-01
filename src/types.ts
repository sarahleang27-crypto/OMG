export interface Message {
  id: string;
  sender: "user" | "ben";
  text: string;
  timestamp: string;
}

export interface VoiceStatus {
  isListening: boolean;
  isSpeaking: boolean;
  supported: boolean;
  language: "en-US" | "fr-FR";
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  status: "success" | "info" | "warning";
}
