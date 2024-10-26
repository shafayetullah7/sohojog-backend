import { FileType } from '@prisma/client';

export function getFileType(format: string): FileType {
  switch (format) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return FileType.IMAGE;
    case 'pdf':
      return FileType.PDF;
    case 'doc':
      return FileType.DOC;
    case 'docx':
      return FileType.DOCX;
    case 'ppt':
      return FileType.PPT;
    case 'pptx':
      return FileType.PPTX;
    case 'xls':
      return FileType.XLS;
    case 'xlsx':
      return FileType.XLSX;
    case 'csv':
      return FileType.CSV;
    case 'txt':
      return FileType.TXT;
    default:
      return FileType.OTHER; // For any other formats
  }
}
