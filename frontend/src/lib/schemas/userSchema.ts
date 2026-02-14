export default interface User {
  _id: string;
  username: string;
  email: string;
  password?: string;
  photoUrl?: string;
  friendsList?: User[];
  createdAt?: string;
  updatedAt?: string;
}
