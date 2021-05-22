import { Protocol, SignUpStage } from '../firestore/firestore-types'

export interface ProtocolMetadata {
  protocol: Protocol
  stage: SignUpStage | string
  data?: any
}
