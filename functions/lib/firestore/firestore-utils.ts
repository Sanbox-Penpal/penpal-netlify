import admin, { ServiceAccount } from 'firebase-admin'
import {
  ContentPage,
  GeneralStaticDocument,
  GiftCard,
  User,
} from './firestore-types'

const serviceAccount: ServiceAccount = {
  projectId: 'penpal-community',
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(
    new RegExp('\\\\n', 'g'),
    '\n',
  ),
  clientEmail:
    'firebase-adminsdk-hm709@penpal-community.iam.gserviceaccount.com',
}
// Initialize Firestore Instance
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const USER_DB = 'users'
export const CONTENT_PAGE_DB = 'content_page'
const STATICS_DB = 'statics'
const GIFTCARDS_DB = 'gift_cards'

// https://medium.com/swlh/using-firestore-with-typescript-65bd2a602945
// Creates a hash of functions that generically sets types
const converter = <T>() => ({
  toFirestore: (data: T) => data,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) =>
    snap.data() as T,
})

// Creates a function that obtains the corresponding DB while generically setting types via the converter
const dataPoint = <T>(collectionPath: string) =>
  admin.firestore().collection(collectionPath).withConverter(converter<T>())

// Declare the types of Databases available
const db = {
  users: dataPoint<User>(USER_DB),
  contentPage: dataPoint<ContentPage>(CONTENT_PAGE_DB),
  statics: dataPoint<GeneralStaticDocument>(STATICS_DB),
  giftCards: dataPoint<GiftCard>(GIFTCARDS_DB),
  default: admin.firestore(),
  admin: admin,
}

export { db }
