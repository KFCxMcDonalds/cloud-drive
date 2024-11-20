// src/components/ui/UploadButton.tsx
'use client';

import { Upload, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function UploadButton() {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState<number[]>([]);
    const router = useRouter();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const files = Array.from(e.target.files);
        setProgress(new Array(files.length).fill(0));
        setUploading(true);

        try {
            await Promise.all(files.map((file, index) => uploadFile(file, index)));
            router.refresh(); // 刷新页面以显示新上传的文件
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload files. Please try again.');
        } finally {
            setUploading(false);
            setProgress([]);
            // 清除文件输入，允许重新选择相同的文件
            e.target.value = '';
        }
    };

    const uploadFile = async (file: File, index: number) => {
        try {
            // 1. 获取预签名 URL
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type,
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Failed to get upload URL: ${errorData}`);
            }

            const { uploadUrl, fileKey } = await response.json();

            // 2. 使用预签名 URL 上传文件
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            });

            if (!uploadResponse.ok) {
                throw new Error(`Failed to upload file: ${file.name}`);
            }

            return fileKey;

        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    };

    return (
        <div className="flex items-center gap-2">
            <label
                htmlFor="file-upload"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer
          ${uploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'} 
          text-white transition-colors`}
            >
                {uploading ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Uploading...</span>
                    </>
                ) : (
                    <>
                        <Upload className="h-5 w-5" />
                        <span>Upload Files</span>
                    </>
                )}
                <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                    disabled={uploading}
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt" // 限制文件类型
                />
            </label>
        </div>
    );
}