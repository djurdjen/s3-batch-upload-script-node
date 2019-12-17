### Amazon S3 Batch upload script

Script to upload images to an Amazon S3 environment.

## Install

run `yarn` or `npm i`

Fill the `.env` with your S3 credentials

## Usage

Paste the images you want to upload in the `/uploads` directory.

run `yarn upload` or `npm upload` to start uploading your files

## About

To control memory usage, the script seperates the uploads in batches and applies a concurrency on the amount of asyncronous promises.
