export type EmailWsExchange = {
  commandId       : string
  emailData       : string,
  messageUID      : string,
  parentMessageUID: string
};


export type TagListResponse = {
  uid : number
  name: string
};

export type Email = {
  id       : string
  date     : string
  sender   : string
  subject  : string
  content  : string
  tags     : string[]
  response?: string
}