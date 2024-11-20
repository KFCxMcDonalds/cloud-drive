// src/components/FileList.tsx
'use client';

import { Folder, Image, FileText, Film, Music } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FileActionsMenu } from "./FileActionsMenu";
import { useRouter } from "next/navigation";

type FileItem = {
    id: string;
    name: string;
    type: string;
    size: number;
    updatedAt: Date;
};

function getFileIcon(type: string) {
    switch (type) {
        case 'image':
            return <Image className="h-5 w-5 text-blue-500" />;
        case 'video':
            return <Film className="h-5 w-5 text-purple-500" />;
        case 'audio':
            return <Music className="h-5 w-5 text-green-500" />;
        case 'folder':
            return <Folder className="h-5 w-5 text-yellow-500" />;
        default:
            return <FileText className="h-5 w-5 text-gray-500" />;
    }
}

function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function FileList({ files = [] }: { files: FileItem[] }) {
    const router = useRouter();

    const handleDeleteComplete = () => {
        router.refresh(); // 刷新页面以更新文件列表
    };

    return (
        <div className="mt-6">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified</th>
                        <th className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {files.map((file) => (
                        <tr key={file.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    {getFileIcon(file.type)}
                                    <span className="ml-2 text-sm text-gray-900">{file.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatFileSize(file.size)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDistanceToNow(new Date(file.updatedAt), { addSuffix: true })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <FileActionsMenu
                                    fileId={file.id}
                                    fileName={file.name}
                                    onDeleteComplete={handleDeleteComplete}
                                />
                            </td>
                        </tr>
                    ))}
                    {files.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                No files uploaded yet
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}