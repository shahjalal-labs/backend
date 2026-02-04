"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadInSpace = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const path_1 = __importDefault(require("path"));
/* const DO_CONFIG = {
  endpoint: "https://api.zenexcloud.com",

  region: "s3v4",

  useSSL: false,

  credentials: {
    accessKeyId: "Be7vSXLGn1EuMzy55jLO",

    secretAccessKey: "Gw2pW1gqVAG0GH8SXzrRJXi1036IMv5dBdgcwJme",
  },

  spaceName: "emdadullah",
}; */
const DO_CONFIG = {
    endpoint: "https://bridge-system.atl1.digitaloceanspaces.com",
    region: "s3v4",
    useSSL: false,
    credentials: {
        accessKeyId: "DO00KCDPKH7BEVUAEBM3",
        secretAccessKey: "RF9lyevyc4fyUV+WfYPFsTtWyP8mjh45BZe/oYQ5OpM",
    },
    spaceName: "bridge-system",
};
const s3Config = {
    endpoint: DO_CONFIG.endpoint,
    region: DO_CONFIG.region,
    credentials: DO_CONFIG.credentials,
    forcePathStyle: true,
};
const s3 = new client_s3_1.S3Client(s3Config);
const MAX_FILE_SIZE = 3000 * 1024 * 1024; // 3000 MB
// Allowed MIME types
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mpeg",
    "video/mp4",
    "video/x-matroska",
    "audio/mpeg",
    "application/zip",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
/**
 * Uploads a file buffer to DigitalOcean Spaces and returns the file URL.
 * @param {Express.Multer.File} file - The file object from multer
 * @returns {Promise<string>} - The URL of the uploaded file
 * @throws {Error} - If file validation fails or upload fails
 */
const uploadInSpace = async (file, folder) => {
    try {
        if (!file) {
            throw new Error("No file provided");
        }
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        }
        // Validate file type
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new Error("File type not allowed");
        }
        // Generate a unique filename with original extension
        const fileExtension = path_1.default.extname(file.originalname);
        const fileName = `uploads/${folder}/${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 15)}${fileExtension}`;
        const uploadParams = {
            Bucket: DO_CONFIG.spaceName,
            Key: fileName,
            Body: file.buffer,
            ACL: "public-read",
            ContentType: file.mimetype,
        };
        const upload = new lib_storage_1.Upload({
            client: s3,
            params: uploadParams,
        });
        const data = await upload.done();
        const fileUrl = data.Location ||
            `${DO_CONFIG.endpoint}/${DO_CONFIG.spaceName}/${fileName}`;
        return fileUrl;
    }
    catch (error) {
        // console.error("Error uploading file to DigitalOcean Spaces:", error);
        throw new Error(error instanceof Error
            ? `Failed to upload file: ${error.message}`
            : "Failed to upload file to DigitalOcean Spaces");
    }
};
exports.uploadInSpace = uploadInSpace;
