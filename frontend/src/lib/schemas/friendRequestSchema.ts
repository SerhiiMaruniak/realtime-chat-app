export default interface requestSchema {
  _id: string;
  senderId: {
    _id: string;
    user_id: string;
    username: string;
    photoUrl: string;
  };
  receiverId: {
    _id: string;
    user_id: string;
    username: string;
    photoUrl: string;
  };
  createdAt: string;
  updatedAt: string;
}
