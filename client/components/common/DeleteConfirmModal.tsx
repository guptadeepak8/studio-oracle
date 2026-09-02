"use client";

import React from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isDeleting?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-fade-in">
      <div className="bg-[#1c1c1f] border border-[#28282b] rounded-2xl w-full max-w-md p-6 space-y-4 text-left shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="h-4.5 w-4.5" />
            <span>Confirm Campaign Deletion</span>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md transition cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed font-sans">
          Are you sure you want to delete <strong className="text-white font-bold">{title}</strong>? This will permanently delete the campaign record and purge all collected audience comments and telemetry from ClickHouse.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#28282b]">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:bg-[#28282b] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4.5 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs transition"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Delete Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

