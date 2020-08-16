interface AckeeInterface {
  record: (
    attributes?: BaseAckeeAtributes & DetailedAckeeAtributes
  ) => { stop: () => void }
}

interface AckeeServerOptions {
  server: string
  domainId: string
}

interface AckeeCreateOptions {
  /*
   * Enable or disable tracking when on localhost.
   */
  ignoreLocalhost?: boolean
  /*
   * Enable or disable tracking of personal data.
   * We recommend to ask the user for permission before turning this option on.
   */
  detailed?: boolean
}

interface BaseAckeeAtributes {
  siteLocation: string
  siteReferrer: string
}

interface DetailedAckeeAtributes {
  siteLanguage: Navigator["language"]
  screenWidth: Screen["width"]
  screenHeight: Screen["height"]
  screenColorDepth: Screen["colorDepth"]
  deviceName: string
  deviceManufacturer: string
  osName: string
  osVersion: string
  browserName: string
  browserVersion: string
  browserWidth: Element["clientWidth"]
  browserHeight: Element["clientHeight"]
}

type AckeeBaseAttributesMethod = (
  detailed: false | undefined
) => BaseAckeeAtributes
type AckeeDetailedAttributesMethod = (
  detailed: true
) => BaseAckeeAtributes & DetailedAckeeAtributes
type AckeeAttributesMethod =
  | AckeeDetailedAttributesMethod
  | AckeeBaseAttributesMethod

interface Ackee {
  create(
    server: AckeeServerOptions,
    options?: AckeeCreateOptions
  ): AckeeInterface
  attributes: AckeeAttributesMethod
}

declare module "ackee-tracker" {
  const ackee: Ackee
  export default ackee
}
