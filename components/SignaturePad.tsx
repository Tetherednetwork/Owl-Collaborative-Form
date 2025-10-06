import React, { useRef, useEffect, useState } from 'react';

interface SignaturePadProps {
    value?: string;
    onChange: (dataUrl: string) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ value, onChange }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (value) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0);
            img.src = value;
            setHasDrawn(true);
        }

    }, [value]);

    const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        if ('touches' in e.nativeEvent) {
            return {
                x: e.nativeEvent.touches[0].clientX - rect.left,
                y: e.nativeEvent.touches[0].clientY - rect.top,
            };
        }
        return {
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY,
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.style.cursor = 'crosshair';

        const { x, y } = getCoords(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
        setHasDrawn(true);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        e.preventDefault();
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const { x, y } = getCoords(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        const canvas = canvasRef.current;
        if (isDrawing && canvas) {
            onChange(canvas.toDataURL('image/png'));
        }
        if (canvas) {
            canvas.style.cursor = 'default';
        }
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onChange('');
        setHasDrawn(false);
    };

    return (
        <div className="relative w-full aspect-[2/1] border border-slate-300 rounded-md bg-white touch-none">
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full rounded-md"
            />
             {!hasDrawn && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-500">
                    Sign here
                </div>
            )}
            <button
                type="button"
                onClick={clearCanvas}
                className="absolute top-2 right-2 px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200"
            >
                Clear
            </button>
        </div>
    );
};

export default SignaturePad;