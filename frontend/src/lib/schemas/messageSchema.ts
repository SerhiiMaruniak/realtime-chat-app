export default interface messageSchema {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  is_seen: boolean;
  is_edited: boolean;
  attachments: string;
  createdAt: string;
  updatedAt: string;
}
