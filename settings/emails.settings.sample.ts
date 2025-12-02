export const imapSettings = {
  host: '',
  port: 143,
  secure: false,
  username: '',
  password: '',
  mailbox: 'INBOX',
  markSeen: false,
  attachments: false,
  // attachmentOptions: {
  //   directory: process.cwd() + '/attachments'
  // }
}

export const categoriesSettings = [
  ["Administrative", "Administrative things"],
  ["Business"     , "commercial transaction or prospect"],
  ["Important"    , "Urgent things or important requests"],
  ["Personal"    , "Personal stuffs"],
  ["Promotion"    , "marketing or mailing list"]
];

export const automaticallyPreparesResponse = ["Administrative", "Business", "Important"];