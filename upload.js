require("dotenv").config();

const S3FS = require("s3fs");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const Promise = require("bluebird");

const s3fsImpl = new S3FS(process.env.AWS_BUCKET, {
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
let allFiles = [];

fs.readdir(path.join(__dirname, "uploads"), (err, fd) => {
  fd.forEach(function(filename) {
    if (!/^\..*/.test(filename)) {
      allFiles.push(filename);
    }
  });
  uploadImagesS3();
});
uploadImagesS3 = function(offset = 0) {
  const fraction = allFiles.slice(0 + offset, 100 + offset);
  return Promise.map(
    fraction,
    image => {
      return new Promise((resolve, reject) => {
        s3fsImpl.exists(image, exists => {
          if (exists) {
            console.log(image + " exists already");
            resolve();
          } else {
            fs.readFile(
              path.join(__dirname, "uploads/" + image), // determines the upload path in your s3 environment. you can change this to any directory you like
              (err, file) => {
                s3fsImpl.writeFile(
                  image,
                  file,
                  { ContentType: mime.lookup(image) },
                  function(err) {
                    if (err) {
                      reject(err);
                    }
                    resolve();
                    console.log(image + " uploaded");
                  }
                );
              }
            );
          }
        });
      });
    },
    { concurrency: 3 }
  ).then(() => {
    if (!fraction.length) {
      console.log("No more images available, upload job completed!");
      process.exit();
    } else {
      uploadImagesS3(offset + 100);
      console.log("batch completed");
    }
  });
};
