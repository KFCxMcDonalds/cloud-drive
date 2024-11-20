// src/app/api/files/rename/route.ts
import { NextResponse } from 'next/server';
import {
    CopyObjectCommand,
    DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { r2Client, BUCKET_NAME } from '@/lib/r2';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
    try {
        const session = await auth();
        const userId = session?.userId;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { oldKey, newName } = await request.json();

        // 验证文件所有权
        if (!oldKey.startsWith(`${userId}/`)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 生成新的文件键，保持在同一用户目录下
        const oldKeyParts = oldKey.split('/');
        oldKeyParts.pop(); // 移除旧文件名
        const newKey = `${oldKeyParts.join('/')}/${newName}`;

        // 复制文件到新位置
        const copyCommand = new CopyObjectCommand({
            Bucket: BUCKET_NAME,
            CopySource: `${BUCKET_NAME}/${oldKey}`,
            Key: newKey,
        });

        await r2Client.send(copyCommand);

        // 删除旧文件
        const deleteCommand = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: oldKey,
        });

        await r2Client.send(deleteCommand);

        return NextResponse.json({
            message: 'File renamed successfully',
            newKey
        });

    } catch (error) {
        console.error('Rename error:', error);
        return NextResponse.json(
            { error: 'Failed to rename file' },
            { status: 500 }
        );
    }
}