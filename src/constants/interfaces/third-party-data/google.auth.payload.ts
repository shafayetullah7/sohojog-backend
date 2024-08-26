export interface GoogleAuthPayload {
  id: string; // Google user ID
  displayName: string; // Full name
  name: {
    familyName: string; // Last name
    givenName: string; // First name
  };
  emails: {
    value: string; // Email address
    verified: boolean; // Email verification status
  }[];
  photos: {
    value: string; // URL of the profile photo
  }[];
  provider: string; // Authentication provider
  _raw: string; // Raw data returned from Google
  _json: {
    sub: string; // Google user ID
    name: string; // Full name
    given_name: string; // First name
    family_name: string; // Last name
    picture: string; // URL of the profile photo
    email: string; // Email address
    email_verified: boolean; // Email verification status
  };
}
