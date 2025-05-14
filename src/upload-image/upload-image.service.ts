import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse, UploadStream } from 'cloudinary';
import { CloudinaryResponse } from './upload-image.response'
const streamifier = require('streamifier')  

@Injectable()
export class UploadImageService {
    uploadFile(file: Express.Multer.File) : Promise<CloudinaryResponse> {
        return new Promise<CloudinaryResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (error) return reject(error)
                    if (!result) {
                        return reject(new Error('La subida a Cloudinary falló: No se obtuvo resultado y no se especificó un error.'));
                    }
                    resolve(result);
                }
            )
            streamifier.createReadStream(file.buffer).pipe(uploadStream)
        })
    }
}
