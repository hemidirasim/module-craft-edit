import { useState, useEffect, useRef, useCallback } from "react";

interface ImageResizerProps {
  imageElement: HTMLImageElement | null;
  onResize: (width: number, height: number) => void;
}

export const ImageResizer = ({ imageElement, onResize }: ImageResizerProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>("");
  const [imageRect, setImageRect] = useState<DOMRect | null>(null);
  const [startDimensions, setStartDimensions] = useState({ width: 0, height: 0 });
  const [startMousePos, setStartMousePos] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  // Update overlay position when image element changes
  useEffect(() => {
    if (imageElement) {
      const updatePosition = () => {
        const rect = imageElement.getBoundingClientRect();
        setImageRect(rect);
      };
      
      updatePosition();
      
      // Update position on scroll/resize
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [imageElement]);

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!imageElement) return;
    
    setIsResizing(true);
    setResizeHandle(handle);
    
    // Store initial dimensions and mouse position
    const currentWidth = imageElement.offsetWidth;
    const currentHeight = imageElement.offsetHeight;
    
    setStartDimensions({ width: currentWidth, height: currentHeight });
    setStartMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !imageElement) return;
    
    const deltaX = e.clientX - startMousePos.x;
    const deltaY = e.clientY - startMousePos.y;
    
    let newWidth = startDimensions.width;
    let newHeight = startDimensions.height;
    
    // Calculate new dimensions based on resize handle
    if (resizeHandle.includes('right')) {
      newWidth = Math.max(50, startDimensions.width + deltaX);
    }
    if (resizeHandle.includes('left')) {
      newWidth = Math.max(50, startDimensions.width - deltaX);
    }
    if (resizeHandle.includes('bottom')) {
      newHeight = Math.max(50, startDimensions.height + deltaY);
    }
    if (resizeHandle.includes('top')) {
      newHeight = Math.max(50, startDimensions.height - deltaY);
    }
    
    // Maintain aspect ratio for corner handles
    if (resizeHandle.includes('corner')) {
      const aspectRatio = startDimensions.width / startDimensions.height;
      
      if (resizeHandle.includes('right') || resizeHandle.includes('left')) {
        newHeight = newWidth / aspectRatio;
      } else {
        newWidth = newHeight * aspectRatio;
      }
    }
    
    // Apply new dimensions
    imageElement.style.width = newWidth + 'px';
    imageElement.style.height = newHeight + 'px';
    
    // Update overlay position
    const rect = imageElement.getBoundingClientRect();
    setImageRect(rect);
    
    // Notify parent of resize
    onResize(newWidth, newHeight);
  }, [isResizing, imageElement, startDimensions, startMousePos, resizeHandle, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setResizeHandle("");
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (!imageElement || !imageRect) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed pointer-events-none z-50"
      style={{
        left: imageRect.left,
        top: imageRect.top,
        width: imageRect.width,
        height: imageRect.height,
      }}
    >
      {/* Selection border */}
      <div className="absolute inset-0 border-2 border-primary pointer-events-none" />
      
      {/* Corner resize handles */}
      <div
        className="absolute w-3 h-3 bg-primary border border-white cursor-nw-resize pointer-events-auto hover:bg-primary/80"
        style={{ top: -6, left: -6 }}
        onMouseDown={(e) => handleMouseDown(e, 'top-left-corner')}
      />
      <div
        className="absolute w-3 h-3 bg-primary border border-white cursor-ne-resize pointer-events-auto hover:bg-primary/80"
        style={{ top: -6, right: -6 }}
        onMouseDown={(e) => handleMouseDown(e, 'top-right-corner')}
      />
      <div
        className="absolute w-3 h-3 bg-primary border border-white cursor-sw-resize pointer-events-auto hover:bg-primary/80"
        style={{ bottom: -6, left: -6 }}
        onMouseDown={(e) => handleMouseDown(e, 'bottom-left-corner')}
      />
      <div
        className="absolute w-3 h-3 bg-primary border border-white cursor-se-resize pointer-events-auto hover:bg-primary/80"
        style={{ bottom: -6, right: -6 }}
        onMouseDown={(e) => handleMouseDown(e, 'bottom-right-corner')}
      />
      
      {/* Edge resize handles */}
      <div
        className="absolute w-3 h-3 bg-primary border border-white cursor-n-resize pointer-events-auto hover:bg-primary/80"
        style={{ top: -6, left: '50%', transform: 'translateX(-50%)' }}
        onMouseDown={(e) => handleMouseDown(e, 'top')}
      />
      <div
        className="absolute w-3 h-3 bg-primary border border-white cursor-s-resize pointer-events-auto hover:bg-primary/80"
        style={{ bottom: -6, left: '50%', transform: 'translateX(-50%)' }}
        onMouseDown={(e) => handleMouseDown(e, 'bottom')}
      />
      <div
        className="absolute w-3 h-3 bg-primary border border-white cursor-w-resize pointer-events-auto hover:bg-primary/80"
        style={{ top: '50%', left: -6, transform: 'translateY(-50%)' }}
        onMouseDown={(e) => handleMouseDown(e, 'left')}
      />
      <div
        className="absolute w-3 h-3 bg-primary border border-white cursor-e-resize pointer-events-auto hover:bg-primary/80"
        style={{ top: '50%', right: -6, transform: 'translateY(-50%)' }}
        onMouseDown={(e) => handleMouseDown(e, 'right')}
      />
    </div>
  );
};