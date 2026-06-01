import { useEffect, useRef } from "react";

interface VoiceVisualizerProps {
  status: "idle" | "listening" | "speaking" | "thinking";
}

export default function VoiceVisualizer({ status }: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const phasesRef = useRef<number[]>([0, 1.5, 3.0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle resizing gracefully
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Animation Loop
    const render = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, width, height);

      // Base configuration dependent on status
      let numWaves = 4;
      let baseAmplitude = 12; // default idle amplitude
      let baseFrequency = 0.015;
      let speedScale = 0.05;

      switch (status) {
        case "listening":
          baseAmplitude = 28;
          baseFrequency = 0.025;
          speedScale = 0.12;
          break;
        case "speaking":
          baseAmplitude = 35;
          baseFrequency = 0.03;
          speedScale = 0.08;
          break;
        case "thinking":
          baseAmplitude = 8;
          baseFrequency = 0.04;
          speedScale = 0.18;
          break;
        case "idle":
        default:
          baseAmplitude = 10;
          baseFrequency = 0.012;
          speedScale = 0.03;
          break;
      }

      // Draw beautiful background digital grids
      ctx.strokeStyle = "rgba(6, 182, 212, 0.03)";
      ctx.lineWidth = 1;
      const gridSpacing = 20;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center visual horizon
      ctx.strokeStyle = "rgba(6, 182, 212, 0.08)";
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Render overlayed waves
      const colors = [
        "rgba(6, 182, 212, 0.8)",  // Cyan
        "rgba(168, 85, 247, 0.6)", // Purple
        "rgba(16, 185, 129, 0.7)", // Emerald
        "rgba(236, 72, 153, 0.4)", // Pink
      ];

      for (let i = 0; i < numWaves; i++) {
        ctx.beginPath();
        ctx.lineWidth = i === 0 ? 3 : i === 1 ? 2 : 1;
        ctx.strokeStyle = colors[i % colors.length];

        // Add cyber glow effect to the leader wave
        if (i === 0) {
          ctx.shadowColor = "rgba(6, 182, 212, 0.8)";
          ctx.shadowBlur = 12;
        } else {
          ctx.shadowBlur = 0;
        }

        // Specific offsets for variety
        const phaseShift = phasesRef.current[i % phasesRef.current.length];
        const amplitude = baseAmplitude * (1 - i * 0.22);
        const frequency = baseFrequency * (1 + i * 0.15);

        for (let x = 0; x < width; x += 2) {
          // Add a elegant gaussian envelope so waves taper down beautifully on left and right edges
          const envelope = Math.sin((x / width) * Math.PI);
          const y =
            height / 2 +
            Math.sin(x * frequency + phaseShift) * amplitude * envelope;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Increment phase unique to each wave for liquid motion
        phasesRef.current[i % phasesRef.current.length] += (i * 0.01 + 0.02) * speedScale * 60;
      }

      // Reset shadow for subsequent drawings
      ctx.shadowBlur = 0;

      // Draw subtle holographic floating particles or circles in center
      if (status !== "idle") {
        ctx.fillStyle = status === "listening" ? "rgba(220, 38, 38, 0.3)" : "rgba(6, 182, 212, 0.3)";
        const pulseRatio = (Math.sin(Date.now() / 150) + 1) / 2;
        const outerRadius = 8 + pulseRatio * 6;

        ctx.beginPath();
        ctx.arc(width / 2, height / 2, outerRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(6, 182, 212, 0.5)";
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, outerRadius + 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [status]);

  return (
    <div className="relative w-full h-32 md:h-40 rounded-xl bg-slate-950/85 border border-cyan-500/15 overflow-hidden flex flex-col justify-center items-center shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* Outer cyber borders and details */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${status === "listening" ? "bg-red-500 animate-ping" : status === "speaking" ? "bg-cyan-400 animate-pulse" : "bg-cyan-500/40"}`} />
        <span className="font-mono text-[10px] tracking-widest text-cyan-500/60 uppercase">
          {status === "listening" ? "REC.ONLINE" : status === "speaking" ? "TTS.OUTFLOW" : status === "thinking" ? "AI.SOLVING" : "SYS.STANDBY"}
        </span>
      </div>

      <div className="absolute bottom-2 right-3 font-mono text-[9px] tracking-wider text-cyan-500/40">
        VOLts.04 // B.E.N_CORE_v3.5
      </div>
      
      {/* Visual Indicator text overlays */}
      <div className="z-10 text-center pointer-events-none select-none">
        {status === "listening" && (
          <p className="font-sans font-medium text-xs tracking-wide text-red-400 uppercase animate-pulse">
            BEN is listening... Speak now
          </p>
        )}
        {status === "speaking" && (
          <p className="font-sans font-medium text-xs tracking-wide text-cyan-300 uppercase animate-pulse">
            BEN is transmitting... Audio synthesis active
          </p>
        )}
        {status === "thinking" && (
          <p className="font-sans font-medium text-xs tracking-wide text-purple-400 uppercase">
            Querying Sarah's Memory Core...
          </p>
        )}
        {status === "idle" && (
          <p className="font-sans font-normal text-[11px] tracking-wide text-cyan-500/55 uppercase">
            Click microphone or type to communicate
          </p>
        )}
      </div>
    </div>
  );
}
