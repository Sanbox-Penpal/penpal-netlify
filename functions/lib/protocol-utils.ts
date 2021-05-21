import {
  User,
  Protocol,
  State,
  SignUpStage,
  UserStatus,
} from './firestore-types'

import { v4 as uuid } from 'uuid'

export function createNewUser(teleId: number, name: string): User {
  const newState = createNewState(Protocol.SIGN_UP, SignUpStage.PDPA_CALLBACK)
  const newUser: User = {
    id: teleId.toString(),
    state: newState,
    name: name,
    status: UserStatus.UNAPPROVED,
    swiperQueue: [],
    programmes: [],
    hobbies: [],
    interests: [],
  }
  return newUser
}

export function createNewState(
  protocol: Protocol,
  stage: SignUpStage | string,
): State {
  const newState: State = {
    protocol: protocol,
    stateStage: stage,
    stateData: null,
  }
  return newState
}
