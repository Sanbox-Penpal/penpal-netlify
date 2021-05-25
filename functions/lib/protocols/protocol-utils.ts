import {
  User,
  Protocol,
  State,
  SignUpStage,
  UserStatus,
} from '../firestore/firestore-types'

export function createNewUser(
  teleId: number,
  name: string,
  username: string,
): User {
  const newState = createNewState(Protocol.SIGN_UP, SignUpStage.PDPA)
  const newUser: User = {
    id: teleId.toString(),
    username: username,
    state: newState,
    name: name,
    status: UserStatus.UNAPPROVED,
    swiperQueue: [],
    likedUsers: [],
    programmes: [],
    hobbies: [],
    interests: [],
  }
  return newUser
}

export function createNewState(
  protocol: Protocol,
  stage: SignUpStage | string,
  data: any = null,
): State {
  const newState: State = {
    protocol: protocol,
    stateStage: stage,
    stateData: data,
  }
  return newState
}
