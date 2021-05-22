export interface User {
  id: string
  status: UserStatus
  verifierId?: string
  name: string
  username?: string
  address?: string
  introduction?: string
  interests: string[]
  hobbies: string[]
  programmes: string[]
  state: State
  swiperQueue: number[]
}

export enum UserStatus {
  UNAPPROVED = 'Unapproved',
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface State {
  protocol: Protocol
  stateStage: SignUpStage | string
  stateData: any
}

export interface TempMessage {
  ref: string
  msgs: string[]
  processing: boolean
}

export interface ContentPage {
  admins: string[]
}

export enum Protocol {
  SIGN_UP = 'Signing up',
  TINDER = 'Match Making',
}

export enum SignUpStage {
  PDPA = 'PDPA',
  PDPA_CALLBACK = 'PDPA Verification',
  PROGRAMMES = 'Adding Programmes',
  VERIFICATION_REQUEST = 'Verification Request',
  VERIFICATION_RESPONSE = 'Verification Response',
  APPROVING = 'Approval',
}

export interface SignUpStageStatics {
  PDPA: string
  PDPA_DECLINED: string
  PROGRAMMES: string[]
  ADD_PROGRAMMES: string
  VERIFICATION: string
  VERIFICATION_RECEIVED: string
  VERIFICATION_APPROVED: string
  VERIFICATION_REJECTED: string
}

export enum TinderStage {
  INITIALIZE = 'INITIALIZE',
  SWIPE = 'SWIPE',
  END = 'END',
}

export interface TinderStageStatics {
  NOT_CLEARED: string
  NO_LONGER_CLEARED: string
}
