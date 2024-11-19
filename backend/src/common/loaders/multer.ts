import aws from 'aws-sdk';
import config from '../config/index';
import logger from './logger';
import fs from 'fs';

export const deleteFile = (key: string, bucketName: string = config.S3_BUCKET_NAME) => {
    try {
        aws.config.update({
            secretAccessKey: config.S3_SECRET,
            accessKeyId: config.S3_ACCESS_KEY,
            signatureVersion: 'v4',
        });

        let s3 = new aws.S3({
            region: config.S3_REGION,
        });

        const awsParams = {
            Bucket: bucketName,
            Key: key,
        };

        if (!key.includes('defaultImg')) {
            s3.deleteObject(awsParams, (e, data) => {
                if (e) {
                    logger.errorAndMail({ e });
                    return false;
                }
                else return true;
            });
        } else return true;
    } catch (error) {
        logger.errorAndMail({ e: error, routeName: "", functionName: "" });
    }
};

export const uploadFile = async (folder: string, file: any, fileType: string) => {
    try {
        aws.config.update({
            secretAccessKey: config.S3_SECRET,
            accessKeyId: config.S3_ACCESS_KEY,
            region: config.S3_REGION,
        });
        const ext = file?.name?.split('.').pop();
        const key = `${folder}/${Date.now()}.${ext}`;

        const putObject = await s3PutObject(file, key, fileType);
        if (putObject) return { key, url: `https://${config.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}` };
        else return false;
    } catch (err) {
        logger.errorAndMail({ e: err });
        throw err;
    }
};

const s3PutObject = (file: any, key: string, fileType: any, bucketName: string = config.S3_BUCKET_NAME) => {
    try {
        return new Promise((resolve, reject) => {
            fs.readFile(file.path, (error, fileContent) => {
                if (error) {
                    logger.errorAndMail({ e: error, routeName: "", functionName: "" });
                    return reject(false);
                }

                const params = {
                    ACL: 'public-read',
                    Body: fileContent,
                    Bucket: bucketName,
                    ContentDisposition: "inline",
                    ContentType: file.type || file.mime,
                    Key: key
                };

                const s3 = new aws.S3({
                    region: config.S3_REGION,
                });

                s3.putObject(params, (err) => {
                    if (err) return reject(false);
                    return resolve({ key, url: `https://${bucketName}.s3.amazonaws.com/${key}` });
                });
            })
        });
    } catch (error) {
        throw error;
    }
};

export const cleanUpS3 = async (imageKey: any, folder: string, toDelete: boolean = true) => {
    try {
        let deleteCount = 0, nextPage = true, marker = null, bucketObjects = [];

        aws.config.update({
            secretAccessKey: config.S3_SECRET,
            accessKeyId: config.S3_ACCESS_KEY,
            signatureVersion: 'v4',
        });

        let s3 = new aws.S3({
            region: config.S3_REGION,
        });

        while (nextPage) {
            const { Contents, IsTruncated } = await s3.listObjects({ Bucket: config.S3_BUCKET_NAME, Prefix: folder, Marker: marker }).promise();
            nextPage = IsTruncated;
            marker = Contents.slice(-1)[0].Key;
            bucketObjects.push(...Contents);
        }
        logger.info("Total objects in s3 folder: " + bucketObjects.length);
        bucketObjects.map(file => {
            if (!imageKey.includes(file.Key) && file.Key != 'defaultImg') {
                s3.deleteObject({ Bucket: config.S3_BUCKET_NAME, Key: file.Key }, function (err, data) {
                    if (err) throw err;
                })
                deleteCount++;
            }
        });
        logger.info("Total deleted objects in s3 folder: " + deleteCount);

    } catch (error) {
        throw error;
    }
};