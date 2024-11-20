// src/components/FileActionsMenu.tsx
'use client';

import {useState, useRef, useEffect} from 'react';
import {Download, Trash2, MoreVertical, Edit} from 'lucide-react';
import {RenameDialog} from './RenameDialog';

interface FileActionsMenuProps {
    fileId: string,
    fileName: string,
    onDeleteComplete: () => void,
    onPreview?: () => void
}

export function FileActionsMenu({fileId, fileName, onDeleteComplete}: FileActionsMenuProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState<'bottom' | 'top'>('bottom');
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // 计算菜单位置
    useEffect(() => {
        if (isMenuOpen && menuRef.current && buttonRef.current) {
            const menuRect = menuRef.current.getBoundingClientRect();
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // 检查底部是否有足够空间
            if (buttonRect.bottom + menuRect.height > viewportHeight) {
                setMenuPosition('top');
            } else {
                setMenuPosition('bottom');
            }
        }
    }, [isMenuOpen]);

    const handleDownload = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/files/${encodeURIComponent(fileId)}`);

            if (!response.ok) {
                throw new Error('Failed to get download URL');
            }

            const {downloadUrl} = await response.json();

            // 创建一个隐藏的 a 标签来触发下载
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download file');
        } finally {
            setIsLoading(false);
            setIsMenuOpen(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this file?')) {
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`/api/files/${encodeURIComponent(fileId)}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete file');
            }

            onDeleteComplete();
            setIsMenuOpen(false);

        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete file');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRename = async (newName: string) => {
        try {
            const response = await fetch('/api/files/rename', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldKey: fileId,
                    newName: newName,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to rename file');
            }

            onDeleteComplete(); // 刷新文件列表
            setIsMenuOpen(false);
        } catch (error) {
            console.error('Rename error:', error);
            throw error;
        }
    };

    // 处理点击外部关闭菜单
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                menuRef.current &&
                buttonRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        }

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isMenuOpen]);

    return (
        <>
            <div className="relative">
                <button
                    ref={buttonRef}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-1 rounded-full hover:bg-gray-100"
                    disabled={isLoading}
                >
                    <MoreVertical className="h-5 w-5 text-gray-500"/>
                </button>

                {isMenuOpen && (
                    <div
                        ref={menuRef}
                        className={`fixed z-50 w-48 bg-white rounded-md shadow-lg border
              ${menuPosition === 'top' ? 'bottom-full mb-1' : 'mt-1'}
            `}
                        style={{
                            right: '0',
                            maxHeight: '200px',
                            overflow: 'auto'
                        }}
                    >
                        <div className="py-1">
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    setIsRenameDialogOpen(true);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                                <Edit className="h-4 w-4 mr-2"/>
                                Rename
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={isLoading}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                                <Download className="h-4 w-4 mr-2"/>
                                Download
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center"
                            >
                                <Trash2 className="h-4 w-4 mr-2"/>
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <RenameDialog
                isOpen={isRenameDialogOpen}
                fileName={fileName}
                onClose={() => setIsRenameDialogOpen(false)}
                onRename={handleRename}
            />
        </>
    );
}