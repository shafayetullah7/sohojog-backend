import { FileType } from '@prisma/client';

// export type SentMessage = {
//   id: string;
//   createdAt: Date;
//   content: string | null;
//   files: {
//     file: {
//       file: string;
//       id: string;
//       fileType: FileType;
//       fileName: string;
//       extension: string;
//     };
//   }[];
//   sender: {
//     name: string;
//     id: string;
//     profilePicture: {
//       minUrl: string;
//     } | null;
//   };
// };

export type MessagePayload = {
  roomId: string;
  content: string;
  fileIds: string[];
};
