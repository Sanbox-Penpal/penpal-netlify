import { Protocol, SignUpStage } from './firestore-types'

export interface ProtocolMetadata {
  protocol: Protocol
  stage: SignUpStage | string
  data?: any
}
