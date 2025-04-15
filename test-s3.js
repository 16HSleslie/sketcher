const { S3Client, ListObjectsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

// Create S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const bucketName = process.env.AWS_BUCKET_NAME;

// Function to list objects in the bucket
async function listObjects() {
  const command = new ListObjectsCommand({
    Bucket: bucketName,
    MaxKeys: 5
  });

  try {
    const response = await s3Client.send(command);
    console.log('Successfully accessed S3 bucket. Contents:');
    if (response.Contents.length === 0) {
      console.log('Bucket is empty');
    } else {
      response.Contents.forEach(item => {
        console.log(` - ${item.Key}`);
      });
    }
    return true;
  } catch (error) {
    console.error('Error accessing S3 bucket:', error.message);
    return false;
  }
}

// Run the test
listObjects().then(success => {
  console.log(`S3 access test ${success ? 'PASSED' : 'FAILED'}`);
  process.exit(success ? 0 : 1);
}); 