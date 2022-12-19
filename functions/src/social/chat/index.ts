import { firestore } from "firebase-admin";
import * as functions from "firebase-functions";

export const createChatRoom = functions.firestore
  .document("/social/v1/chatRooms/{roomId}")
  .onCreate(async (snapshot) => {
    const batch = firestore().batch();
    const documentId = snapshot.data().id;
    const userIds: string[] = snapshot.data().userIds;
    for (let index = 0; index < userIds.length; index++) {
      const userId = userIds[index];
      const userChatPath = `social/v1/users/${userId}/participatingChatRooms/${documentId}`;
      const chatRef = firestore().doc(userChatPath);
      batch.set(chatRef, {
        id: documentId,
        chatRef: snapshot.ref,
        unreadMessageCount: 0,
        latestBody: "",
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();
  });

    // const path = snapshot.ref.path;
    // const pathList = path.split("/");
    // pathList.pop();
    // pathList.pop();
    // const chatId = pathList.pop().

