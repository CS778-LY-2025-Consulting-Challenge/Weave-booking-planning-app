// Quick test to verify S3 access
require('dotenv').config({ path: '.env.local' });
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

async function testS3Access() {
  try {
    const testPath = 'home/background.jpg';
    console.log('Testing S3 access for:', testPath);
    console.log('Bucket:', process.env.NEXT_PUBLIC_AWS_S3_BUCKET);
    console.log('Region:', process.env.NEXT_PUBLIC_AWS_REGION);
    
    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
      Key: testPath,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log('\n✅ Successfully generated signed URL!');
    console.log('Signed URL:', signedUrl.substring(0, 100) + '...');
    
    // Test if the signed URL works
    const response = await fetch(signedUrl);
    console.log('\n✅ Fetch response status:', response.status);
    console.log('Content-Type:', response.headers.get('Content-Type'));
    console.log('Content-Length:', response.headers.get('Content-Length'));
    
    if (response.ok) {
      console.log('\n🎉 SUCCESS! S3 access is working correctly!');
    } else {
      console.log('\n❌ FAILED: S3 returned error:', response.statusText);
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.Code) console.error('Error Code:', error.Code);
  }
}

testS3Access();
