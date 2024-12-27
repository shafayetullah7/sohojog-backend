export interface OfferPayload {
  roomId: string;
  offer: RTCSessionDescriptionInit;
}

// export interface AnswerPayload {
//   target: string;
//   answer: RTCSessionDescriptionInit;
// }

export interface AnswerPayload {
  roomId: string;
  answer: string;  
}

export interface IceCandidatePayload {
  target: string;
  candidate: RTCIceCandidate;
}

export type WebRTCMessagePayload =
  | OfferPayload
  | AnswerPayload
  | IceCandidatePayload;
