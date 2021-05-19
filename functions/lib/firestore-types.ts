export interface User {
  id: string
  status: UserStatus
  name: string
  username?: string
  address?: string
  introduction?: string
  interests?: string[]
  hobbies?: string[]
  state: State
  swiperQueue: number[]
}

export enum UserStatus {
  UNAPPROVED = 'UNAPPROVED',
}

export interface State {
  protocol: Protocol
  stateStage: SignUpStage | string
  stateMsgId: number
}

export interface TempMessage {
  ref: string
  msgs: string[]
  processing: boolean
}

export interface ContentPage {
  allUsers: string[]
}

export enum Protocol {
  SIGN_UP = 'Signing up',
  VERIFY = 'Verification',
  TINDER = 'Match Making',
}

export enum SignUpStage {
  PDPA = 'PDPA',
  PROGRAMMES = 'Adding Programmes',
  VERIFICATION = 'Verification',
  APPROVING = 'Approval',
}

export interface SignUpStageStatics {
  PDPA: string
  PROGRAMMES: string
  VERIFICATION: string
  APPROVING: string
}
