// src/components/RenameDialog.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface RenameDialogProps {
    isOpen: boolean;
    fileName: string;
    onClose: () => void;
    onRename: (newName: string) => Promise<void>;
}

export function RenameDialog({ isOpen, fileName, onClose, onRename }: RenameDialogProps) {
    const [newName, setNewName] = useState(fileName);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // 当对话框打开时设置初始值并聚焦
    useEffect(() => {
        if (isOpen) {
            setNewName(fileName);
            // 等待对话框动画完成后聚焦
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.select();
                }
            }, 100);
        }
    }, [isOpen, fileName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newName.trim() === '') {
            alert('File name cannot be empty');
            return;
        }

        if (newName === fileName) {
            onClose();
            return;
        }

        try {
            setIsLoading(true);
            await onRename(newName.trim());
            onClose();
        } catch (error) {
            console.error('Rename error:', error);
            alert('Failed to rename file');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="absolute right-4 top-4">
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-3 text-center sm:mt-0 sm:text-left">
                            <h3 className="text-lg font-semibold leading-6 text-gray-900">
                                Rename File
                            </h3>

                            <form onSubmit={handleSubmit} className="mt-4">
                                <div className="mt-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto
                      ${isLoading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-500'}`}
                                    >
                                        {isLoading ? 'Renaming...' : 'Rename'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}