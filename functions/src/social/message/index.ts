import { firestore } from "firebase-admin";
import * as functions from "firebase-functions";

const numShards: number = 21;

export const createMessage = functions.firestore
  .document("/social/v1/chatRooms/{roomId}/messages/{messageId}")
  .onCreate(async (snapshot) => {
    const data = snapshot.data();
    const path = snapshot.ref.path;
    const pathList = path.split("/");
    pathList.pop();
    pathList.pop();
    const chatId = pathList.pop();
    return firestore().runTransaction(async (transaction) => {
      const chatPath = `social/v1/chatRooms/${chatId}`;
      const doc = await transaction.get(firestore().doc(chatPath));
      const userIds: string[] = doc.data()?.userIds;

      const tasks = userIds.map(async (userId, index) => {
        if (data.from == userId) return;
        const userChatPath = `social/v1/users/${userId}/participatingChatRooms/${chatId}`;
        const chatRef = firestore().doc(userChatPath);
        const shardId = Math.floor(Math.random() * numShards);
        const shardRef = chatRef.collection('unreadMessageCounts').doc(shardId.toString());
        const shardsRef = chatRef.collection('unreadMessageCounts');
        const querySnapshot = await transaction.get(shardsRef);
        const documents = querySnapshot.docs;
        let count = 1;
        for (const doc of documents) {
          count += doc.get('count');
        }
        transaction.update(chatRef, {
          unreadMessageCount: count,
          latestBody: data.body,
          updatedAt: firestore.Timestamp.now(),
        })
        transaction.set(shardRef, { count: firestore.FieldValue.increment(1) }, { merge: true });
        return count;
      });
      await Promise.all(tasks);
    });
  });

    // const path = snapshot.ref.path;
    // const pathList = path.split("/");
    // pathList.pop();
    // pathList.pop();
    // const chatId = pathList.pop().

