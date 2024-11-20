// src/app/api/files/route.ts
import { NextResponse } from 'next/server';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { r2Client, BUCKET_NAME } from '@/lib/r2';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    try {
        const session = await auth();
        const userId = session?.userId;

        if (!userId) {
            console.log('Unauthorized access attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 检查 R2 客户端和 bucket 配置
        if (!r2Client || !BUCKET_NAME) {
            console.error('R2 configuration missing');
            return NextResponse.json(
                { error: 'Storage configuration error' },
                { status: 500 }
            );
        }

        console.log('Listing files for user:', userId, 'in bucket:', BUCKET_NAME);

        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: `${userId}/`,
        });

        try {
            const response = await r2Client.send(command);
            console.log('R2 response received, objects count:', response.Contents?.length);

            const files = response.Contents?.map(object => ({
                id: object.Key,
                name: object.Key?.split('/').pop() || '',
                size: object.Size || 0,
                updatedAt: object.LastModified,
                type: getFileType(object.Key?.split('.').pop() || ''),
            })) || [];

            return NextResponse.json({ files });

        } catch (r2Error) {
            console.error('R2 error:', r2Error);
            return NextResponse.json(
                { error: 'Failed to access storage', details: r2Error instanceof Error? r2Error.message : 'Unkown Error' },
                { status: 503 }
            );
        }

    } catch (error) {
        console.error('Files API error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error? error.message : 'Unkown Error' },
            { status: 500 }
        );
    }
}

function getFileType(extension: string): string {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const videoExtensions = ['mp4', 'webm', 'avi', 'mov'];
    const audioExtensions = ['mp3', 'wav', 'ogg'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt'];

    extension = extension.toLowerCase();

    if (imageExtensions.includes(extension)) return 'image';
    if (videoExtensions.includes(extension)) return 'video';
    if (audioExtensions.includes(extension)) return 'audio';
    if (documentExtensions.includes(extension)) return 'document';

    return 'other';
}

export const config = {
    api: {
        responseLimit: '8mb',
    },
};