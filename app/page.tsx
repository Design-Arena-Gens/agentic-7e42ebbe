"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Plus,
  Type,
  Volume2,
  Trash2,
  Download,
  ZapOff,
  Sparkles,
} from "lucide-react";

type AnimationType = "slideIn" | "fadeIn" | "bounceIn" | "zoomIn" | "none";
type TransitionType = "fade" | "slide" | "zoom" | "wipe" | "none";
type SoundEffect = "whoosh" | "pop" | "click" | "swoosh" | "none";

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  animation: AnimationType;
  startTime: number;
  duration: number;
}

interface VideoClip {
  id: string;
  startTime: number;
  duration: number;
  transition: TransitionType;
  soundEffect: SoundEffect;
}

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [videoClips, setVideoClips] = useState<VideoClip[]>([
    {
      id: "1",
      startTime: 0,
      duration: 5,
      transition: "fade",
      soundEffect: "whoosh",
    },
  ]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showTextForm, setShowTextForm] = useState(false);
  const [newText, setNewText] = useState("");
  const [playingSounds, setPlayingSounds] = useState<Set<string>>(new Set());

  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
  }, []);

  const playSoundEffect = (type: SoundEffect) => {
    if (type === "none" || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    switch (type) {
      case "whoosh":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          200,
          ctx.currentTime + 0.3
        );
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          ctx.currentTime + 0.3
        );
        break;
      case "pop":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          50,
          ctx.currentTime + 0.1
        );
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          ctx.currentTime + 0.1
        );
        break;
      case "click":
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          ctx.currentTime + 0.05
        );
        break;
      case "swoosh":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          100,
          ctx.currentTime + 0.4
        );
        gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          ctx.currentTime + 0.4
        );
        break;
    }

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);

    const soundId = `${type}-${Date.now()}`;
    setPlayingSounds((prev) => new Set([...prev, soundId]));
    setTimeout(() => {
      setPlayingSounds((prev) => {
        const next = new Set(prev);
        next.delete(soundId);
        return next;
      });
    }, 500);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && currentTime >= 10) {
      setCurrentTime(0);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now() - currentTime * 1000;

      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed >= 10) {
          setIsPlaying(false);
          setCurrentTime(10);
        } else {
          setCurrentTime(elapsed);

          // Check for sound effects at clip boundaries
          videoClips.forEach((clip) => {
            const timeDiff = Math.abs(elapsed - clip.startTime);
            if (
              timeDiff < 0.05 &&
              clip.soundEffect !== "none" &&
              !playingSounds.has(`${clip.id}-${clip.startTime}`)
            ) {
              playSoundEffect(clip.soundEffect);
            }
          });

          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, videoClips]);

  const addTextElement = () => {
    if (!newText.trim()) return;

    const newElement: TextElement = {
      id: Date.now().toString(),
      text: newText,
      x: 50,
      y: 50,
      fontSize: 48,
      color: "#ffffff",
      animation: "slideIn",
      startTime: currentTime,
      duration: 3,
    };

    setTextElements([...textElements, newElement]);
    setNewText("");
    setShowTextForm(false);
    playSoundEffect("pop");
  };

  const deleteElement = (id: string) => {
    setTextElements(textElements.filter((el) => el.id !== id));
    playSoundEffect("click");
  };

  const updateElementAnimation = (id: string, animation: AnimationType) => {
    setTextElements(
      textElements.map((el) => (el.id === id ? { ...el, animation } : el))
    );
    playSoundEffect("swoosh");
  };

  const getAnimationClass = (animation: AnimationType) => {
    switch (animation) {
      case "slideIn":
        return "animate-slide-in";
      case "fadeIn":
        return "animate-fade-in";
      case "bounceIn":
        return "animate-bounce-in";
      case "zoomIn":
        return "animate-zoom-in";
      default:
        return "";
    }
  };

  const addVideoClip = () => {
    const newClip: VideoClip = {
      id: Date.now().toString(),
      startTime: videoClips.length * 5,
      duration: 5,
      transition: "fade",
      soundEffect: "whoosh",
    };
    setVideoClips([...videoClips, newClip]);
    playSoundEffect("pop");
  };

  const updateClipTransition = (id: string, transition: TransitionType) => {
    setVideoClips(
      videoClips.map((clip) => (clip.id === id ? { ...clip, transition } : clip))
    );
    playSoundEffect("click");
  };

  const updateClipSound = (id: string, soundEffect: SoundEffect) => {
    setVideoClips(
      videoClips.map((clip) =>
        clip.id === id ? { ...clip, soundEffect } : clip
      )
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 to-indigo-900 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <h1 className="text-2xl font-bold">CapCut Style Editor</h1>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 gap-4 max-w-7xl mx-auto w-full">
        {/* Video Preview Canvas */}
        <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl video-canvas aspect-video">
          <AnimatePresence>
            {textElements.map((element) => {
              const isVisible =
                currentTime >= element.startTime &&
                currentTime < element.startTime + element.duration;

              if (!isVisible) return null;

              return (
                <motion.div
                  key={element.id}
                  className={`absolute cursor-move select-none ${getAnimationClass(
                    element.animation
                  )}`}
                  style={{
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                    fontSize: `${element.fontSize}px`,
                    color: element.color,
                    fontWeight: "bold",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedElement(element.id)}
                >
                  {element.text}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Time Display */}
          <div className="absolute top-4 right-4 bg-black/70 px-4 py-2 rounded-lg font-mono">
            {currentTime.toFixed(2)}s / 10.00s
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-4 shadow-xl">
          <button
            onClick={togglePlayPause}
            className="btn-primary p-3 rounded-full hover:scale-110 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>

          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="10"
              step="0.01"
              value={currentTime}
              onChange={(e) => {
                setCurrentTime(parseFloat(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #667eea 0%, #667eea ${
                  (currentTime / 10) * 100
                }%, #374151 ${(currentTime / 10) * 100}%, #374151 100%)`,
              }}
            />
          </div>

          <button
            onClick={() => setShowTextForm(!showTextForm)}
            className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Type className="w-5 h-5" />
            <span>Add Text</span>
          </button>

          <button
            onClick={addVideoClip}
            className="bg-green-600 hover:bg-green-700 p-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Clip</span>
          </button>
        </div>

        {/* Add Text Form */}
        {showTextForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-xl p-4 shadow-xl"
          >
            <div className="flex gap-4">
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTextElement()}
                placeholder="Enter text..."
                className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              <button
                onClick={addTextElement}
                className="btn-primary px-6 py-2 rounded-lg"
              >
                Add
              </button>
            </div>
          </motion.div>
        )}

        {/* Timeline */}
        <div className="bg-gray-900 rounded-xl p-4 shadow-xl">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Timeline & Effects
          </h3>

          {/* Text Elements Timeline */}
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Text Elements</p>
            <div className="space-y-2">
              {textElements.map((element) => (
                <div
                  key={element.id}
                  className={`timeline-item p-3 flex items-center justify-between ${
                    selectedElement === element.id ? "border-purple-500" : ""
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-medium">{element.text}</p>
                    <p className="text-sm text-gray-400">
                      {element.startTime.toFixed(1)}s - Duration:{" "}
                      {element.duration}s
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={element.animation}
                      onChange={(e) =>
                        updateElementAnimation(
                          element.id,
                          e.target.value as AnimationType
                        )
                      }
                      className="bg-gray-800 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="slideIn">Slide In</option>
                      <option value="fadeIn">Fade In</option>
                      <option value="bounceIn">Bounce In</option>
                      <option value="zoomIn">Zoom In</option>
                      <option value="none">No Animation</option>
                    </select>

                    <button
                      onClick={() => deleteElement(element.id)}
                      className="text-red-500 hover:text-red-400 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Clips Timeline */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Video Clips</p>
            <div className="space-y-2">
              {videoClips.map((clip, index) => (
                <div key={clip.id} className="timeline-item p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Clip {index + 1}</p>
                      <p className="text-sm text-gray-400">
                        {clip.startTime.toFixed(1)}s - Duration: {clip.duration}
                        s
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-400">
                          Transition
                        </label>
                        <select
                          value={clip.transition}
                          onChange={(e) =>
                            updateClipTransition(
                              clip.id,
                              e.target.value as TransitionType
                            )
                          }
                          className="bg-gray-800 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="fade">Fade</option>
                          <option value="slide">Slide</option>
                          <option value="zoom">Zoom</option>
                          <option value="wipe">Wipe</option>
                          <option value="none">None</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-400">
                          Sound Effect
                        </label>
                        <select
                          value={clip.soundEffect}
                          onChange={(e) =>
                            updateClipSound(
                              clip.id,
                              e.target.value as SoundEffect
                            )
                          }
                          className="bg-gray-800 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="whoosh">Whoosh</option>
                          <option value="pop">Pop</option>
                          <option value="click">Click</option>
                          <option value="swoosh">Swoosh</option>
                          <option value="none">None</option>
                        </select>
                      </div>

                      <button
                        onClick={() => playSoundEffect(clip.soundEffect)}
                        className="bg-purple-600 hover:bg-purple-700 p-2 rounded transition-colors"
                        title="Preview sound"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 p-3 text-center text-sm text-gray-400">
        <p>
          CapCut Style Video Editor - Add text with animations, transitions, and
          sound effects
        </p>
      </footer>
    </div>
  );
}
