// src/app/dashboard/page.tsx
import { UploadButton } from "@/components/ui/UploadButton";
import { FileList } from "@/components/FileList";
import { Folder, HardDrive } from "lucide-react";
import { headers } from 'next/headers';

// 获取文件列表
async function getDashboardData() {
    try {
        // 获取当前主机地址
        const headersList = await headers();
        const host = headersList.get('host');
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

        // 构建完整的 URL
        const apiUrl = `${protocol}://${host}/api/files`;

        console.log('Fetching files from:', apiUrl);

        const response = await fetch(apiUrl, {
            headers: {
                'Content-Type': 'application/json',
                // 传递其他必要的头信息
                ...Object.fromEntries(headersList.entries()),
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error('API Response not ok:', await response.text());
            throw new Error(`API responded with status ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching files:', error);
        // 返回空数组作为默认值
        return { files: [] };
    }
}

// 将组件设置为异步组件
export default async function DashboardPage() {
    const data = await getDashboardData();
    const files = data.files || [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">My Files</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage and organize your files
                    </p>
                </div>
                <UploadButton />
            </div>

            {/* Storage Status */}
            <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <HardDrive className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-600">Storage Used</span>
                    </div>
                    <span className="text-sm font-medium">
            {formatBytes(files.reduce((acc: number, file: {size?: number}) => acc + (file.size || 0), 0))} of 15 GB
          </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min((files.reduce((acc: number, file: {size?: number}) => acc + (file.size || 0), 0) / (15 * 1024 * 1024 * 1024)) * 100, 100)}%` }}
                    />
                </div>
            </div>

            {/* Quick Access */}
            <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900">Quick Access</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <button className="p-4 bg-white border rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                        <Folder className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-900">Recent Files</span>
                    </button>
                </div>
            </div>

            {/* File List */}
            <FileList files={files} />
        </div>
    );
}

// 辅助函数：格式化字节大小
function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}