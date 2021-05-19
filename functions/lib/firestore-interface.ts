import {
  Protocol,
  SignUpStageStatics,
  State,
  TempMessage,
  User,
  UserStatus,
} from './firestore-types'
import { CONTENT_PAGE_DB, db } from './firestore-utils'

// Get Statics
export async function getStaticMSgs(protocol: Protocol) {
  const snapshot = await db.statics.doc(protocol).get()
  if (!snapshot.exists) return
  switch (protocol) {
    case Protocol.SIGN_UP:
      return snapshot.data() as SignUpStageStatics
    case Protocol.VERIFY:
    case Protocol.TINDER:
    default:
      return
  }
}

// <-- User Related Services -->
// Accounts
export async function isUserRegistered(userId: string) {
  const document = await db.users.doc(userId).get()
  return document.exists
}

export async function registerUser(
  user: User,
): Promise<FirebaseFirestore.WriteResult> {
  const docRef = db.users.doc(user.id)
  return docRef.set(user)
}

export async function getUser(userId: string) {
  const snapshot = await db.users.doc(userId).get()
  return snapshot.exists ? snapshot.data() : null
}

export async function updateUser(userId: string, user: User) {
  const docRef = db.users.doc(userId)
  return docRef.update(user)
}

// Start of potential redundancy
export async function updateUserStatus(userId: string, status: UserStatus) {
  const docRef = db.users.doc(userId)
  return docRef.update({ status: status })
}

export async function updateUserProgrammes(
  userId: string,
  programmes: string[],
) {
  const docRef = db.users.doc(userId)
  return docRef.update({ programmes: programmes })
}

export async function updateUserIntroduction(userId: string, intro: string) {
  const docRef = db.users.doc(userId)
  return docRef.update({ introduction: intro })
}

export async function updateUserHobbies(userId: string, hobbies: string[]) {
  const docRef = db.users.doc(userId)
  return docRef.update({ hobbies: hobbies })
}

export async function updateUserInterests(userId: string, interests: string[]) {
  const docRef = db.users.doc(userId)
  return docRef.update({ interests: interests })
}

export async function updateUserQueue(userId: string, queue: string[]) {
  const docRef = db.users.doc(userId)
  return docRef.update({ swipeQueue: queue })
}

// End of potential redundancy

export async function deleteUser(userId: string) {
  const docRef = db.users.doc(userId)
  return docRef.delete()
}

// State
export async function getUserState(userId: string) {
  const snapshot = await db.users.doc(userId).get()
  return snapshot.exists ? snapshot.data().state : null
}

export async function updateUserState(userId: string, state: State) {
  const docRef = db.users.doc(userId)
  return docRef.update({ state: JSON.parse(JSON.stringify(state)) })
}

export async function clearUserState(userId: string) {
  const docRef = db.users.doc(userId)
  return docRef.update({ state: null })
}

// Temp Messages
export async function logTempMsg(tempMsg: TempMessage) {
  const docRef = db.tempMsgs.doc(tempMsg.ref)
  return docRef.set(tempMsg)
}

export async function getTempMsg(ref: string) {
  const snapshot = await db.tempMsgs.doc(ref).get()
  return snapshot.exists ? snapshot.data() : null
}

export async function atomicGetTempMsg(ref: string) {
  const docRef = db.tempMsgs.doc(ref)
  await db.default.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(docRef)
    if (snapshot.exists && snapshot.data().processing == false) {
      transaction.update(docRef, { processing: true })
      return snapshot.data()
    }
    return null
  })
}

export async function freeTempMsg(ref: string) {
  return db.tempMsgs.doc(ref).update({ processing: false })
}

export async function updateMsgs(ref: string, msgs: string[]) {
  return db.tempMsgs.doc(ref).update({ msgs: msgs })
}

export async function clearTempMsg(ref: string) {
  return db.tempMsgs.doc(ref).delete()
}

// Content Page
export async function getContentPage() {
  const snapshot = await db.contentPage.doc(CONTENT_PAGE_DB).get()
  return snapshot.exists ? snapshot.data() : null
}

export function updateContentPageAllUsers(allUsers: string[]) {
  return db.contentPage.doc(CONTENT_PAGE_DB).update({ allUsers: allUsers })
}

/**
 *   docRef.get().then((doc) => {
    if (!doc.exists) {
      console.log("Creating New User!");
      const state = new State({
        stateName: "Sign Up Protocol",
        stateStage: 1,
      });
      const user = new User({
        id: ctx.from.id,
        name: ctx.from.first_name,
        username: ctx.from.username != null ? ctx.from.username : "lel",
        state: state,
      });
      docRef.set(JSON.parse(JSON.stringify(user)));
      ctx.reply("On to stage 2");
    } else {
      console.log("Document data:", doc.data());
      ctx.reply("You are already registered :)");
    }
  });
 */
