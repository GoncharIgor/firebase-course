import * as functions from 'firebase-functions';
import * as path from 'path';
import * as rimraf from 'rimraf';
import * as os from 'os';
import * as mkdirp from 'mkdirp-promise';
import {spawn} from 'child-process-promise'; // run CLI promise-based commands
import {Storage} from '@google-cloud/storage';
import {db} from './init';

const googleStorageService = new Storage();

export const resizeThumbnail = functions.storage.object()
    .onFinalize(async (object, context) => {

        // FB path, nol local one
        const fileFullPath = object.name || '';
        const contentType = object.contentType || '';
        const fileDir = path.dirname(fileFullPath); // dir name, without fileName
        const fileName = path.basename(fileFullPath);
        const temporaryLocalDirectory = path.join(os.tmpdir(), fileDir); // name of global temporary local directory

        console.log('Thumbnail generation started: ', fileFullPath, fileDir, fileName);

        if (!contentType.startsWith('image/') || fileName.startsWith('_thumb')) {
            console.log('Exiting image processing');

            return null;
        }

        await mkdirp(temporaryLocalDirectory); // recursively creates directories, if they are not present

        const bucket = googleStorageService.bucket(object.bucket);
        const originalImageFile = bucket.file(fileFullPath);

        const tempLocalOutputFile = path.join(os.tmpdir(), fileFullPath);
        console.log('Downloading image to: ', tempLocalOutputFile);

        await originalImageFile.download({destination: tempLocalOutputFile});

        // Generate thumbnail with ImageMagick

        const outputFilePath = path.join(fileDir, `thumb_${fileName}`);
        const outputFile = path.join(os.tmpdir(), outputFilePath);

        console.log('Generation a thumbnail to: ', outputFile);

        // tempLocalOutputFile - original file, uploaded by user and downloaded to local file system
        // example of CLI command: convert original-image.png -thumbnail 510x287 > thumb_original-image.png
        // convert - ImageMagic CLI command, that's already installed on FB env
        await spawn('convert', [tempLocalOutputFile, '-thumbnail', '510x287 >', outputFile], {capture: ['stdout', 'stderr']});

        // Upload thumbnail back to storage
        const metadata = {
            contentType: object.contentType,
            // max-age - lifetime of image on the lovel of user machine
            // s-maxage - lifetime of image on the level of CDN
            cacheControl: 'public,max-age=2592000, s-maxage=2592000'
        };

        console.log('Uploading thumbnail to storage: ', outputFile, outputFilePath);

        const uploadedFiles = await bucket.upload(outputFile, {destination: outputFilePath, metadata});

        // clear up: deleting files locally
        rimraf.sync(temporaryLocalDirectory);

        // deleting file, originally uploaded by user
        await originalImageFile.delete();

        // crete link to a new uploaded thumbnail file in the storage
        const thumbnail = uploadedFiles[0];
        const uploadedImageUrl = await thumbnail.getSignedUrl({action: 'read', expires: new Date(3000, 0, 1)});

        console.log('Generated image url: ', uploadedImageUrl);

        // save thumbnail link in the DB
        const courseId = fileFullPath.split('/')[0];

        console.log('Saving url to DB with course ID: ', courseId);

        return db.doc(`courses/${courseId}`).update({uploadedImageUrl}); // returns Promise
    });
