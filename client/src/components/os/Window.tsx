"use client";

import { useRef, useCallback, useState, ReactNode } from "react";
import { motion } from "framer-motion";
import type { WindowState } from "@/lib/types";

interface WindowProps {
  state: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (w: number, h: number) => void;
  children: ReactNode;
}

export default function Window({
  state,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onMove,
  onResize,
  children,
}: WindowProps) {
  const dragRef = useRef<{ startX: number; startY: number; winX: number; winY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; winW: number; winH: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (state.maximized) return;
      e.preventDefault();
      onFocus();
      setIsDragging(true);
      dragRef.current = { startX: e.clientX, startY: e.clientY, winX: state.x, winY: state.y };

      const handleMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        onMove(dragRef.current.winX + dx, dragRef.current.winY + dy);
      };

      const handleUp = () => {
        setIsDragging(false);
        dragRef.current = null;
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
      };

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    },
    [state, onFocus, onMove]
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (state.maximized) return;
      e.preventDefault();
      e.stopPropagation();
      resizeRef.current = { startX: e.clientX, startY: e.clientY, winW: state.width, winH: state.height };

      const handleMove = (ev: MouseEvent) => {
        if (!resizeRef.current) return;
        const dw = ev.clientX - resizeRef.current.startX;
        const dh = ev.clientY - resizeRef.current.startY;
        onResize(
          Math.max(320, resizeRef.current.winW + dw),
          Math.max(200, resizeRef.current.winH + dh)
        );
      };

      const handleUp = () => {
        resizeRef.current = null;
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
      };

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    },
    [state, onResize]
  );

  if (state.minimized || !state.isOpen) return null;

  const style = state.maximized
    ? { top: 0, left: 0, width: "100%", height: "calc(100% - 48px)" }
    : { top: state.y, left: state.x, width: state.width, height: state.height };

  return (
    <motion.div
      className={`absolute flex flex-col bg-os-surface border border-os-border rounded-lg overflow-hidden shadow-2xl shadow-black/50 ${
        isDragging ? "select-none" : ""
      }`}
      style={{ ...style, zIndex: state.zIndex }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      onMouseDown={onFocus}
    >
      {/* Title bar */}
      <div
        className="window-handle flex items-center h-10 px-3 bg-os-bg border-b border-os-border shrink-0"
        onMouseDown={handleDragStart}
        onDoubleClick={onMaximize}
      >
        <span className="text-base mr-2">{state.icon}</span>
        <span className="text-sm font-medium text-os-text/90 truncate flex-1">
          {state.title}
        </span>
        <div className="flex items-center gap-1.5 ml-2">
          <button
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="w-3 h-3 rounded-full bg-os-amber hover:brightness-110 transition-all"
            title="Minimize"
          />
          <button
            onClick={(e) => { e.stopPropagation(); onMaximize(); }}
            className="w-3 h-3 rounded-full bg-os-green hover:brightness-110 transition-all"
            title="Maximize"
          />
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-3 h-3 rounded-full bg-os-red hover:brightness-110 transition-all"
            title="Close"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">{children}</div>

      {/* Resize handle */}
      {!state.maximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeStart}
        >
          <svg className="w-3 h-3 text-os-muted/40 absolute bottom-0.5 right-0.5" viewBox="0 0 12 12">
            <path d="M11 1v10H1" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 5v6H5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
