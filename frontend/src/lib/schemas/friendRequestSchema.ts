export default interface requestSchema {
  _id: string;
  senderId:
    | string
    | {
        _id: string;
        user_id: string;
        username: string;
        photoUrl: string;
      };
  receiverId: string;
  createdAt: string;
  updatedAt: string;
}
