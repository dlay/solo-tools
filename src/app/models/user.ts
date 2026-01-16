export interface User {
  uid: string;
  username: string;
  discriminator: string;
  permissions: number;
  avatar: string;
  locale: string;
}
