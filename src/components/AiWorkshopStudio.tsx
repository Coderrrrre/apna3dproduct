import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Globe,
  Loader2,
  Mic,
  Search,
  Sparkles,
  Square,
  Upload,
  Volume2,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { WHATSAPP_DIGITS } from './WhatsAppWidget';

interface GroundedSource {
  title: string;
  uri: string;
}

const QUICK_RESEARCH_QUERIES = [
  'Best 3D print filament for bike keychains in Indian summer heat',
  'PLA+ vs PETG strength for outdoor planters and phone mounts',
  'How do 3D printed lithophane photo lamps work with warm LEDs?',
];

export const AiWorkshopStudio: React.FC = () => {
  // Search Grounding State (gemini-4-hydrogen)
  const [searchQuery, setSearchQuery] = useState(QUICK_RESEARCH_QUERIES[0]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchAnswer, setSearchAnswer] = useState<string | null>(null);
  const [searchSources, setSearchSources] = useState<GroundedSource[]>([]);

  // Audio Transcription State (gemini-3.5-transcribe)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [transcribeLoading, setTranscribeLoading] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [transcriptText, setTranscriptText] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    };
  }, [audioPreviewUrl]);

  const handleRunSearch = async (queryOverride?: string) => {
    const q = (queryOverride ?? searchQuery).trim();
    if (!q) return;
    if (queryOverride) setSearchQuery(queryOverride);

    setSearchLoading(true);
    setSearchError(null);
    try {
      const res = await fetch('/api/gemini/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(
          'Live AI search requires the Apna3DShop Node backend server.'
        );
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not complete grounded search.');
      }
      setSearchAnswer(data.text || '');
      setSearchSources(Array.isArray(data.sources) ? data.sources : []);
    } catch (err) {
      setSearchError(
        err instanceof Error ? err.message : 'Unable to run search query.'
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const transcribeAudioBlob = async (blob: Blob, mimeType: string) => {
    setTranscribeLoading(true);
    setTranscribeError(null);

    try {
      const base64DataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read audio data.'));
        reader.readAsDataURL(blob);
      });

      const res = await fetch('/api/gemini/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64DataUrl,
          mimeType,
        }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(
          'Voice transcription requires the Apna3DShop Node backend server.'
        );
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Audio transcription failed.');
      }
      setTranscriptText(data.transcript || '');
    } catch (err) {
      setTranscribeError(
        err instanceof Error ? err.message : 'Transcription request failed.'
      );
    } finally {
      setTranscribeLoading(false);
    }
  };

  const startRecording = async () => {
    setTranscribeError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';
      const recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const finalMime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: finalMime });
        if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
        setAudioPreviewUrl(URL.createObjectURL(blob));
        void transcribeAudioBlob(blob, finalMime);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch {
      setTranscribeError(
        'Microphone access was denied or unavailable. You can upload an audio clip instead.'
      );
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl(URL.createObjectURL(file));
    void transcribeAudioBlob(file, file.type || 'audio/mp3');
  };

  const whatsappOrderUrl = `https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(
    `Hi Apna3DShop.in! Here is my voice-transcribed custom 3D print request:\n\n${transcriptText}`
  )}`;

  return (
    <section
      id="ai-studio"
      aria-labelledby="ai-studio-heading"
      className="bg-white border-t border-[#E5E7EB]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F6E72] mb-1.5">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Smart Workshop Desk</span>
            </div>
            <h2
              id="ai-studio-heading"
              className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]"
            >
              Print Research &amp; Voice Order Assistant
            </h2>
            <p className="mt-1 text-sm sm:text-base text-[#64748B]">
              Check real-world filament durability via Google Search grounding or dictate your custom keychain specs with voice transcription.
            </p>
          </div>
        </div>

        <Tabs defaultValue="research" className="w-full">
          <TabsList className="mb-5">
            <TabsTrigger value="research" className="gap-1.5">
              <Globe className="w-4 h-4" aria-hidden="true" />
              <span>Material Research (Google Search)</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-1.5">
              <Mic className="w-4 h-4" aria-hidden="true" />
              <span>Voice Order Transcriber</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Google Search Grounding */}
          <TabsContent value="research">
            <Card className="bg-[#F8FAFC]">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle>Live Material &amp; 3D Print Advisor</CardTitle>
                    <CardDescription className="mt-1">
                      Powered by live Google Search citations for PLA+, PETG, Resin tolerances, and Indian number plate sizing.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    Google Search Grounded
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleRunSearch();
                  }}
                  className="flex flex-col sm:flex-row gap-2.5"
                >
                  <div className="relative flex-1">
                    <Search
                      className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2"
                      aria-hidden="true"
                    />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ask about filament heat resistance, infill, or custom tag specs..."
                      className="pl-10 bg-white"
                      aria-label="3D printing research question"
                    />
                  </div>
                  <Button type="submit" disabled={searchLoading}>
                    {searchLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span>Searching Web...</span>
                      </>
                    ) : (
                      <span>Search &amp; Answer</span>
                    )}
                  </Button>
                </form>

                <div className="flex flex-wrap gap-2">
                  {QUICK_RESEARCH_QUERIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void handleRunSearch(q)}
                      className="text-left text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[#111827] hover:border-[#1F6E72] hover:text-[#1F6E72] transition-colors cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {searchError && (
                  <div
                    role="alert"
                    className="rounded-[10px] border border-[#C8232C]/25 bg-[#FEF2F2] px-4 py-3 text-xs sm:text-sm text-[#991B1B]"
                  >
                    {searchError}
                  </div>
                )}

                {searchAnswer && (
                  <div className="rounded-[12px] bg-white border border-[#E5E7EB] p-5 space-y-4">
                    <div className="text-sm text-[#111827] leading-relaxed whitespace-pre-wrap">
                      {searchAnswer}
                    </div>

                    {searchSources.length > 0 && (
                      <div className="pt-3 border-t border-[#E5E7EB]">
                        <p className="text-xs font-semibold text-[#64748B] mb-2">
                          Verified Web Sources
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {searchSources.map((src) => (
                            <a
                              key={src.uri}
                              href={src.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF5F5] text-[#1F6E72] px-3 py-1 text-xs font-medium hover:bg-[#DCEEEF] transition-colors"
                            >
                              <span className="max-w-[220px] truncate">
                                {src.title}
                              </span>
                              <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Voice Order Transcriber */}
          <TabsContent value="voice">
            <Card className="bg-[#F8FAFC]">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle>Dictate Custom Print Instructions</CardTitle>
                    <CardDescription className="mt-1">
                      Speak your vehicle number, keychain name, color, or dimensions—or upload a voice clip to auto-transcribe for our workshop.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    Voice Transcription
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  {!isRecording ? (
                    <Button
                      type="button"
                      onClick={() => void startRecording()}
                      disabled={transcribeLoading}
                    >
                      <Mic className="w-4 h-4" aria-hidden="true" />
                      <span>Record Voice Note</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={stopRecording}
                    >
                      <Square className="w-4 h-4" aria-hidden="true" />
                      <span>Stop Recording ({recordingSeconds}s)</span>
                    </Button>
                  )}

                  <label className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-[10px] border border-[#E5E7EB] bg-white text-sm font-semibold text-[#111827] hover:border-[#1F6E72] hover:text-[#1F6E72] cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" aria-hidden="true" />
                    <span>Upload Audio File</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileUpload}
                      className="sr-only"
                    />
                  </label>

                  {transcribeLoading && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F6E72]">
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Transcribing audio...</span>
                    </span>
                  )}
                </div>

                {audioPreviewUrl && (
                  <div className="rounded-[12px] bg-white border border-[#E5E7EB] p-3 flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-[#1F6E72] shrink-0" aria-hidden="true" />
                    <audio controls src={audioPreviewUrl} className="w-full h-9" />
                  </div>
                )}

                {transcribeError && (
                  <div
                    role="alert"
                    className="rounded-[10px] border border-[#C8232C]/25 bg-[#FEF2F2] px-4 py-3 text-xs sm:text-sm text-[#991B1B]"
                  >
                    {transcribeError}
                  </div>
                )}

                <div className="space-y-2">
                  <label
                    htmlFor="voice-transcript-box"
                    className="text-xs font-semibold text-[#111827] flex items-center gap-1.5"
                  >
                    {transcriptText && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0E7C5B]" aria-hidden="true" />
                    )}
                    <span>Transcribed Custom Print Specification</span>
                  </label>
                  <textarea
                    id="voice-transcript-box"
                    rows={4}
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    placeholder="Record or upload a voice message (e.g. 'Make 2 deep teal number plate keychains with GJ 05 KL 4411 and send to Surat')..."
                    className="w-full rounded-[12px] border border-[#E5E7EB] bg-white p-3.5 text-sm text-[#111827] placeholder:text-[#64748B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6E72]"
                  />

                  {transcriptText.trim() && (
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <a
                        href={whatsappOrderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 min-h-[42px] px-4 rounded-[10px] bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1FB858] transition-colors"
                      >
                        <span>Send Note to WhatsApp Desk</span>
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
