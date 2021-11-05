const AWS = require("aws-sdk");

AWS.config.update({ region: process.env.AWS_REGION });

export const S3_BUCKET = process.env.AWS_BUCKETNAME;
export const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEYID,
  secretAccessKey: process.env.AWS_SECRET_ACCESSKEY,
  region: process.env.AWS_REGION,
  signatureVersion: "v4",
  //   useAccelerateEndpoint: true
});
