  // export type ParsedMail = {
  //   attachments: boolean
  //   date       : string
  //   from       : string
  //   html       : string
  //   idFromImap : number
  //   messageUID : string
  //   subject    : string
  //   text       : string
  //   textAsHtml : string
  //   to         : string
  //   "message-id" : string
  // }

export interface BaseEmail extends EmailData {
  clientId   : number | null
}

  // type FullEmailData = BaseEmail & {
  //   clientUID : number | null
  //   automated : boolean
  //   proposal  : string
  // }

  /*
Name	Type	Attributes	Description
attachments	Attachment[]		An array of attachment
headers	Headers		A Map object with lowercase header keys
headerLines	HeaderLines		An array of raw header lines
html	string / false		The HTML body of the message. Sets to false when there is no HTML body
text	string / undefined	<optional>	The plaintext body of the message
textAsHtml	string / undefined	<optional>	The plaintext body of the message formatted as HTML
subject	string / undefined	<optional>	The subject line
references	string[] / string / undefined	<optional>	Either an array of two or more referenced Message-ID values or a single Message-ID value
date    Date / undefined	<optional>	A Date object for the Date                                                          : header
to      AddressObject / AddressObject[] / undefined	<optional>	An address object or array of address objects for the To : header
from    AddressObject / undefined	<optional>	An address object for the From                                             : header
cc      AddressObject / AddressObject[] / undefined	<optional>	An address object or array of address objects for the Cc : header
bcc     AddressObject / AddressObject[] / undefined	<optional>	An address object or array of address objects for the Bcc: header
replyTo AddressObject / undefined	<optional>	An address object for the Reply-To                                         : header
messageId	string / undefined	<optional>	The Message-ID value string
inReplyTo	string / undefined	<optional>	The In-Reply-To value string
priority	'normal' / 'low' / 'high' / undefined	<optional>	Priority of the e-mail
*/


export interface ImapConfig {
  host  : string
  port  : number
  secure: boolean
  auth  : {
    user: string
    pass: string
  }
}

type EmailData = {
  attachments     : Attachment[]
  date            : Date
  from            : string
  fromName        : string
  htmlContent     : string
  messageId       : string
  replyTo         : string
  subject         : string
  textAsHtml      : string
  textContent     : string
  to              : string
  uid             : number
}

export type CategoriesSettings = {
  [key: keyof typeof Categories]: [number, string?, string?]
}