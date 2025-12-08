import { UTApi } from 'uploadthing/server';

export const uploadFile = async (file: File): Promise<string | null> => {
  try {
    const token = process.env.UPLOADTHING_TOKEN || '';
    const utapi = new UTApi({ token });
    const uploaded = await utapi.uploadFiles(file);
    return uploaded.data?.url || null;
  } catch (err) {
    console.error('File upload error:', err);
    return null;
  }
};
