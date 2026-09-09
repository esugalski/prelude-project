import { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, RotateCw, Wand2, Check, Loader2, ImageUp, AlertCircle } from 'lucide-react';

const MAX_OUTPUT_DIMENSION = 2400;

// Grayscale + auto white/black-point stretch + a mild contrast boost - a
// dependency-free approximation of a document-scanner "enhance" filter.
// Good enough to turn a phone photo of sheet music into something with
// crisp black notation on a clean white background.
function enhance(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const count = width * height;
  const gray = new Uint8ClampedArray(count);

  let min = 255;
  let max = 0;
  for (let i = 0; i < count; i++) {
    const o = i * 4;
    const l = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
    gray[i] = l;
    if (l < min) min = l;
    if (l > max) max = l;
  }

  const range = Math.max(max - min, 1);
  for (let i = 0; i < count; i++) {
    const o = i * 4;
    const stretched = ((gray[i] - min) / range) * 255;
    const contrasted = Math.min(255, Math.max(0, (stretched - 128) * 1.2 + 128));
    data[o] = data[o + 1] = data[o + 2] = contrasted;
  }
  ctx.putImageData(imageData, 0, 0);
}

function drawRotated(source: HTMLCanvasElement, rotationDeg: number): HTMLCanvasElement {
  const out = document.createElement('canvas');
  const swap = rotationDeg % 180 !== 0;
  out.width = swap ? source.height : source.width;
  out.height = swap ? source.width : source.height;
  const ctx = out.getContext('2d')!;
  ctx.translate(out.width / 2, out.height / 2);
  ctx.rotate((rotationDeg * Math.PI) / 180);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);
  return out;
}

function downscale(source: HTMLCanvasElement, maxDim: number): HTMLCanvasElement {
  const scale = Math.min(1, maxDim / Math.max(source.width, source.height));
  if (scale >= 1) return source;
  const out = document.createElement('canvas');
  out.width = Math.round(source.width * scale);
  out.height = Math.round(source.height * scale);
  out.getContext('2d')!.drawImage(source, 0, 0, out.width, out.height);
  return out;
}

type Stage = 'camera' | 'edit';

export function SheetMusicScanner({ onCapture, onClose }: {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<Stage>('camera');
  const [cameraError, setCameraError] = useState('');
  const [rotation, setRotation] = useState(0);
  const [enhanced, setEnhanced] = useState(true);
  const [preparing, setPreparing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Original captured frame, kept pristine so rotate/enhance can be toggled
  // repeatedly without compounding quality loss.
  const originalRef = useRef<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startCamera = async () => {
    setCameraError('');
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 3840 },
          height: { ideal: 2160 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCameraError("Couldn't access your camera. You can choose a photo instead.");
    }
  };

  useEffect(() => {
    if (stage === 'camera') startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const loadFromSource = (draw: (canvas: HTMLCanvasElement) => void) => {
    const canvas = document.createElement('canvas');
    draw(canvas);
    originalRef.current = canvas;
    setRotation(0);
    setEnhanced(true);
    stopCamera();
    setStage('edit');
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    loadFromSource((canvas) => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')!.drawImage(video, 0, 0);
    });
  };

  const handleFilePicked = (file: File) => {
    const img = new Image();
    img.onload = () => {
      loadFromSource((canvas) => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
      });
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  };

  // Recompute the preview whenever rotation/enhance changes, from the
  // untouched original - never re-process an already-processed image.
  useEffect(() => {
    if (stage !== 'edit' || !originalRef.current) return;
    const rotated = rotation === 0 ? originalRef.current : drawRotated(originalRef.current, rotation);
    const working = document.createElement('canvas');
    working.width = rotated.width;
    working.height = rotated.height;
    const ctx = working.getContext('2d')!;
    ctx.drawImage(rotated, 0, 0);
    if (enhanced) enhance(ctx, working.width, working.height);
    working.toBlob((blob) => {
      if (blob) {
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
      }
    }, 'image/jpeg', 0.9);
  }, [stage, rotation, enhanced]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = () => {
    if (!originalRef.current) return;
    setPreparing(true);
    const rotated = rotation === 0 ? originalRef.current : drawRotated(originalRef.current, rotation);
    const sized = downscale(rotated, MAX_OUTPUT_DIMENSION);
    const working = document.createElement('canvas');
    working.width = sized.width;
    working.height = sized.height;
    const ctx = working.getContext('2d')!;
    ctx.drawImage(sized, 0, 0);
    if (enhanced) enhance(ctx, working.width, working.height);
    working.toBlob((blob) => {
      setPreparing(false);
      if (blob) onCapture(blob);
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 text-white shrink-0">
        <p className="font-display text-base tracking-tight">
          {stage === 'camera' ? 'Scan sheet music' : 'Review scan'}
        </p>
        <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-sm transition-colors" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {stage === 'camera' ? (
          cameraError ? (
            <div className="text-center px-8 text-white/80">
              <AlertCircle className="w-8 h-8 mx-auto mb-3" />
              <p className="text-sm">{cameraError}</p>
            </div>
          ) : (
            <video ref={videoRef} playsInline muted className="max-w-full max-h-full object-contain" />
          )
        ) : (
          previewUrl && <img src={previewUrl} alt="Scan preview" className="max-w-full max-h-full object-contain" />
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFilePicked(f);
        }}
      />

      <div className="shrink-0 px-6 py-5 space-y-4">
        {stage === 'camera' ? (
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex flex-col items-center gap-1.5 text-white/80 hover:text-white transition-colors"
            >
              <ImageUp className="w-6 h-6" />
              <span className="text-xs">Choose photo</span>
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              disabled={!!cameraError}
              className="w-16 h-16 rounded-full bg-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
              aria-label="Capture photo"
            />
            <div className="w-6" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 270) % 360)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white/90 border border-white/25 rounded-sm hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Rotate
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white/90 border border-white/25 rounded-sm hover:bg-white/10 transition-colors"
              >
                <RotateCw className="w-4 h-4" /> Rotate
              </button>
              <button
                type="button"
                onClick={() => setEnhanced((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-sm border transition-colors ${
                  enhanced ? 'bg-secondary text-secondary-foreground border-secondary' : 'text-white/90 border-white/25 hover:bg-white/10'
                }`}
              >
                <Wand2 className="w-4 h-4" /> {enhanced ? 'Enhanced' : 'Original'}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStage('camera')}
                className="flex-1 py-3 text-sm font-medium text-white/90 border border-white/25 rounded-sm hover:bg-white/10 transition-colors"
              >
                Retake
              </button>
              <button
                type="button"
                onClick={send}
                disabled={preparing}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-cta text-cta-foreground text-sm font-semibold rounded-sm hover:bg-cta/90 transition-colors disabled:opacity-40"
              >
                {preparing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {preparing ? 'Sending...' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
