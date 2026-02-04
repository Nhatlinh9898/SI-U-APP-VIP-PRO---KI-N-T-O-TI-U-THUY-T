import React, { useState, useEffect } from 'react';
import { VoiceConfig } from '../types';

interface VoiceStudioProps {
  text: string;
}

const VoiceStudio: React.FC<VoiceStudioProps> = ({ text }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [config, setConfig] = useState<VoiceConfig>({
    voiceURI: null,
    rate: 1,
    pitch: 1,
    volume: 1,
  });

  useEffect(() => {
    const loadVoices = () => {
      const availVoices = window.speechSynthesis.getVoices();
      // Filter for Vietnamese voices if possible, otherwise list all
      const vnVoices = availVoices.filter(v => v.lang.includes('vi'));
      setVoices(vnVoices.length > 0 ? vnVoices : availVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handlePlay = () => {
    if (!text) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (config.voiceURI) {
      utterance.voice = voices.find(v => v.voiceURI === config.voiceURI) || null;
    }
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = config.volume;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div className="glass-panel p-4 rounded-xl mt-4 border-t-2 border-amber-500/30">
      <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2 brand-font">
        <span className="text-2xl">🎙️</span> VOICE STUDIO PRO
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Giọng Đọc</label>
          <select 
            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm focus:border-amber-500 outline-none transition-colors"
            value={config.voiceURI || ''}
            onChange={(e) => setConfig({ ...config, voiceURI: e.target.value })}
          >
            <option value="">-- Chọn Giọng AI --</option>
            {voices.map(v => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2">
           <div className="flex-1">
             <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Tốc Độ ({config.rate}x)</label>
             <input 
                type="range" min="0.5" max="2" step="0.1"
                value={config.rate}
                onChange={(e) => setConfig({...config, rate: parseFloat(e.target.value)})}
                className="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
             />
           </div>
           <div className="flex-1">
             <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">Cao Độ</label>
             <input 
                type="range" min="0.5" max="2" step="0.1"
                value={config.pitch}
                onChange={(e) => setConfig({...config, pitch: parseFloat(e.target.value)})}
                className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
             />
           </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-3">
            {!isPlaying ? (
                <button 
                    onClick={handlePlay}
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-full font-bold shadow-lg shadow-green-900/50 transition-all transform hover:scale-105 flex items-center gap-2"
                >
                    ▶ PHÁT
                </button>
            ) : (
                <button 
                    onClick={handleStop}
                    className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-full font-bold shadow-lg shadow-red-900/50 transition-all flex items-center gap-2"
                >
                    ⏹ DỪNG
                </button>
            )}
        </div>
        <button className="text-xs text-slate-500 hover:text-amber-400 transition-colors">
            ⬇ Tải xuống MP3 (Beta)
        </button>
      </div>
    </div>
  );
};

export default VoiceStudio;
