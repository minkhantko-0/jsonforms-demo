import { UTApi } from 'uploadthing/server';

export const uploadFile = async (file: File): Promise<string | null> => {
  try {
    const token = process.env.UPLOADTHING_TOKEN || '';
    const utapi = new UTApi({ token });
    
    // Convert File to Blob if needed
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    const fileToUpload = new File([blob], file.name, { type: file.type });
    
    const uploaded = await utapi.uploadFiles(fileToUpload);
    
    if (uploaded.error) {
      console.error('UploadThing error:', uploaded.error);
      return null;
    }
    
    return uploaded.data?.url || null;
  } catch (err) {
    console.error('File upload error:', err);
    return null;
  }
};

export const deleteFile = async (url: string): Promise<void> => {
  try {
    const token = process.env.UPLOADTHING_TOKEN || '';
    const utapi = new UTApi({ token });
    const fileKey = url.split('/').pop();
    if (fileKey) {
      await utapi.deleteFiles(fileKey);
    }
  } catch (err) {
    console.error('File delete error:', err);
  }
};
