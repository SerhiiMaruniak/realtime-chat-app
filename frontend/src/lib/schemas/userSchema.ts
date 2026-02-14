export default interface User {
  _id: string;
  username: string;
  user_id: string;
  email: string;
  password?: string;
  photoUrl?: string;
  friendsList?: User[];
  createdAt?: string;
  updatedAt?: string;
}
