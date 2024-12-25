export interface OfferPayload {
  targets: string[];
  offer: RTCSessionDescriptionInit;
}

export interface AnswerPayload {
  target: string;
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidatePayload {
  target: string;
  candidate: RTCIceCandidate;
}

export type WebRTCMessagePayload =
  | OfferPayload
  | AnswerPayload
  | IceCandidatePayload;
