import type messageSchema from "./messageSchema";

export default interface GetMessagesResponse {
  messages: messageSchema[];
  hasMore: boolean;
  lastId: string | null;
}
