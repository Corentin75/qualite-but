import type { ParsedMail }         from 'mailparser';
import type { FetchMessageObject } from 'imapflow';

import { ImapFlow }     from 'imapflow';
import { simpleParser } from 'mailparser';
import { Readable }     from 'stream';

import { imapSettings }     from "@settings/emails.settings";
import { logger }           from '../../core/utils';
import { useReceivedEmail } from './email-actions';

export async function runImap(ImapConfig=imapSettings): Promise<void> {

  const searchSinceDate: Date = new Date('2025-01-01') // TODO remplacer par une recherche en base de donnée;
  const client = new ImapFlow(ImapConfig);

  try {
    // Connexion au serveur IMAP
    logger.info('🔌 Connexion au serveur IMAP...');
    await client.connect();
    logger.info('✅ Connecté au serveur IMAP');

    // Ouvrir la boîte de réception
    await client.mailboxOpen('INBOX');
    logger.info('📬 Boîte INBOX ouverte');

    // 1. RECHERCHE AU DÉMARRAGE : Récupérer les mails depuis la date configurée
    logger.info(`🔍 Recherche des mails depuis le ${searchSinceDate.toLocaleDateString()}...`);

    const historicalMessages = await client.search({
      since: searchSinceDate
    }) as any[]; //TODO changer le type 

    logger.info(`📊 ${historicalMessages.length} mail(s) trouvé(s) depuis le ${searchSinceDate.toLocaleDateString()}`);

    // Traiter les mails trouvés
    for (const uid of historicalMessages) {
      await processMessage(client, uid);
    }

    logger.info('✅ Traitement des mails historiques terminé');
    logger.info('👂 En attente de nouveaux mails...\n');

    // 2. ÉCOUTE EN TEMPS RÉEL : Surveiller les nouveaux mails
    client.on('exists', async (data) => {
      logger.info(`🔔 Nouveau mail détecté (count: ${data.count})`);

      try {
        // Récupérer les UIDs des nouveaux messages
        const newMessages = await client.search({ seen: false }) as number[];

        // Traiter uniquement les nouveaux (derniers)
        if (newMessages.length > 0) {
          await processMessage(client, newMessages[newMessages.length - 1] as number);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error('❌ Erreur lors du traitement du nouveau mail:', errorMessage);
      }
    });

    // Gestion des erreurs de connexion
    client.on('error', (error: Error) => {
      console.error('❌ Erreur IMAP:', error.message);
    });

    client.on('close', () => {
      logger.info('🔌 Connexion IMAP fermée');
    });

    // Garder le processus actif
    process.on('SIGINT', async () => {
      logger.info('\n🛑 Arrêt du monitor...');
      await client.logout();
      process.exit(0);
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur fatale inconnue';
    logger.info('❌ Erreur fatale:'+ errorMessage);
    await client.logout();
    process.exit(1);
  }
}



async function processMessage(client: ImapFlow, uid: number): Promise<void> {
  try {
    const message = await client.fetchOne(uid.toString(), {
      bodyStructure: true,
      envelope     : true,
      flags        : true,
      source       : true,
      uid          : true,
    }) as FetchMessageObject;

    // Parser le contenu de l'email
    let parsedMail: ParsedMail | undefined;
    if (message.source) {
      const stream = Readable.from(message.source);
      parsedMail   = await simpleParser(stream);
    }
    const unknown = "unknown";

    useReceivedEmail({
      // hasAttachments : (parsedMail?.attachments?.length || 0) > 0,
      attachments    : parsedMail?.attachments                 || [],
      date           : message.envelope?.date                  || new Date(),
      from           : message.envelope?.from?.[0]?.address    || unknown,
      fromName       : message.envelope?.from?.[0]?.name       || "",
      htmlContent    : parsedMail?.html                        || "",
      messageId      : message.envelope?.messageId?.trim()     || "",
      replyTo        : message.envelope?.replyTo?.[0]?.address || unknown,
      subject        : message.envelope?.subject               || "(no subject)",
      textAsHtml     : parsedMail?.textAsHtml                  || "",
      textContent    : parsedMail?.text                        || parsedMail?.textAsHtml || "",
      to             : message.envelope?.to?.[0]?.address      || unknown,
      uid            : message.uid
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    logger.error(`❌ Erreur lors du traitement du message ${uid}:${errorMessage}`);
  }
}