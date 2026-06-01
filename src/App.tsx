import React, { useState, useEffect, useRef, useTransition } from "react";
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award, 
  ChevronRight, 
  Languages, 
  Sparkles, 
  Terminal, 
  Copy, 
  Check, 
  Info, 
  Sliders, 
  Activity, 
  Cpu,
  CornerDownLeft,
  X,
  FileCheck2
} from "lucide-react";
import { sarahLeangCV } from "./data/sarahCV";
import VoiceVisualizer from "./components/VoiceVisualizer";
import { Message, VoiceStatus, ActivityLog } from "./types";

export default function App() {
  // Primary language Toggle (controls default prompt templates and system UI language)
  const [lang, setLang] = useState<"fr" | "en">("fr");
  
  // Conversation state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-msg",
      sender: "ben",
      text: "I AM SARAH'S ASSISTANT, HOW CAN HELP YOU?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Tabs for interactive CV explorer on the side
  const [activeTab, setActiveTab] = useState<"experiences" | "skills" | "education" | "contact">("experiences");

  // Speech Recognition state
  const [recognition, setRecognition] = useState<any>(null);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>({
    isListening: false,
    isSpeaking: false,
    supported: false,
    language: "en-US"
  });

  // Sound and Vocal Settings
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [speechVolume, setSpeechVolume] = useState<number>(0.9);

  // System status and activity logs
  const [systemUptime, setSystemUptime] = useState<string>("00:00:00");
  const [systemPing, setSystemPing] = useState<number>(12);
  const [logs, setLogs] = useState<ActivityLog[]>([
    { id: "log-1", action: "BEN Core Initialized", timestamp: "14:02:25", status: "success" },
    { id: "log-2", action: "Vocal Synthesizer Standard Ready", timestamp: "14:02:26", status: "info" }
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Ref pointers
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const startUptimeRef = useRef<number>(Date.now());

  // Copy status variables
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Initialize Web Speech APIs & System Counters
  useEffect(() => {
    // Holographic Uptime Tick
    const interval = setInterval(() => {
      const elapsedMs = Date.now() - startUptimeRef.current;
      const hours = Math.floor(elapsedMs / 3600000).toString().padStart(2, "0");
      const minutes = Math.floor((elapsedMs % 3600000) / 60000).toString().padStart(2, "0");
      const seconds = Math.floor((elapsedMs % 60000) / 1000).toString().padStart(2, "0");
      setSystemUptime(`${hours}:${minutes}:${seconds}`);
      
      // Dynamic simulated ping
      setSystemPing(prev => Math.max(8, Math.min(64, prev + (Math.random() > 0.5 ? 4 : -4))));
    }, 1000);

    // Setup speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = false;
      recognizer.lang = lang === "fr" ? "fr-FR" : "en-US";

      recognizer.onstart = () => {
        setVoiceStatus(prev => ({ ...prev, isListening: true }));
        addLog("Neural mic pipeline established", "info");
      };

      recognizer.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          addLog(`Voice frames decoded: "${transcript.substring(0, 20)}..."`, "success");
          // Instant submit
          submitMessage(transcript);
        }
      };

      recognizer.onerror = (event: any) => {
        console.error("Speech Recognition Error", event);
        setVoiceStatus(prev => ({ ...prev, isListening: false }));
        addLog(`Mic exception captured: ${event.error}`, "warning");
      };

      recognizer.onend = () => {
        setVoiceStatus(prev => ({ ...prev, isListening: false }));
      };

      setRecognition(recognizer);
      setVoiceStatus(prev => ({ ...prev, supported: true }));
    } else {
      addLog("Mic standard not loaded (unsupported browser)", "warning");
    }

    return () => {
      clearInterval(interval);
    };
  }, [lang]);

  // Adjust Recognition language when toggle occurs
  useEffect(() => {
    if (recognition) {
      recognition.lang = lang === "fr" ? "fr-FR" : "en-US";
    }
  }, [lang, recognition]);

  // Scroll to bottom helper
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiThinking]);

  // Add a cyber log item
  const addLog = (action: string, status: "success" | "info" | "warning") => {
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs(prev => [
      { id: Date.now().toString(), action, timestamp: timeStr, status },
      ...prev.slice(0, 14)
    ]);
  };

  // Push custom toast notification helper
  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Standard Voice synthesis announcer
  const announceSpeechOutput = (text: string) => {
    if (isMuted) return;
    
    // Drop any current speech
    window.speechSynthesis.cancel();

    // Remove markdown symbols from output text for better pronounciation
    const cleanText = text
      .replace(/[*#_\[\]\(\)]/g, " ")
      .replace(/\[SYS\..*?\]/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Choose voice depending on context
    const voices = window.speechSynthesis.getVoices();
    let suitableVoice = null;
    
    if (lang === "fr") {
      suitableVoice = voices.find(v => v.lang.startsWith("fr")) || null;
      utterance.lang = "fr-FR";
    } else {
      suitableVoice = voices.find(v => v.lang.startsWith("en")) || null;
      utterance.lang = "en-US";
    }

    if (suitableVoice) {
      utterance.voice = suitableVoice;
    }

    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.volume = speechVolume;

    utterance.onstart = () => {
      setVoiceStatus(prev => ({ ...prev, isSpeaking: true }));
    };

    utterance.onend = () => {
      setVoiceStatus(prev => ({ ...prev, isSpeaking: false }));
    };

    utterance.onerror = (e) => {
      console.error("Synthesizer error", e);
      setVoiceStatus(prev => ({ ...prev, isSpeaking: false }));
    };

    window.speechSynthesis.speak(utterance);
  };

  // Handle manual input text submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    submitMessage(inputText);
  };

  // Heart of conversation request handler
  const submitMessage = async (textToSend: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsAiThinking(true);
    addLog(`Transmitting feed frame to AI core`, "info");

    try {
      // Build a rolling text history to feed the model context on server route
      const cleanHistory = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: cleanHistory
        })
      });

      if (!res.ok) {
        throw new Error("Neural link unstable back-off");
      }

      const data = await res.json();
      const botReply = data.reply;

      const benMsg: Message = {
        id: `ben-${Date.now()}`,
        sender: "ben",
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages(prev => [...prev, benMsg]);
      addLog("Synthetic thought compiled", "success");
      
      // Auto Vocalize reply
      announceSpeechOutput(botReply);

    } catch (err: any) {
      console.error(err);
      addLog(`Query timeout or API key missing`, "warning");
      
      const errorResponse = lang === "fr" 
        ? "Erreur de connexion. Veuillez vérifier que votre clé GEMINI_API_KEY est bien configurée dans le panneau de Secrets d'AI Studio."
        : "Connection error. Please confirm that your GEMINI_API_KEY is properly set in the Secrets configuration panel within AI Studio.";

      const errMessage: Message = {
        id: `ben-err-${Date.now()}`,
        sender: "ben",
        text: `[SYSTEM.ALERT] ${errorResponse}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, errMessage]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Vocal micro initiation
  const startListeningVoice = () => {
    if (!recognition) {
      showToast("Web Speech Recognition unavailable in this browser environment.");
      return;
    }
    
    // Stop speaking if currently active
    if (voiceStatus.isSpeaking) {
      window.speechSynthesis.cancel();
      setVoiceStatus(prev => ({ ...prev, isSpeaking: false }));
    }

    if (voiceStatus.isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.error(err);
        recognition.stop();
      }
    }
  };

  // Helper trigger to send templated questions instantly
  const sendTemplatePrompt = (promptText: string) => {
    submitMessage(promptText);
  };

  // Copy information helpers
  const handleCopyEmail = () => {
    navigator.clipboard.writeText(sarahLeangCV.email);
    setCopiedEmail(true);
    showToast("Email address copied to terminal register.");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(sarahLeangCV.phone);
    setCopiedPhone(true);
    showToast("Phone sequence copied to terminal register.");
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Prompt templates translations to make clicking them simple
  const questionsTemplates = {
    fr: [
      { text: "Qui es-tu, BEN ?", display: "Découvrir l'assistant BEN" },
      { text: "Quelles sont les expériences avec Groupama ?", display: "Audit Groupama" },
      { text: "Détails sur son Master Marketing", display: "Formations / Master" },
      { text: "Quels outils de design/datavisualisation utilise-t-elle ?", display: "Outils techniques" },
      { text: "Est-elle bénévole ?", display: "Activités associatives" },
    ],
    en: [
      { text: "Who are you, BEN?", display: "Discover BEN Assistant" },
      { text: "Tell me about her Marketing role at Groupama.", display: "Groupama Work Audit" },
      { text: "What is her educational background?", display: "Degree & Master" },
      { text: "Which language skills does she have?", display: "Languages Mastered" },
      { text: "How can I contact Sarah?", display: "Contact Information" }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none selection:bg-cyan-500/30 selection:text-cyan-300 overflow-x-hidden relative">
      
      {/* HUD Glowing scanlines / cyber ambient grids */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.1)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-500/20 shadow-[0_2px_15px_rgba(6,182,212,0.4)] animate-pulse pointer-events-none" />

      {/* Futuristic Banner Status Top */}
      <header className="border-b border-cyan-500/15 bg-slate-950/90 backdrop-blur z-20 px-4 py-3 sticky top-0 shadow-lg" id="app-header">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          
          <div className="flex items-center gap-3">
            {/* Glowing neural reactor ring */}
            <div className="relative flex items-center justify-center">
              <span className="absolute inline-flex h-10 w-10 rounded-full bg-cyan-500/10 animate-ping opacity-60" />
              <div className="h-9 w-9 bg-slate-900 border border-cyan-400 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Cpu className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-sm tracking-wider uppercase text-cyan-400 font-bold">
                  BEN Core Terminal
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 font-mono">
                  SARAH_AI_v3.5
                </span>
                <span className="hidden md:inline w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-400 tracking-wide">
                Interactive Multi-Agent Assistant representing <span className="text-cyan-300 underline underline-offset-2">Sarah Leang</span>
              </p>
            </div>
          </div>

          {/* Core System Telemetry */}
          <div className="flex items-center flex-wrap justify-center gap-4 text-xs font-mono">
            
            <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
              <Activity className="w-3.5 h-3.5 text-cyan-500/60" />
              <span>UPTIME:</span>
              <span className="text-cyan-400 font-bold">{systemUptime}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>PING:</span>
              <span className="text-cyan-400">{systemPing}ms</span>
            </div>

            {/* Quick Language Toggle with interactive state */}
            <div className="flex items-center bg-slate-900/95 border border-cyan-500/20 rounded-lg overflow-hidden p-0.5">
              <button 
                type="button"
                onClick={() => setLang("fr")}
                className={`flex items-center gap-1 px-3 py-1 text-xs rounded transition-all font-semibold ${lang === "fr" ? "bg-cyan-500/15 border border-cyan-500/45 text-cyan-300 font-bold shadow-[0_0_8px_rgba(6,182,212,0.2)]" : "text-slate-400 hover:text-slate-200"}`}
                id="btn-lang-fr"
              >
                <span className="text-[10px]">FR</span>
                <span>Français</span>
              </button>
              <button 
                type="button"
                onClick={() => setLang("en")}
                className={`flex items-center gap-1 px-3 py-1 text-xs rounded transition-all font-semibold ${lang === "en" ? "bg-cyan-500/15 border border-cyan-500/45 text-cyan-300 font-bold shadow-[0_0_8px_rgba(6,182,212,0.2)]" : "text-slate-400 hover:text-slate-200"}`}
                id="btn-lang-en"
              >
                <span className="text-[10px]">EN</span>
                <span>English</span>
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Toast notifications handler */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900/95 border border-cyan-500/60 text-cyan-200 px-4 py-2.5 rounded-lg shadow-2xl backdrop-blur flex items-center gap-2 font-mono text-xs animate-slide-in">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} className="ml-2 hover:text-white" id="toast-close">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid Interface */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch h-full relative z-10" id="main-dashboard">
        
        {/* LEFT COLUMN: Controls & System Audio Reactor (4 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-4 h-full" id="left-column">
          
          {/* Quick dossier card about Sarah with futuristic photo and subtitle */}
          <div className="bg-slate-900/75 border border-cyan-500/10 rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden" id="card-bio-sum">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex gap-4 items-center">
              {/* Profile Image with futuristic border frames */}
              <div className="relative">
                <div className="absolute inset-0 rounded-lg border border-cyan-400 animate-pulse" />
                <div className="relative h-16 w-16 bg-slate-950 rounded-lg border border-cyan-500/30 overflow-hidden flex items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200" 
                    alt="Sarah Leang Preview" 
                    className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-300"
                  />
                  {/* Holographic matrix lines overlay on image */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.15)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none" />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-100 tracking-wide font-sans m-0">
                  Sarah Leang
                </h2>
                <p className="text-xs text-cyan-400 font-mono uppercase tracking-widest mt-0.5">
                  MARKETING EXPERT
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-mono uppercase">
                    Bilingual Operator Active
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-300">
              {lang === "fr" ? sarahLeangCV.summary : sarahLeangCV.summary_en}
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-slate-800 pt-3">
              <div className="text-slate-400">
                <span className="text-cyan-500/70">► </span>
                LANGS: <span className="text-slate-200">FR, EN, CN</span>
              </div>
              <div className="text-slate-400">
                <span className="text-cyan-500/70">► </span>
                LOCATION: <span className="text-slate-200">Paris, FR</span>
              </div>
            </div>
          </div>

          {/* Main Visualizer Audio core */}
          <div className="bg-slate-900/75 border border-cyan-500/10 rounded-xl p-4 flex flex-col gap-3 relative" id="card-voice-visualizer">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-mono text-xs text-cyan-400 font-bold flex items-center gap-1.5 uppercase">
                <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                Vocal Interface Matrix
              </span>
              <div className="flex gap-1.5 text-[10px] font-mono text-slate-400">
                <span>SYSTEM: ON</span>
              </div>
            </div>

            {/* Canvas voice visualizer */}
            <VoiceVisualizer 
              status={
                voiceStatus.isListening 
                  ? "listening" 
                  : voiceStatus.isSpeaking 
                  ? "speaking" 
                  : isAiThinking 
                  ? "thinking" 
                  : "idle"
              } 
            />

            {/* Vocal control interface indicators */}
            <div className="flex items-center justify-between gap-2 mt-1">
              <button
                type="button"
                onClick={startListeningVoice}
                className={`flex-1 py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase transition-all duration-300 flex items-center justify-center gap-2 ${voiceStatus.isListening ? "bg-red-950/80 hover:bg-red-900/90 text-red-200 border border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.35)] animate-pulse" : "bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-200 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]"}`}
                id="btn-voice-toggle"
                title={voiceStatus.isListening ? "Stop voice analysis" : "Start voice input decoding"}
              >
                {voiceStatus.isListening ? (
                  <>
                    <Mic className="w-4 h-4 text-red-400 animate-spin" />
                    <span>Deactivating Pipeline</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>Initiate Voice Input</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMuted(!isMuted);
                  showToast(isMuted ? "AI audio readout enabled" : "AI reading synthesizer muted");
                  if (!isMuted) window.speechSynthesis.cancel();
                }}
                className={`p-3 rounded-xl border transition-all ${isMuted ? "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300" : "bg-cyan-950/40 text-cyan-300 border-cyan-500/25 hover:bg-cyan-950/80"}`}
                id="btn-mute-toggle"
                title={isMuted ? "Unmute vocal playback" : "Mute AI speech output"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Sliders for Speech adjustment params */}
            <div className="bg-slate-950/70 rounded-lg p-2.5 border border-cyan-500/5 flex flex-col gap-2 mt-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-cyan-500" />
                  SYNTH MODIFIERS
                </span>
                <span>VOL: {Math.round(speechVolume * 100)}%</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[9px] font-mono text-slate-500">
                    <span>RATE (SPEED):</span>
                    <span className="text-cyan-400">{speechRate.toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="1.8" 
                    step="0.1" 
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[9px] font-mono text-slate-500">
                    <span>PITCH:</span>
                    <span className="text-cyan-400">{speechPitch.toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="1.5" 
                    step="0.1" 
                    value={speechPitch}
                    onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Terminal Command logs widget */}
          <div className="bg-slate-900/75 border border-cyan-500/10 rounded-xl p-3 flex-1 flex flex-col justify-between overflow-hidden" id="card-telemetry">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 mb-2">
              <span className="font-mono text-[10px] tracking-wider text-slate-300 font-semibold flex items-center gap-1 uppercase">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                SYSTEM LOG MATRIX [SYS.LOG]
              </span>
              <button 
                type="button"
                onClick={() => {
                  setLogs([{ id: "clear-log", action: "Matrix registers flushed", timestamp: "Now", status: "info" }]);
                }}
                className="text-[9px] font-mono text-cyan-500/50 hover:text-cyan-400"
                id="btn-clear-logs"
              >
                [FLUSH]
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 flex flex-col justify-start pr-1 max-h-[160px] md:max-h-[220px]">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-2 text-[10px] font-mono leading-tight">
                  <span className="text-slate-500">[{log.timestamp}]</span>
                  <span className={`w-1 h-3 rounded-full shrink-0 ${log.status === "success" ? "bg-emerald-400" : log.status === "warning" ? "bg-amber-400" : "bg-cyan-400"}`} />
                  <span className={`flex-1 text-slate-300 ${log.status === "warning" ? "text-amber-300" : ""}`}>
                    {log.action}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800/60 pt-2 mt-2 text-[9px] font-mono text-slate-500 flex justify-between items-center">
              <span>SECURITY CERTIFICATION: ENCRYPTED_SSL</span>
              <span>NODE_ID: 45A458</span>
            </div>
          </div>

        </section>

        {/* MIDDLE COLUMN: Bilingual Terminal Interrogator (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-4 h-[650px] lg:h-auto" id="middle-column">
          
          {/* Holographic chat feed console */}
          <div className="bg-slate-900/80 border border-cyan-500/15 rounded-xl flex-1 flex flex-col overflow-hidden relative shadow-[0_4px_30px_rgba(0,0,0,0.4)]" id="card-chat-console">
            
            {/* Top diagnostic info frame */}
            <div className="px-4 py-2 bg-slate-950/90 border-b border-cyan-500/10 flex justify-between items-center text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-cyan-300 uppercase tracking-widest font-bold">
                  BILINGUAL CHAT FEED
                </span>
              </div>
              <div className="text-slate-400">
                TRANS_LANG: <span className="text-cyan-400 uppercase font-bold">{lang}</span>
              </div>
            </div>

            {/* Core stream list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[460px] lg:max-h-[none] bg-slate-950/30">
              
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm relative ${msg.sender === "user" ? "bg-cyan-950/70 border border-cyan-500/30 text-cyan-100 rounded-tr-none shadow-[2px_2px_10px_rgba(6,182,212,0.1)]" : "bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-[2px_2px_10px_rgba(0,0,0,0.2)]"}`}>
                    
                    {/* Futuristic identification badge */}
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400/80 mb-1">
                      <span className="font-bold flex items-center gap-1">
                        {msg.sender === "user" ? "COMMANDER.USER" : "ASSISTANT.B_E_N"}
                        {msg.sender === "ben" && <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-wrap leading-relaxed font-sans text-sm">
                      {msg.text.includes("[SYSTEM") ? (
                        <div className="text-red-400 font-mono text-xs bg-red-950/40 p-2.5 rounded border border-red-500/20">
                          {msg.text}
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>

                    {/* Speech synthesis prompt read button helper */}
                    {msg.sender === "ben" && (
                      <button
                        type="button"
                        onClick={() => announceSpeechOutput(msg.text)}
                        className="absolute bottom-1 right-2 p-1 text-slate-500 hover:text-cyan-400 transition-colors"
                        title="Vocalize this specific text readout"
                        id={`btn-read-msg-${msg.id}`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isAiThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-900/70 border border-purple-500/20 text-purple-200 rounded-xl rounded-tl-none px-4 py-3 text-sm max-w-[80%]">
                    <div className="flex items-center gap-2 font-mono text-xs text-purple-400">
                      <Cpu className="w-3.5 h-3.5 animate-spin" />
                      <span>DECRYPTION ENGINE SOLVING QUERY...</span>
                    </div>
                    {/* Animated running neural loading lines */}
                    <div className="mt-2 flex gap-1.5 items-center">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messageEndRef} />
            </div>

            {/* Command shortcut prompt suggestions */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-900 flex flex-col gap-2">
              <span className="text-[10px] font-mono tracking-wider text-cyan-500/60 uppercase font-semibold">
                ▲ Select Query Suggestion (Send directly to BEN)
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto">
                {questionsTemplates[lang].map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendTemplatePrompt(q.text)}
                    className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-cyan-500/10 text-cyan-300 hover:border-cyan-500/40 hover:bg-cyan-950/60 transition-all text-left"
                    id={`btn-suggestion-${idx}`}
                  >
                    {q.display}
                  </button>
                ))}
              </div>
            </div>

            {/* Input submission prompt console */}
            <form onSubmit={handleFormSubmit} className="p-3 bg-slate-950 border-t border-cyan-500/10 flex gap-2 items-center" id="form-interrogate">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={lang === "fr" ? "Entrez vos questions pour BEN ici..." : "Query Sarah's core interface..."}
                className="flex-1 bg-slate-900 border border-cyan-500/15 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                id="input-prompt"
              />
              
              <button
                type="submit"
                disabled={!inputText.trim() || isAiThinking}
                className="px-4 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-all disabled:bg-slate-800 disabled:text-slate-500 flex items-center justify-center gap-1"
                id="btn-submit-prompt"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline font-mono text-xs">SEND</span>
              </button>
            </form>

          </div>

        </section>

        {/* RIGHT COLUMN: Interactive Document Dossier Explorer (3 cols) */}
        <section className="lg:col-span-3 flex flex-col gap-4" id="right-column">
          
          {/* Main Dossier Selection Tabs */}
          <div className="bg-slate-900/70 border border-cyan-500/10 rounded-xl p-3 flex flex-col gap-3 h-full overflow-hidden" id="card-dossier-manager">
            
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-1">
              <FileCheck2 className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-[11px] tracking-wider text-slate-200 uppercase font-bold">
                Sarah's Records Core
              </span>
            </div>

            {/* Side Navigation for fast browsing */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("experiences");
                  addLog("Browsed work dossier", "info");
                }}
                className={`py-2 px-3 rounded-lg font-mono text-xs text-left flex items-center justify-between border transition-all ${activeTab === "experiences" ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.15)]" : "bg-slate-950/40 text-slate-400 border-transparent hover:bg-slate-900"}`}
                id="tab-experiences"
              >
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Work Experience</span>
                </span>
                <ChevronRight className="w-3 h-3 text-cyan-500" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("skills");
                  addLog("Audited skill matrix node", "info");
                }}
                className={`py-2 px-3 rounded-lg font-mono text-xs text-left flex items-center justify-between border transition-all ${activeTab === "skills" ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.15)]" : "bg-slate-950/40 text-slate-400 border-transparent hover:bg-slate-900"}`}
                id="tab-skills"
              >
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Skills & Tools</span>
                </span>
                <ChevronRight className="w-3 h-3 text-cyan-500" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("education");
                  addLog("Retrieved degrees registry", "info");
                }}
                className={`py-2 px-3 rounded-lg font-mono text-xs text-left flex items-center justify-between border transition-all ${activeTab === "education" ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.15)]" : "bg-slate-950/40 text-slate-400 border-transparent hover:bg-slate-900"}`}
                id="tab-education"
              >
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Education / Assoc</span>
                </span>
                <ChevronRight className="w-3 h-3 text-cyan-500" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("contact");
                  addLog("Opened secure connection deck", "info");
                }}
                className={`py-2 px-3 rounded-lg font-mono text-xs text-left flex items-center justify-between border transition-all ${activeTab === "contact" ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.15)]" : "bg-slate-950/40 text-slate-400 border-transparent hover:bg-slate-900"}`}
                id="tab-contact"
              >
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Contact Uplink</span>
                </span>
                <ChevronRight className="w-3 h-3 text-cyan-500" />
              </button>
            </div>

            {/* TAB CONTENT: Experiences chronological view */}
            <div className="flex-1 overflow-y-auto mt-2 pr-1 max-h-[380px] lg:max-h-none space-y-3 font-sans">
              
              {activeTab === "experiences" && (
                <div className="space-y-4 animate-fade-in" id="content-experiences">
                  {sarahLeangCV.experiences.map((exp, index) => (
                    <div 
                      key={index} 
                      className="border border-slate-800 bg-slate-950/50 p-3 rounded-lg flex flex-col gap-1.5 hover:border-cyan-500/35 transition-all group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                          {exp.period}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">
                          NODE_{index + 1}
                        </span>
                      </div>
                      
                      <h3 className="text-sm font-bold text-slate-100 mt-1 leading-tight group-hover:text-cyan-300 transition-colors">
                        {exp.role}
                      </h3>
                      
                      <p className="text-xs text-slate-300 font-medium">
                        🏢 {exp.company}
                      </p>

                      <ul className="list-disc pl-3 mt-1.5 text-[11px] text-slate-400 space-y-1">
                        {exp.highlights.slice(0, 3).map((item, hiIdx) => (
                          <li key={hiIdx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB CONTENT: Skills visualization meter */}
              {activeTab === "skills" && (
                <div className="space-y-4 animate-fade-in" id="content-skills">
                  
                  {/* Marketing competences widgets */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                      ► MARKETING CAPABILITIES
                    </span>
                    
                    {sarahLeangCV.skills.map((skill, index) => {
                      // Generate varying values for neat graphical effect
                      const ratings = [95, 90, 85, 80, 85, 75, 90];
                      const val = ratings[index % ratings.length];
                      
                      return (
                        <div key={index} className="flex flex-col gap-1">
                          <div className="flex justify-between text-[11px] text-slate-300 font-mono">
                            <span className="truncate max-w-[85%]">{skill}</span>
                            <span className="text-cyan-400 font-bold">{val}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-900 rounded overflow-hidden border border-slate-800/80">
                            <div 
                              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400" 
                              style={{ width: `${val}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Software instruments Mastered */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                      ► DIGITAL INSTRUMENTS
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sarahLeangCV.tools.map((tool, idx) => (
                        <span 
                          key={idx}
                          onClick={() => {
                            sendTemplatePrompt(`Tell me more about her expertise using ${tool}`);
                            addLog(`Queried tool detail: ${tool}`, "success");
                          }}
                          className="px-2.5 py-1 rounded bg-slate-950 border border-cyan-500/10 text-[11px] text-slate-300 transition-all hover:border-cyan-500/40 hover:bg-cyan-950/30 cursor-pointer hover:scale-105 inline-block"
                        >
                          ⚡ {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB CONTENT: Academic Dossier & Volunteering */}
              {activeTab === "education" && (
                <div className="space-y-4 animate-fade-in" id="content-education">
                  
                  {/* Formations records */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                      ► DEGREES & TRAINING
                    </span>
                    {sarahLeangCV.education.map((edu, idx) => (
                      <div key={idx} className="border border-slate-800 bg-slate-950/40 p-2.5 rounded-lg flex flex-col gap-1">
                        <div className="flex justify-between text-xs font-mono text-cyan-400 font-medium">
                          <span>{edu.year}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-100">{edu.degree}</h4>
                        <p className="text-[11px] text-slate-400">{edu.school} | {edu.location}</p>
                      </div>
                    ))}
                  </div>

                  {/* Volunteering graph */}
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                      ► VOLUNTARY ENGAGEMENTS
                    </span>
                    {sarahLeangCV.associative.map((assoc, idx) => (
                      <div key={idx} className="border border-slate-800 bg-slate-950/40 p-2.5 rounded-lg flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-mono text-cyan-400 font-semibold">
                          <span>{assoc.role}</span>
                          <span>{assoc.period}</span>
                        </div>
                        <h4 className="text-xs text-slate-200">{assoc.organization}</h4>
                        <ul className="list-disc pl-3 mt-1.5 text-[10px] text-slate-400 space-y-1">
                          {assoc.highlights.map((bullet, bIdx) => (
                            <li key={bIdx}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB CONTENT: Secure communication uplink cockpit */}
              {activeTab === "contact" && (
                <div className="space-y-4 animate-fade-in" id="content-contact">
                  
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold block mb-1">
                    ► COMMAND CENTER SECURED UPLINK
                  </span>

                  <div className="space-y-3">
                    
                    {/* Interactive email widget */}
                    <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-cyan-500" />
                          SECURED EMAIL REGISTER
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyEmail}
                          className="hover:text-cyan-400 transition-colors p-1"
                          id="btn-copy-email"
                        >
                          {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <a 
                        href={`mailto:${sarahLeangCV.email}?subject=Interrogating%20AI%20Assistant%20BEN%20-%20Recruitment`}
                        className="text-cyan-300 font-mono text-xs hover:underline truncate"
                        id="link-mail-direct"
                      >
                        {sarahLeangCV.email}
                      </a>
                    </div>

                    {/* Phone widget */}
                    <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-cyan-500" />
                          COMM REGISTER TELEPHONE
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyPhone}
                          className="hover:text-cyan-400 transition-colors p-1"
                          id="btn-copy-phone"
                        >
                          {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <a 
                        href={`tel:${sarahLeangCV.phone}`} 
                        className="text-cyan-300 font-mono text-xs hover:underline block"
                        id="link-phone-direct"
                      >
                        {sarahLeangCV.phone}
                      </a>
                    </div>

                    {/* Location coordinates */}
                    <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col gap-2 text-xs">
                      <span className="flex items-center gap-1 text-slate-400 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                        PHYSICAL COORDINATES
                      </span>
                      <p className="text-slate-300 leading-normal">
                        {sarahLeangCV.location}
                      </p>
                    </div>

                    {/* Direct calendar invite proposal trigger button */}
                    <button
                      type="button"
                      onClick={() => {
                        sendTemplatePrompt("I am interested in scheduling an interview with Sarah! What is the optimal method to set up a meeting or call?");
                        addLog("Initiated interview inquiry sequence", "success");
                        showToast("Interview prompt synthesized successfully.");
                      }}
                      className="w-full py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-slate-950 font-bold font-mono text-xs uppercase rounded-lg hover:from-cyan-500 hover:to-purple-500 tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-[1.02] transition-all block text-center"
                      id="btn-schedule-interview"
                    >
                      💥 SCHEDULE INTERVIEW SEQUENCE
                    </button>

                  </div>

                </div>
              )}

            </div>

            {/* Matrix credits panel footer */}
            <div className="border-t border-slate-800 text-[10px] font-mono text-slate-500 pt-2 text-center">
              SECURE SEED: SHA256_ACTIVE
            </div>

          </div>

        </section>

      </main>

      {/* Cyber footer status tracker */}
      <footer className="border-t border-cyan-500/10 py-3 px-4 bg-slate-950/90 z-20 text-center text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row justify-between items-center max-w-7xl w-full mx-auto" id="app-footer">
        <div>
          BILINGUAL CYBER PORTFOLIO CORE // OPERATIONAL AND DIGITAL MARKETING SPECIALIST
        </div>
        <div className="mt-1 sm:mt-0 flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
          <span>SARAH LEANG SECURED REGISTER // 2026</span>
        </div>
      </footer>

    </div>
  );
}
