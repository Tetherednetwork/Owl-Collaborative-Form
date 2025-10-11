import React, { useRef, useEffect, useState, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { TrashIcon } from './icons/TrashIcon';
import { UndoIcon } from './icons/UndoIcon';

interface SignaturePadProps {
    value?: string;
    onChange: (dataUrl: string) => void;
    penColor?: string;
    backgroundColor?: string;
    disabled?: boolean;
}

type Point = { x: number; y: number };

const SignaturePad: React.FC<SignaturePadProps> = ({
    value,
    onChange,
    penColor = '#000000',
    backgroundColor = '#ffffff',
    disabled = false
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokes, setStrokes] = useState<Point[][]>([]);
    const currentStrokeRef = useRef<Point[]>([]);

    const getCanvasContext = () => {
        const canvas = canvasRef.current;
        return canvas ? canvas.getContext('2d') : null;
    };

    const redrawCanvas = (strokesToDraw: Point[][]) => {
        const ctx = getCanvasContext();
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = penColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        strokesToDraw.forEach(stroke => {
            if (stroke.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(stroke[0].x, stroke[0].y);
            for (let i = 1; i < stroke.length; i++) {
                ctx.lineTo(stroke[i].x, stroke[i].y);
            }
            ctx.stroke();
        });
    };
    
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = getCanvasContext();
        if (!canvas || !ctx) return;

        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        
        if (value) {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = value;
            setStrokes([]);
        } else {
             redrawCanvas(strokes);
        }
    }, [penColor, backgroundColor, value]);

    useEffect(() => {
        if (!value) {
            const canvas = canvasRef.current;
            if (canvas) {
                const dataUrl = strokes.length > 0 ? canvas.toDataURL('image/png') : '';
                onChange(dataUrl);
            }
        }
    }, [strokes, value, onChange]);

    const getCoords = (e: ReactMouseEvent | ReactTouchEvent): Point | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        
        if ('touches' in e.nativeEvent) {
            if (e.nativeEvent.touches.length === 0) return null;
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

    const startDrawing = (e: ReactMouseEvent | ReactTouchEvent) => {
        if (disabled || value) return;
        e.preventDefault();
        const coords = getCoords(e);
        if (!coords) return;
        
        setIsDrawing(true);
        currentStrokeRef.current = [coords];
    };

    const draw = (e: ReactMouseEvent | ReactTouchEvent) => {
        if (!isDrawing || disabled || value) return;
        e.preventDefault();

        const ctx = getCanvasContext();
        const coords = getCoords(e);
        if (!ctx || !coords) return;
        
        const prevPoint = currentStrokeRef.current[currentStrokeRef.current.length - 1];
        
        ctx.strokeStyle = penColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(prevPoint.x, prevPoint.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        
        currentStrokeRef.current.push(coords);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (currentStrokeRef.current.length > 1) {
            setStrokes(prevStrokes => [...prevStrokes, currentStrokeRef.current]);
        }
        currentStrokeRef.current = [];
    };

    const handleClear = () => {
        if (disabled) return;
        setStrokes([]);
        const canvas = canvasRef.current;
        const ctx = getCanvasContext();
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleUndo = () => {
        if (disabled) return;
        const newStrokes = strokes.slice(0, -1);
        redrawCanvas(newStrokes);
        setStrokes(newStrokes);
    };

    const hasDrawn = strokes.length > 0 || !!value;

    return (
        <div 
          className="relative w-full aspect-[2/1] border border-slate-300 rounded-md touch-none overflow-hidden"
          style={{ backgroundColor: backgroundColor }}
        >
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full"
            />
             {!hasDrawn && !disabled && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 italic">
                    Sign here
                </div>
            )}
            {!disabled && hasDrawn && (
                <div className="absolute top-2 right-2 flex gap-1 bg-white/50 backdrop-blur-sm rounded-lg p-1">
                    <button
                        type="button"
                        onClick={handleUndo}
                        disabled={strokes.length === 0}
                        className="p-1.5 text-slate-600 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Undo last stroke"
                    >
                        <UndoIcon />
                    </button>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-1.5 text-slate-600 rounded-md hover:bg-slate-200"
                        aria-label="Clear signature"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default SignaturePad;