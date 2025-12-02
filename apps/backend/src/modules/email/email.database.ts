import type { BaseEmail } from "./email.types";

import { Categories, categoriesSettings } from "@settings/emails.settings";
import { initDb }                         from "../database/database"

export enum emailTables {
  emails     = "emails",
  tagsEmails = "tagsEmails",
  tagsName   = "tagsNames"
}

export const db = initDb(process.cwd() + "/database/emails.db", /*sql*/`
  CREATE TABLE ${emailTables.emails} (
    uid           INTEGER UNIQUE PRIMARY KEY,
    message_id    TEXT UNIQUE,
    from_email    TEXT,
    from_name     TEXT,
    reply_to      TEXT,
    subject       TEXT,
    date          TEXT,
    html          TEXT,
    textContent   TEXT,
    recipients    TEXT,
    attachments   TEXT,
    client_id     INTEGER DEFAULT NULL,
    proposal      TEXT DEFAULT NULL
  );

  CREATE TABLE ${emailTables.tagsName} (
    uid  INTEGER PRIMARY KEY,
    name TEXT UNIQUE
  );

  CREATE TABLE ${emailTables.tagsEmails} (
    uid         INTEGER PRIMARY KEY AUTOINCREMENT,
    email_uid   TEXT,
    tag_uid     INTEGER,
    UNIQUE (email_uid, tag_uid)
  );
`);

if ((db.prepare(`SELECT COUNT(*) AS total FROM ${emailTables.tagsName}`).get() as { total: number }).total === 0){
  const stmt = db.prepare(
    /*sql*/`INSERT OR IGNORE INTO ${emailTables.tagsName} (uid, name) VALUES (?, ?)`
  );
  
  for (const [key, value] of Object.entries(categoriesSettings))  {
    stmt.run(value[0], key);
  }
}

export function   registerNewEmail(data: BaseEmail) {
  db.transaction(() => {
    db
      .prepare(/*sql*/`
        INSERT OR IGNORE INTO ${emailTables.emails}
          (uid, message_id, subject, from_email, from_name, reply_to, date,
           html, textContent, attachments, recipients, client_id)
        VALUES
          ($uid, $messageId, $subject, $from, $fromName, $replyTo, $date,
           $html, $textContent, $attachments, $recipients, $clientId)
      `)
      .run({
        $attachments: JSON.stringify(data.attachments),
        $clientId   : data.clientId,
        $date       : data.date.toString(),
        $from       : data.from,
        $fromName   : data.fromName,
        $html       : data.htmlContent,
        $messageId  : data.messageId,
        $replyTo    : data.replyTo,
        $subject    : data.subject,
        $textContent: data.textContent,
        $recipients : data.to,
        $uid        : data.uid,
      });

    db.prepare(/*sql*/`
      INSERT INTO ${emailTables.tagsEmails}(email_uid, tag_uid)
      VALUES (?, ?)
    `).run(data.messageId, 0);
  })();
}

export function setClientId(messageId: number, clientUID: number) {
  db
    .prepare(/*sql*/`UPDATE emails SET client_id = @clientUID WHERE message_id = @messageId`)
    .run({ messageId, clientUID });
}

export function setTagEmail(messageId: number, tagId:number) {
  // TODO passer dans une transaction
  db
    .prepare(/*sql*/`INSERT OR IGNORE INTO tagsEmails (email_uid, tag_uid) VALUES (@messageId, @tagId)`)
    .run({ messageId, tagId });
  db
    .prepare(/*sql*/`DELETE FROM tagsEmails WHERE email_uid = @messageId AND tag_uid = ${categoriesSettings[Categories.UnCategorised]?.[0] || 0}`)
    .run({ messageId });
}

export function setProposalEmail(messageId: number,proposal:string) {
  db
    .prepare(/*sql*/`UPDATE emails SET proposal = @proposal WHERE message_id = @messageId`)
    .run({ messageId, proposal });
}

/**
 * find if the id (id from imap) is in database.
 * @param {string} id - the ID from imap to identify an email.
 */
// export function idExists(id: number) {
//   const exists = db
//     .prepare(/*sql*/ `SELECT 1 FROM ${emailTables.emails} WHERE uid = $id LIMIT 1`)
//     .get({ id }) as any;
//   return exists !== undefined;
// }

/**
 * Creates a new message in the database.
 * @param db - The database instance.
 * @param content - The content of the message.
 * @returns The newly created message.
 */
// export function createMessage(content: string) {
//   return db.query(/*sql*/ `INSERT INTO messages (content) VALUES (?) RETURNING *`).get(content);
// }

/**
 * Deletes a message from the database.
 * @param {Database} database   - The database instance.
 * @param {string}   messageId - The ID of the message to delete.
 */
export function deleteEmail(messageId: string) {
  return db
    .query(/*sql*/ `DELETE FROM ${emailTables.emails} WHERE message_id = ?`)
    .run(messageId);
}

/**
 * Gets all messages from the database.
 * @param db - The database instance.
 * @returns An array of all messages.
 */
export function getEmailList(){
  const emails = db
    .prepare(`
      SELECT 
        te.tag_uid,
        tn.name as tag_name,
        e.message_id,
        e.subject,
        e.from_email,
        e.date
      FROM ${emailTables.tagsEmails} te
      INNER JOIN ${emailTables.emails} e ON te.email_uid = e.message_id
      INNER JOIN ${emailTables.tagsName} tn ON te.tag_uid = tn.uid
      ORDER BY te.tag_uid, e.date DESC`)
    .all();

  return emails;
}

export function getEmailListId(){
  return db
    .prepare(/*sql*/ `SELECT uid FROM ${emailTables.emails}`)
    .all();
}

export function getTagList(){
  return db
    .prepare(/*sql*/ `SELECT * FROM ${emailTables.tagsName}`)
    .all();
}