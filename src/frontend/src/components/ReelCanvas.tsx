import { Button } from "@/components/ui/button";
import { Download, ImageIcon, Loader2, Play, Square } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const PEXELS_KEY = "1tBWeItUOPOFun3L9aIf0rOD0PHSGo4PIUTUOO8C9LOueavFz2CFYFFK";

interface ReelCanvasProps {
  lines: string[];
  autoPlay?: boolean;
  onAutoPlayStarted?: () => void;
}

const MONEY_KEYWORDS = [
  "salary",
  "emi",
  "savings",
  "saving",
  "save",
  "investment",
  "invest",
  "money",
  "income",
  "debt",
  "interest",
  "return",
  "profit",
  "loss",
  "wealth",
  "rupee",
  "rupees",
  "financial",
  "finance",
  "bank",
  "loan",
  "tax",
  "budget",
  "spend",
  "earning",
  "earn",
  "rich",
  "poor",
  "asset",
  "liability",
  "fund",
  "mutual",
  "sip",
  "stock",
  "equity",
  "credit",
  "card",
  "insurance",
  "pension",
  "retirement",
  "inflation",
  "gold",
  "property",
  "real",
  "estate",
  "office",
  "business",
  "success",
  "stress",
  "struggle",
  "freedom",
  "independent",
  "future",
  "goal",
  "plan",
  "growth",
];

const TOPIC_KEYWORDS: Record<string, string[]> = {
  "credit card": ["credit card debt", "financial stress", "money problems"],
  emi: ["loan payment", "debt stress", "financial burden"],
  debt: ["debt stress", "financial freedom", "money problems"],
  "mutual fund": ["investment growth", "stock market", "wealth building"],
  sip: ["investment savings", "wealth building", "financial planning"],
  stock: ["stock market", "trading", "investment growth"],
  savings: ["savings money", "piggy bank", "financial planning"],
  tax: ["tax planning", "finance documents", "business paperwork"],
  retirement: [
    "retirement planning",
    "senior couple happy",
    "financial freedom",
  ],
  salary: ["office work", "professional success", "career growth"],
  insurance: ["insurance protection", "family security", "financial safety"],
  inflation: ["rising prices", "grocery shopping", "economic stress"],
  gold: ["gold coins", "precious metal", "wealth investment"],
  property: ["real estate", "house investment", "property market"],
};

const CANVAS_WIDTH = 405;
const CANVAS_HEIGHT = 720;
const RECORD_WIDTH = 1080;
const RECORD_HEIGHT = 1920;

// Timing constants (ms)
const LINE_DURATION = 1800; // total time per line
const FADE_IN_MS = 250; // fade-in duration
const FADE_OUT_MS = 250; // fade-out duration
// Gap between lines — next line starts ONLY after previous alpha = 0
// The fade-out window is the last FADE_OUT_MS of LINE_DURATION
// So there is no overlap by design.

// Safe zones — stay inside header/footer
const SAFE_TOP_BASE = 80; // px at scale=1 (header is 58px)
const SAFE_BOTTOM_BASE = 70; // px at scale=1 (footer bar is 48px)

// Text max width as fraction of canvas width
const TEXT_MAX_WIDTH_RATIO = 0.82;

const CTA_STRING = "Follow Money Intelligence India for more insights";

function extractSearchQuery(lines: string[]): string {
  const allText = lines.join(" ").toLowerCase();
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (allText.includes(topic)) return keywords[0];
  }
  const found = MONEY_KEYWORDS.filter((kw) => allText.includes(kw));
  if (found.length > 0) return `${found.slice(0, 3).join(" ")} finance India`;
  return lines[0]?.split(" ").slice(0, 4).join(" ") || "money finance";
}

/**
 * Wraps words into lines that fit within maxWidth.
 * Returns at most maxLines wrapped lines.
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  words: string[],
  maxWidth: number,
  font: string,
  maxLines: number,
): string[][] {
  ctx.font = font;
  const lines: string[][] = [];
  let current: string[] = [];
  for (const word of words) {
    const test = [...current, word].join(" ");
    if (ctx.measureText(test).width > maxWidth && current.length > 0) {
      lines.push(current);
      if (lines.length >= maxLines) return lines;
      current = [word];
    } else {
      current.push(word);
    }
  }
  if (current.length > 0 && lines.length < maxLines) lines.push(current);
  return lines.slice(0, maxLines);
}

/**
 * Returns the largest font size such that the text wraps to ≤ maxLines
 * within maxWidth, starting from startSize and stepping down by step.
 */
function autoFontSize(
  ctx: CanvasRenderingContext2D,
  words: string[],
  maxWidth: number,
  maxLines: number,
  startSize: number,
  minSize: number,
  step: number,
): { fontSize: number; lines: string[][] } {
  for (let size = startSize; size >= minSize; size -= step) {
    const font = `bold ${size}px 'Plus Jakarta Sans', sans-serif`;
    const wrapped = wrapText(ctx, words, maxWidth, font, maxLines + 1);
    if (wrapped.length <= maxLines) {
      return { fontSize: size, lines: wrapped };
    }
  }
  // At minSize, force-wrap to maxLines
  const font = `bold ${minSize}px 'Plus Jakarta Sans', sans-serif`;
  return {
    fontSize: minSize,
    lines: wrapText(ctx, words, maxWidth, font, maxLines),
  };
}

function drawDarkBg(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#070A12");
  grad.addColorStop(0.5, "#0B1220");
  grad.addColorStop(1, "#070A12");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(225, 193, 90, 0.04)";
  ctx.lineWidth = 1;
  const gridSize = 40 * (w / CANVAS_WIDTH);
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  text: string,
  alpha: number,
  isCTA: boolean,
  bgVideo: HTMLVideoElement | null,
  slideImages: HTMLImageElement[],
  slideIndex: number,
  progress: number,
  scale: number,
) {
  const w = CANVAS_WIDTH * scale;
  const h = CANVAS_HEIGHT * scale;
  const s = scale;

  ctx.clearRect(0, 0, w, h);

  // ── Background ──────────────────────────────────────────
  if (bgVideo && bgVideo.readyState >= 2) {
    try {
      const vw = bgVideo.videoWidth || w;
      const vh = bgVideo.videoHeight || h;
      const sv = Math.max(w / vw, h / vh);
      ctx.drawImage(
        bgVideo,
        (w - vw * sv) / 2,
        (h - vh * sv) / 2,
        vw * sv,
        vh * sv,
      );
      ctx.fillStyle = "rgba(7, 10, 18, 0.62)";
      ctx.fillRect(0, 0, w, h);
    } catch {
      drawDarkBg(ctx, w, h);
    }
  } else if (slideImages.length > 0) {
    const img = slideImages[slideIndex % slideImages.length];
    if (img?.complete && img.naturalWidth > 0) {
      try {
        const zoom = 1 + 0.05 * progress;
        const si = Math.max(w / img.naturalWidth, h / img.naturalHeight);
        const dw = img.naturalWidth * si * zoom;
        const dh = img.naturalHeight * si * zoom;
        ctx.save();
        ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
        ctx.restore();
        ctx.fillStyle = "rgba(7, 10, 18, 0.62)";
        ctx.fillRect(0, 0, w, h);
      } catch {
        drawDarkBg(ctx, w, h);
      }
    } else {
      drawDarkBg(ctx, w, h);
    }
  } else {
    drawDarkBg(ctx, w, h);
  }

  // ── Top branding bar ────────────────────────────────────
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#E1C15A";
  ctx.fillRect(0, 0, w, 58 * s);
  ctx.fillStyle = "#070A12";
  ctx.font = `bold ${18 * s}px 'Plus Jakarta Sans', sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("MONEY INTELLIGENCE INDIA", w / 2, 37 * s);

  // ── Bottom branding bar ─────────────────────────────────
  ctx.fillStyle = "rgba(7, 10, 18, 0.85)";
  ctx.fillRect(0, h - 48 * s, w, 48 * s);
  ctx.fillStyle = "#E1C15A";
  ctx.font = `500 ${14 * s}px 'Plus Jakarta Sans', sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("@MoneyIntelligenceIndia", w / 2, h - 18 * s);

  // ── Text content ────────────────────────────────────────
  ctx.globalAlpha = alpha;

  const safeTop = SAFE_TOP_BASE * s;
  const safeBottom = h - SAFE_BOTTOM_BASE * s;
  const safeHeight = safeBottom - safeTop;
  const safeCenter = safeTop + safeHeight / 2;
  const maxWidth = w * TEXT_MAX_WIDTH_RATIO;

  if (isCTA) {
    // ── CTA box ─────────────────────────────────────────
    const words = text.split(" ");
    const { fontSize, lines } = autoFontSize(
      ctx,
      words,
      maxWidth - 20 * s,
      2,
      26 * s,
      14 * s,
      2,
    );
    const font = `bold ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
    const lineH = fontSize * 1.35;
    const textBlockH = lines.length * lineH;
    const boxPadV = 22 * s;
    const boxPadH = 30 * s;
    const boxH = textBlockH + boxPadV * 2;
    const boxW = maxWidth + boxPadH * 2;
    const boxX = (w - boxW) / 2;
    const boxY = safeCenter - boxH / 2;
    ctx.fillStyle = "rgba(225, 193, 90, 0.18)";
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 16 * s);
    ctx.fill();
    ctx.strokeStyle = "#E1C15A";
    ctx.lineWidth = 1.5 * s;
    ctx.stroke();
    ctx.fillStyle = "#FFD700";
    ctx.font = font;
    ctx.textAlign = "center";
    let textY = boxY + boxPadV + fontSize;
    for (const line of lines) {
      ctx.fillText(line.join(" "), w / 2, textY);
      textY += lineH;
    }
  } else {
    // ── Regular text ────────────────────────────────────
    const words = text.split(" ");
    // Start at 32px, step down by 2 until text fits in 2 lines
    const { fontSize, lines } = autoFontSize(
      ctx,
      words,
      maxWidth,
      2,
      32 * s,
      15 * s,
      2,
    );
    const font = `bold ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
    const lineH = fontSize * 1.45;
    const textBlockH = lines.length * lineH;
    // Vertically center within safe area
    let textY = safeCenter - textBlockH / 2 + fontSize;

    ctx.font = font;
    ctx.textAlign = "center";

    for (const lineWords of lines) {
      const lineText = lineWords.join(" ");
      // Word-by-word coloring: highlight finance keywords in gold
      let x = w / 2 - ctx.measureText(lineText).width / 2;
      for (let wi = 0; wi < lineWords.length; wi++) {
        const word = lineWords[wi];
        const clean = word.toLowerCase().replace(/[^a-z]/g, "");
        ctx.fillStyle = MONEY_KEYWORDS.includes(clean) ? "#FFD700" : "#F2F4F8";
        ctx.fillText(word, x + ctx.measureText(word).width / 2, textY);
        x += ctx.measureText(
          word + (wi < lineWords.length - 1 ? " " : ""),
        ).width;
      }
      textY += lineH;
    }
  }

  ctx.globalAlpha = 1;
}

export default function ReelCanvas({
  lines: rawLines,
  autoPlay = false,
  onAutoPlayStarted,
}: ReelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const autoPlayFiredRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [bgVideo, setBgVideo] = useState<HTMLVideoElement | null>(null);
  const [slideImages, setSlideImages] = useState<HTMLImageElement[]>([]);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoadingVisuals, setIsLoadingVisuals] = useState(false);
  const [visualSource, setVisualSource] = useState<
    "video" | "images" | "gradient" | null
  >(null);

  // Stable memoized lines
  const lines = useMemo(() => {
    if (rawLines.length === 0) return rawLines;
    const last = rawLines[rawLines.length - 1];
    if (last === CTA_STRING) return rawLines;
    return [...rawLines.filter((l) => l !== CTA_STRING), CTA_STRING];
  }, [rawLines]);

  // Detect desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const h = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  // Fetch Pexels visuals
  useEffect(() => {
    if (lines.length === 0) return;
    let cancelled = false;
    setBgVideo(null);
    setSlideImages([]);
    setVisualSource(null);
    setIsLoadingVisuals(true);
    const query = encodeURIComponent(extractSearchQuery(lines));

    (async () => {
      try {
        // 1. Try videos
        const vRes = await fetch(
          `https://api.pexels.com/videos/search?query=${query}&per_page=3&orientation=portrait`,
          { headers: { Authorization: PEXELS_KEY } },
        );
        if (!vRes.ok) throw new Error(`Pexels videos HTTP ${vRes.status}`);
        const vData = await vRes.json();
        if (vData.videos?.length > 0 && !cancelled) {
          const files = vData.videos[0].video_files
            .filter(
              (f: { width: number; height: number }) => f.width && f.height,
            )
            .sort((a: { quality: string }, b: { quality: string }) => {
              const q = (s: string) => (s === "hd" ? 3 : s === "sd" ? 2 : 1);
              return q(b.quality) - q(a.quality);
            });
          const src = files[0]?.link;
          if (src) {
            const vid = document.createElement("video");
            vid.src = src;
            vid.loop = true;
            vid.muted = true;
            vid.crossOrigin = "anonymous";
            vid.playsInline = true;
            vid.preload = "auto";
            await new Promise<void>((res) => {
              const t = setTimeout(() => res(), 8000);
              vid.oncanplay = () => {
                clearTimeout(t);
                res();
              };
              vid.onerror = () => {
                clearTimeout(t);
                res();
              };
              vid.load();
            });
            if (!cancelled && vid.readyState >= 2) {
              await vid.play().catch(() => {});
              setBgVideo(vid);
              setVisualSource("video");
              setIsLoadingVisuals(false);
              return;
            }
          }
        }

        // 2. Fallback to images
        const iRes = await fetch(
          `https://api.pexels.com/v1/search?query=${query}&per_page=6&orientation=portrait`,
          { headers: { Authorization: PEXELS_KEY } },
        );
        if (!iRes.ok) throw new Error(`Pexels images HTTP ${iRes.status}`);
        const iData = await iRes.json();
        if (iData.photos?.length > 0 && !cancelled) {
          const imgs = await Promise.all(
            iData.photos.slice(0, 6).map(
              (p: { src: { large2x: string; large: string } }) =>
                new Promise<HTMLImageElement>((res) => {
                  const img = new Image();
                  img.crossOrigin = "anonymous";
                  img.src = p.src.large2x || p.src.large;
                  const t = setTimeout(() => res(img), 5000);
                  img.onload = () => {
                    clearTimeout(t);
                    res(img);
                  };
                  img.onerror = () => {
                    clearTimeout(t);
                    res(img);
                  };
                }),
            ),
          );
          const loaded = imgs.filter(
            (img) => img.complete && img.naturalWidth > 0,
          );
          if (!cancelled && loaded.length > 0) {
            setSlideImages(loaded);
            setVisualSource("images");
            setIsLoadingVisuals(false);
            return;
          }
        }

        // 3. Gradient fallback
        if (!cancelled) {
          setVisualSource("gradient");
          setIsLoadingVisuals(false);
        }
      } catch {
        if (!cancelled) {
          setVisualSource("gradient");
          setIsLoadingVisuals(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lines]);

  const bgVideoRef = useRef(bgVideo);
  const slideImagesRef = useRef(slideImages);
  bgVideoRef.current = bgVideo;
  slideImagesRef.current = slideImages;

  const playAnimation = useCallback(
    (onDone?: () => void) => {
      const canvas = canvasRef.current;
      setVideoError(null);
      if (!canvas || lines.length === 0) {
        setVideoError("Preview failed. Tap Play to retry.");
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setVideoError("Preview failed. Tap Play to retry.");
        return;
      }
      if (animRef.current) cancelAnimationFrame(animRef.current);

      let lineIndex = 0;
      let lineStart = performance.now();
      let slideIndex = 0;
      setIsPlaying(true);

      const render = (now: number) => {
        try {
          const elapsed = now - lineStart;

          // Fade in for first FADE_IN_MS, fade out for last FADE_OUT_MS
          let alpha = 1;
          if (elapsed < FADE_IN_MS) {
            alpha = elapsed / FADE_IN_MS;
          } else if (elapsed > LINE_DURATION - FADE_OUT_MS) {
            alpha = Math.max(
              0,
              1 - (elapsed - (LINE_DURATION - FADE_OUT_MS)) / FADE_OUT_MS,
            );
          }

          const progress = Math.min(elapsed / LINE_DURATION, 1);
          const currentText = lines[lineIndex] || "";
          const isCTA = lineIndex === lines.length - 1;
          const curVideo = bgVideoRef.current;
          const curImages = slideImagesRef.current;

          drawFrame(
            ctx,
            currentText,
            alpha,
            isCTA,
            curVideo,
            curImages,
            slideIndex,
            progress,
            1,
          );

          const offCtx = offscreenCtxRef.current;
          if (offCtx) {
            drawFrame(
              offCtx,
              currentText,
              alpha,
              isCTA,
              curVideo,
              curImages,
              slideIndex,
              progress,
              RECORD_WIDTH / CANVAS_WIDTH,
            );
          }

          // Advance to next line ONLY after this line's alpha reaches 0
          if (elapsed >= LINE_DURATION) {
            lineIndex++;
            slideIndex++;
            lineStart = now;
            if (lineIndex >= lines.length) {
              setIsPlaying(false);
              setHasPlayed(true);
              onDone?.();
              return;
            }
          }

          animRef.current = requestAnimationFrame(render);
        } catch {
          setIsPlaying(false);
          setVideoError("Preview failed. Tap Play to retry.");
        }
      };

      animRef.current = requestAnimationFrame(render);
    },
    [lines],
  );

  // Draw initial frame on mount/lines change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || lines.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawFrame(ctx, lines[0], 1, false, bgVideo, slideImages, 0, 0, 1);
  }, [lines, bgVideo, slideImages]);

  // Auto-play after visuals load
  useEffect(() => {
    if (!autoPlay || lines.length === 0 || autoPlayFiredRef.current) return;
    if (isLoadingVisuals) return;
    autoPlayFiredRef.current = true;
    const t = setTimeout(() => {
      onAutoPlayStarted?.();
      playAnimation();
    }, 150);
    return () => clearTimeout(t);
  }, [autoPlay, lines, isLoadingVisuals, playAnimation, onAutoPlayStarted]);

  const handlePlay = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    playAnimation();
  };
  const handleStop = () => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    offscreenCtxRef.current = null;
    setIsPlaying(false);
  };

  const handleDownload = async () => {
    if (!window.MediaRecorder) {
      toast.error("MediaRecorder not supported. Try Chrome or Edge.");
      return;
    }
    setIsRecording(true);
    setHasPlayed(false);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    try {
      const offscreen = document.createElement("canvas");
      offscreen.width = RECORD_WIDTH;
      offscreen.height = RECORD_HEIGHT;
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) throw new Error("offscreen ctx");
      offscreenCtxRef.current = offCtx;
      const stream = offscreen.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm")
          ? "video/webm"
          : "video/mp4";
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8000000,
      });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = async () => {
        offscreenCtxRef.current = null;
        const blob = new Blob(chunks, { type: mimeType });
        const file = new File([blob], "money-intelligence-reel.mp4", {
          type: mimeType,
        });
        if (navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: "Money Intelligence Reel",
            });
          } catch {
            downloadBlob(blob);
          }
        } else {
          downloadBlob(blob);
        }
        setIsRecording(false);
        setHasPlayed(true);
        toast.success("Reel downloaded! (1080×1920 · Facebook Reels ready)");
      };
      recorder.start();
      playAnimation(() => {
        setTimeout(() => recorder.stop(), 400);
      });
    } catch (err) {
      console.error(err);
      offscreenCtxRef.current = null;
      toast.error("Recording failed. Try a different browser.");
      setIsRecording(false);
    }
  };

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "money-intelligence-reel.mp4";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePreviewOrDownload = () => {
    if (!hasPlayed) handlePlay();
    else handleDownload();
  };

  const visualBadge =
    visualSource === "video"
      ? "Live video background"
      : visualSource === "images"
        ? "Image slideshow background"
        : null;

  const canvas = (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );

  const loadingOverlay = isLoadingVisuals && lines.length > 0 && (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "rgba(7,10,18,0.75)",
          borderRadius: 20,
          padding: "6px 14px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Loader2
          size={14}
          style={{ color: "#E1C15A", animation: "spin 1s linear infinite" }}
        />
        <span style={{ color: "#E1C15A", fontSize: 12 }}>
          Loading visuals...
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-stretch gap-4">
      {/* Mobile */}
      {!isDesktop && (
        <div
          style={{
            width: "100%",
            aspectRatio: "9/16",
            borderRadius: "16px",
            overflow: "hidden",
            background: "#070A12",
            position: "relative",
          }}
          data-ocid="reel.canvas_target"
        >
          {canvas}
          {loadingOverlay}
        </div>
      )}

      {/* Desktop phone frame */}
      {isDesktop && (
        <div className="flex justify-center" data-ocid="reel.canvas_target">
          <div
            className="relative rounded-[2.5rem] overflow-hidden"
            style={{
              background: "#070A12",
              border: "3px solid #222C3C",
              boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
              width: 270,
              height: 480,
              padding: "12px 8px",
            }}
          >
            <div
              className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full z-10"
              style={{ background: "#0B1220", border: "2px solid #222C3C" }}
            />
            <div
              className="w-full h-full rounded-[1.8rem] overflow-hidden"
              style={{ position: "relative" }}
            >
              {canvas}
              {loadingOverlay}
            </div>
            <div
              className="absolute inset-0 rounded-[2.5rem] pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)",
              }}
            />
          </div>
        </div>
      )}

      {/* Visual badge */}
      {visualBadge && !isLoadingVisuals && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <ImageIcon size={13} style={{ color: "#E1C15A" }} />
          <span style={{ color: "#A6AFBF", fontSize: 12 }}>{visualBadge}</span>
        </div>
      )}

      {/* Error */}
      {videoError && (
        <p
          className="text-sm text-center"
          style={{ color: "#F87171", padding: "8px 0" }}
          data-ocid="reel.error_state"
        >
          {videoError}
        </p>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-2 lg:flex-row">
        <Button
          onClick={handlePreviewOrDownload}
          disabled={
            lines.length === 0 || isRecording || isPlaying || isLoadingVisuals
          }
          className="h-14 flex-1 text-base font-bold"
          style={{
            background: hasPlayed ? "transparent" : "#E1C15A",
            color: hasPlayed ? "#E1C15A" : "#070A12",
            border: hasPlayed ? "2px solid #E1C15A" : "none",
          }}
          data-ocid="reel.primary_button"
        >
          {isRecording ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Recording HD...
            </>
          ) : isLoadingVisuals && lines.length > 0 ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading visuals...
            </>
          ) : hasPlayed ? (
            <>
              <Download className="w-5 h-5 mr-2" />
              &#x2B07; Download MP4
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              &#x25B6; Preview Reel
            </>
          )}
        </Button>

        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Button
                onClick={handleStop}
                variant="outline"
                className="h-14 w-full font-bold border-primary text-primary"
                data-ocid="reel.secondary_button"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hasPlayed && (
        <p className="text-xs text-center" style={{ color: "#A6AFBF" }}>
          Saved as .mp4 — compatible with Facebook Reels &amp; Instagram
        </p>
      )}

      {lines.length === 0 && (
        <p
          className="text-sm text-muted-foreground text-center"
          data-ocid="reel.empty_state"
        >
          Generate a script to preview your reel
        </p>
      )}
    </div>
  );
}
