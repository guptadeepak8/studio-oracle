"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "../ui";

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
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            disabled={isDeleting}
            className="text-zinc-500 hover:text-zinc-300"
          >
            <X className="h-4.5 w-4.5" />
          </Button>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed font-sans">
          Are you sure you want to delete <strong className="text-white font-bold">{title}</strong>?
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#28282b]">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            isLoading={isDeleting}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Delete Permanently
          </Button>
        </div>
      </div>
    </div>
  );
}
