const fs = require('fs');
const path = require('path');
const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');

// Manually parse .env.local to avoid dependency issues
function loadEnv() {
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        const content = fs.readFileSync(envPath, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
                if (key && !key.startsWith('#')) {
                    env[key] = value;
                }
            }
        });
        return env;
    } catch (e) {
        console.error('Error reading .env.local:', e.message);
        return {};
    }
}

const env = loadEnv();

const client = new S3Client({
    region: env.AWS_REGION || env.NEXT_PUBLIC_AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        sessionToken: env.AWS_SESSION_TOKEN,
    },
});

async function fixCors() {
    const bucketName = env.AWS_BUCKET_NAME || env.NEXT_PUBLIC_AWS_S3_BUCKET;
    if (!bucketName) {
        console.error('❌ No bucket name found in environment variables.');
        return;
    }

    console.log(`Setting CORS for bucket: ${bucketName}`);

    const corsRules = [
        {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'HEAD', 'DELETE'],
            AllowedOrigins: ['*'], // For development. In prod, lock this down to the domain.
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3000,
        },
    ];

    try {
        const command = new PutBucketCorsCommand({
            Bucket: bucketName,
            CORSConfiguration: {
                CORSRules: corsRules,
            },
        });

        await client.send(command);
        console.log('✅ Successfully applied CORS configuration!');
        console.log(JSON.stringify(corsRules, null, 2));
    } catch (error) {
        console.error('❌ Error setting CORS configuration:', error.message);
        console.error(error);
    }
}

fixCors();
