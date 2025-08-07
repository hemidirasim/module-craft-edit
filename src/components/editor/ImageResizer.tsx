import { useState, useEffect, useRef, useCallback } from "react";

interface ImageResizerProps {
  imageElement: HTMLImageElement | null;
  onResize: (width: number, height: number) => void;
  editorRef?: React.RefObject<HTMLDivElement>;
}

export const ImageResizer = ({ imageElement, onResize, editorRef }: ImageResizerProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>("");
  const [imageRect, setImageRect] = useState<DOMRect | null>(null);
  const [startDimensions, setStartDimensions] = useState({ width: 0, height: 0 });
  const [startMousePos, setStartMousePos] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  // Update overlay position when image element changes
  useEffect(() => {
    if (imageElement && editorRef?.current) {
      const updatePosition = () => {
        const editorRect = editorRef.current?.getBoundingClientRect();
        const imageRect = imageElement.getBoundingClientRect();
        
        // Calculate position relative to the editor
        if (editorRect && imageRect) {
          // Check if image is within editor bounds
          const isWithinEditor = (
            imageRect.left >= editorRect.left &&
            imageRect.right <= editorRect.right &&
            imageRect.top >= editorRect.top &&
            imageRect.bottom <= editorRect.bottom
          );
          
          if (isWithinEditor) {
            setImageRect(imageRect);
          } else {
            setImageRect(null); // Hide resizer if image is outside editor
          }
        }
      };
      
      updatePosition();
      
      // Update position on scroll/resize
      const handleUpdate = () => {
        requestAnimationFrame(updatePosition);
      };
      
      window.addEventListener('scroll', handleUpdate, { passive: true });
      window.addEventListener('resize', handleUpdate, { passive: true });
      
      return () => {
        window.removeEventListener('scroll', handleUpdate);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [imageElement, editorRef]);

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    console.log('🎯 ImageResizer handleMouseDown triggered:', handle);
    e.preventDefault();
    e.stopPropagation();
    
    if (!imageElement) {
      console.log('❌ No imageElement found');
      return;
    }
    
    console.log('✅ Starting resize operation');
    setIsResizing(true);
    setResizeHandle(handle);
    
    // Store initial dimensions and mouse position
    const currentWidth = imageElement.offsetWidth;
    const currentHeight = imageElement.offsetHeight;
    
    console.log('📐 Initial dimensions:', { width: currentWidth, height: currentHeight });
    console.log('🖱️ Initial mouse position:', { x: e.clientX, y: e.clientY });
    
    setStartDimensions({ width: currentWidth, height: currentHeight });
    setStartMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !imageElement) return;
    
    console.log('🔄 Mouse move during resize:', { x: e.clientX, y: e.clientY });
    
    const deltaX = e.clientX - startMousePos.x;
    const deltaY = e.clientY - startMousePos.y;
    
    console.log('📊 Delta values:', { deltaX, deltaY });
    
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
    
    console.log('📏 New dimensions calculated:', { newWidth, newHeight });
    
    // Apply new dimensions
    imageElement.style.width = newWidth + 'px';
    imageElement.style.height = newHeight + 'px';
    
    console.log('✅ Applied new dimensions to image');
    
    // Update overlay position
    const rect = imageElement.getBoundingClientRect();
    setImageRect(rect);
    
    // Notify parent of resize
    onResize(newWidth, newHeight);
  }, [isResizing, imageElement, startDimensions, startMousePos, resizeHandle, onResize]);

  const handleMouseUp = useCallback(() => {
    console.log('🏁 Mouse up - ending resize operation');
    setIsResizing(false);
    setResizeHandle("");
  }, []);

  useEffect(() => {
    if (isResizing) {
      console.log('🎧 Adding global mouse event listeners');
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        console.log('🔇 Removing global mouse event listeners');
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