import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const createUser = functions.auth.user().onCreate(async (user) => {
  const userData = {
    "uid": user.uid,
    "displayName": user.displayName,
    "photoURL": user.photoURL,
    "cratedAt": admin.firestore.Timestamp.now(),
    "updatedAt": admin.firestore.Timestamp.now(),
  };

  await admin.firestore().doc(`social/v1/users/${user.uid}`).set(userData);
});
