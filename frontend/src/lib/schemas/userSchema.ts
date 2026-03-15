export default interface User {
  _id: string;
  username: string;
  user_id: string;
  email: string;
  password?: string;
  photoUrl?: string;
  friendsList?: string;
  createdAt?: string;
  updatedAt?: string;
}
