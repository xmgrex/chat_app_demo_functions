import * as User from "./user";
import * as Chat from "./chat";
import * as Message from "./message";

export const v1 = {
  user: { ...User },
  chat: { ...Chat },
  message: { ...Message },
};
