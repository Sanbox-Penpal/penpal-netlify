import { Protocol, SignUpStage } from '../firestore/firestore-types'

export interface ProtocolMetadata {
  protocol: Protocol
  stage: SignUpStage | string
  referencedUser?: string
  data?: any // Data can only be passed via Callback if referencedUser is defined
}
