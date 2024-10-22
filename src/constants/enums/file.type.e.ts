export const AllowedFiles = {
  JPG: 'jpg',
  JPEG: 'jpeg',
  PNG: 'png',
  PDF: 'pdf',
  DOCX: 'docx',
  DOC: 'doc',
  PPT: 'ppt',
  PPTX: 'pptx',
  XLS: 'xls',
  XLSX: 'xlsx',
  CSV: 'csv',
  TXT: 'txt',
} as const; 

export type AllowedFileType = (typeof AllowedFiles)[keyof typeof AllowedFiles];
