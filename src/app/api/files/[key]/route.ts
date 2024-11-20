import { NextResponse } from 'next/server';
import {
    GetObjectCommand,
    DeleteObjectCommand,
    GetObjectCommandInput
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, BUCKET_NAME } from '@/lib/r2';
import { auth } from '@clerk/nextjs/server';

// 获取下载 URL
export async function GET(
    request: Request,
    { params }: { params: { key: string } }
) {
    try {
        const session = await auth();
        const userId = session?.userId;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 解码文件键
        const fileKey = decodeURIComponent(params.key);

        // 验证文件所有权
        if (!fileKey.startsWith(`${userId}/`)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
        });

        const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

        return NextResponse.json({ downloadUrl: signedUrl });

    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json(
            { error: 'Failed to generate download URL' },
            { status: 500 }
        );
    }
}

// 删除文件
export async function DELETE(
    request: Request,
    { params }: { params: { key: string } }
) {
    try {
        const session = await auth();
        const userId = session?.userId;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 解码文件键
        const fileKey = decodeURIComponent(params.key);

        // 验证文件所有权
        if (!fileKey.startsWith(`${userId}/`)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
        });

        await r2Client.send(command);

        return NextResponse.json({ message: 'File deleted successfully' });

    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { error: 'Failed to delete file' },
            { status: 500 }
        );
    }
}