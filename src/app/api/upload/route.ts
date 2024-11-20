// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, BUCKET_NAME } from '@/lib/r2';
import { auth } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        // 检查认证
        const session = await auth();
        const userId = session?.userId;

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 解析请求体
        const data = await request.json().catch(e => {
            console.error('Failed to parse request body:', e);
            return null;
        });

        if (!data || !data.filename || !data.contentType) {
            return NextResponse.json(
                { error: 'Invalid request: Missing filename or contentType' },
                { status: 400 }
            );
        }

        const { filename, contentType } = data;

        // 生成安全的文件名
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `${userId}/${uuidv4()}-${sanitizedFilename}`;

        console.log('Generating presigned URL for:', {
            bucket: BUCKET_NAME,
            key,
            contentType
        });

        // 创建预签名 URL
        const putObjectCommand = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });

        try {
            const signedUrl = await getSignedUrl(r2Client, putObjectCommand, {
                expiresIn: 3600,
            });

            console.log('Generated signed URL for:', key);

            return NextResponse.json({
                uploadUrl: signedUrl,
                fileKey: key
            });

        } catch (signedUrlError) {
            console.error('Failed to generate signed URL:', signedUrlError);
            return NextResponse.json(
                { error: 'Failed to generate upload URL' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Upload endpoint error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// 增加配置以处理较大的文件
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '100mb',
        },
    },
};