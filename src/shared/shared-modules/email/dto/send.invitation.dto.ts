export type SendProjectInvitationDto = {
  email: string;
  invitedUserName?: string;
  inviterName: string;
  projectName: string;
  invitationLink: string;
  optionalMessage?: string;
};
