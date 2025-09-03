import { fileAPI } from './api';
import { Alert } from 'react-native';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface FileUploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
}

export class FileUploadService {
  static async uploadFile(
    file: { uri: string; type: string; name: string },
    chatId?: number,
    options?: FileUploadOptions
  ): Promise<any> {
    try {
      const formData = new FormData();
      
      // Préparer le fichier pour l'upload
      const fileData = {
        uri: file.uri,
        type: this.getMimeType(file.name, file.type),
        name: file.name,
      } as any;

      formData.append('file', fileData);
      
      if (chatId) {
        formData.append('chatId', chatId.toString());
      }

      console.log('Début de l\'upload du fichier:', file.name);
      
      // Simuler le progrès (dans une vraie app, vous utiliseriez XMLHttpRequest pour le progrès)
      options?.onProgress?.({ loaded: 0, total: 100, percentage: 0 });

      let response;
      if (chatId) {
        response = await fileAPI.uploadChatFile(formData, chatId);
      } else {
        response = await fileAPI.uploadFile(formData);
      }

      options?.onProgress?.({ loaded: 100, total: 100, percentage: 100 });
      options?.onSuccess?.(response);

      console.log('Upload terminé avec succès:', response);
      return response;

    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      options?.onError?.(error as Error);
      throw error;
    }
  }

  static async uploadImage(
    imageUri: string,
    fileName: string,
    chatId?: number,
    options?: FileUploadOptions
  ): Promise<any> {
    return this.uploadFile(
      {
        uri: imageUri,
        type: 'image',
        name: fileName,
      },
      chatId,
      options
    );
  }

  static async uploadVideo(
    videoUri: string,
    fileName: string,
    chatId?: number,
    options?: FileUploadOptions
  ): Promise<any> {
    return this.uploadFile(
      {
        uri: videoUri,
        type: 'video',
        name: fileName,
      },
      chatId,
      options
    );
  }

  private static getMimeType(fileName: string, type: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (type === 'image') {
      switch (extension) {
        case 'jpg':
        case 'jpeg':
          return 'image/jpeg';
        case 'png':
          return 'image/png';
        case 'gif':
          return 'image/gif';
        case 'webp':
          return 'image/webp';
        default:
          return 'image/jpeg';
      }
    }

    if (type === 'video') {
      switch (extension) {
        case 'mp4':
          return 'video/mp4';
        case 'avi':
          return 'video/avi';
        case 'mov':
          return 'video/quicktime';
        case 'mkv':
          return 'video/x-matroska';
        case 'webm':
          return 'video/webm';
        default:
          return 'video/mp4';
      }
    }

    // Types de fichiers communs
    const mimeTypes: { [key: string]: string } = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      zip: 'application/zip',
      rar: 'application/x-rar-compressed',
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static isImageFile(fileName: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    const extension = fileName.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension || '');
  }

  static isVideoFile(fileName: string): boolean {
    const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'webm', '3gp'];
    const extension = fileName.split('.').pop()?.toLowerCase();
    return videoExtensions.includes(extension || '');
  }
}
