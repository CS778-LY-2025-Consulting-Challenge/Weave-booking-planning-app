import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { auth } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        sessionToken: process.env.AWS_SESSION_TOKEN,
    },
});

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fileName, fileType } = await req.json();

        if (!fileName || !fileType) {
            return NextResponse.json({ error: 'Missing fileName or fileType' }, { status: 400 });
        }

        // Sanitize file name and create a unique key
        const uniqueId = uuidv4();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `trip-media/${userId}/${uniqueId}-${sanitizedFileName}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME || process.env.NEXT_PUBLIC_AWS_S3_BUCKET!,
            Key: key,
            ContentType: fileType,
            // Optional: Add metadata
            Metadata: {
                userId: userId,
            },
        });

        // Generate signed URL with shorter expiration (15 minutes) to avoid session token expiration
        // When using STS temporary credentials, the URL validity is limited by the session token lifetime
        const expirationSeconds = 900; // 15 minutes
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: expirationSeconds });

        console.log(`Generated presigned URL for file: ${fileName}, expires in: ${expirationSeconds}s`);

        return NextResponse.json({ uploadUrl, key });
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        return NextResponse.json(
            { error: 'Failed to generate upload URL' },
            { status: 500 }
        );
    }
}
