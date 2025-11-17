export default interface messageSchema {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  is_seen: boolean;
  is_edited: boolean;
  attachments: string;
  repliedMessage: {
    _id: string;
    content: string | null;
    attachments: string | null;
    senderId: string;
  };
  createdAt: string;
  updatedAt: string;
}
