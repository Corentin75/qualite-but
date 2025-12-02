# Guide de Tests Spécifiques pour l'Application

Ce document fournit une feuille de route détaillée et concrète pour l'implémentation des tests unitaires et d'intégration, basée sur l'analyse du code source.

## 1. Tests Unitaires du `core`

### 1.1. Fichier : `apps/backend/src/core/eventManager.ts`

**Objectif :** Garantir que le gestionnaire de file d'attente de tâches est fiable, exécute les tâches en série et gère correctement les erreurs.

**Framework de test suggéré :** `vitest` (ou `jest`), qui s'intègre bien avec bun et TypeScript.

#### Test 1 : Une tâche ajoutée doit être exécutée

*   **Description :** Vérifie qu'une simple fonction synchrone ajoutée via `addTask` est bien exécutée.
*   **Jeu de données :**
    *   Une fonction mock : `const myTask = vi.fn();`
*   **Étapes :**
    1.  Importer `addTask` et le `queue` interne (il faudra peut-être l'exporter pour le test).
    2.  Appeler `addTask(myTask)`.
    3.  Attendre la fin de l'exécution (ex: avec `await new Promise(setImmediate)`).
    4.  **Assertion :** `expect(myTask).toHaveBeenCalledTimes(1);`

#### Test 2 : Les tâches asynchrones doivent s'exécuter en série et non en parallèle

*   **Description :** Garantit que le gestionnaire attend la fin d'une promesse avant de lancer la tâche suivante.
*   **Jeu de données :**
    *   Un tableau pour enregistrer l'ordre d'exécution : `const executionOrder = [];`
    *   Tâche 1 (longue) : `const task1 = async () => { await new Promise(r => setTimeout(r, 50)); executionOrder.push('task1'); };`
    *   Tâche 2 (courte) : `const task2 = async () => { await new Promise(r => setTimeout(r, 10)); executionOrder.push('task2'); };`
*   **Étapes :**
    1.  Ajouter les tâches : `addTask(task1); addTask(task2);`
    2.  Attendre une durée suffisante pour que les deux s'exécutent (ex: `await new Promise(r => setTimeout(r, 100));`).
    3.  **Assertion :** `expect(executionOrder).toEqual(['task1', 'task2']);`

#### Test 3 : Une erreur dans une tâche ne doit pas bloquer la file d'attente

*   **Description :** Si une tâche échoue (lance une exception), le gestionnaire doit la capturer, la logger, et continuer avec la tâche suivante.
*   **Jeu de données :**
    *   Mock de `logger.error` : `const loggerErrorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});`
    *   Tâche qui échoue : `const failingTask = () => { throw new Error('Task Failed'); };`
    *   Tâche suivante : `const nextTask = vi.fn();`
*   **Étapes :**
    1.  Ajouter les tâches : `addTask(failingTask); addTask(nextTask);`
    2.  Attendre la fin de l'exécution.
    3.  **Assertions :**
        *   `expect(loggerErrorSpy).toHaveBeenCalledWith('Erreur dans la queue:', expect.any(Error));`
        *   `expect(nextTask).toHaveBeenCalledTimes(1);`

#### Test 4 : La file d'attente ne doit pas démarrer une nouvelle tâche si une autre est déjà en cours

*   **Description :** Valide le rôle de la variable `running` pour empêcher l'exécution concurrente.
*   **Jeu de données :**
    *   Une tâche qui s'exécute lentement.
*   **Étapes (conceptuelles) :**
    1.  Il faudrait pouvoir inspecter la variable `running` pendant l'exécution (ce qui peut nécessiter une petite refactorisation ou un export pour le test).
    2.  Lancer une tâche lente.
    3.  Pendant son exécution, vérifier que `running` est `true`.
    4.  Appeler `runNext()` manuellement pendant ce temps.
    5.  Vérifier que la deuxième tâche n'est pas démarrée prématurément.

---

### 1.2. Fichier : `apps/backend/src/modules/email/email-automations.ts`

**Objectif :** Valider la logique de classification des emails et de préparation des réponses. Isoler la logique métier des appels externes (IA).

#### Test 5 : `getClientId(from, clientsDomainList)`

*   **Description :** Vérifie que la fonction associe correctement une adresse email à un ID client en se basant sur le nom de domaine. C'est une fonction pure, facile à tester.
*   **Jeux de données :**
    *   `const MOCK_CLIENTS = [['Client A', 'client-a.com'], ['Client B', 'client-b.org']];`
*   **Cas à tester :**
    1.  **Domaine correspondant :**
        *   Entrée : `getClientId('contact@client-a.com', MOCK_CLIENTS)`
        *   Sortie attendue : `0`
    2.  **Sous-domaine correspondant :**
        *   Entrée : `getClientId('tech.support@sub.client-b.org', MOCK_CLIENTS)`
        *   Sortie attendue : `1`
    3.  **Aucun domaine correspondant :**
        *   Entrée : `getClientId('hello@unknown.com', MOCK_CLIENTS)`
        *   Sortie attendue : `null`
    4.  **Sensibilité à la casse (si pertinent) :**
        *   Entrée : `getClientId('Contact@Client-A.com', MOCK_CLIENTS)`
        *   Sortie attendue : `0`

#### Test 6 : `defineEmailAutomation(categories, emailId)`

*   **Description :** Valide la logique qui détermine si une réponse doit être préparée et si elle doit être de style personnel.
*   **Prérequis :** Il faut mocker les dépendances importées depuis `@settings/emails.settings`, notamment `automaticallyPreparesResponse`.
    *   `vi.mock('@settings/emails.settings', () => ({ automaticallyPreparesResponse: ['Invoice', 'Support'], Categories: { Personal: 'Personal' }, categoriesSettings: { /* ... mock data ... */ } }));`
*   **Jeux de données :**
    *   `const MOCK_EMAIL_ID = 123;`
*   **Cas à tester :**
    1.  **Style personnel et préparation de réponse :**
        *   Entrée : `defineEmailAutomation(['Personal', 'Invoice'], MOCK_EMAIL_ID)`
        *   Sortie attendue : `{ needPersonalStyle: true, willPrepareResponse: true }`
    2.  **Préparation de réponse uniquement :**
        *   Entrée : `defineEmailAutomation(['Support'], MOCK_EMAIL_ID)`
        *   Sortie attendue : `{ needPersonalStyle: false, willPrepareResponse: true }`
    3.  **Aucune action :**
        *   Entrée : `defineEmailAutomation(['Spam', 'Marketing'], MOCK_EMAIL_ID)`
        *   Sortie attendue : `{ needPersonalStyle: false, willPrepareResponse: false }`
    4.  **Tableau de catégories vide :**
        *   Entrée : `defineEmailAutomation([], MOCK_EMAIL_ID)`
        *   Sortie attendue : `{ needPersonalStyle: false, willPrepareResponse: false }`

#### Test 7 : `categoriseEmail(emailId, text)`

*   **Description :** Teste l'orchestration de la classification, en isolant l'appel à l'IA.
*   **Prérequis :** Mocker le module `aiSelector` pour contrôler la sortie de `useAI`.
    *   `import { useAI } from '@ai/aiSelector';`
    *   `vi.mock('@ai/aiSelector');`
    *   `const mockedUseAI = vi.mocked(useAI);`
*   **Jeux de données :**
    *   `const MOCK_EMAIL_ID = 456;`
    *   `const MOCK_EMAIL_TEXT = 'Hello, here is the invoice...';`
*   **Cas à tester :**
    1.  **Classification réussie :**
        *   Configuration du mock : `mockedUseAI.mockResolvedValue({ text: '["Invoice", "Business"]' });`
        *   Exécuter `await categoriseEmail(MOCK_EMAIL_ID, MOCK_EMAIL_TEXT)`.
        *   **Assertions :**
            *   Vérifier que `setTagEmail` a été appelé deux fois, avec `(456, tagIdForInvoice)` et `(456, tagIdForBusiness)`. (Nécessite de mocker `email.database`).
            *   Vérifier que `prepareResponse` (et par conséquent `setProposalEmail`) a été appelé car la catégorie "Invoice" déclenche la préparation de réponse.
    2.  **Réponse vide de l'IA :**
        *   Configuration du mock : `mockedUseAI.mockResolvedValue({ text: undefined });`
        *   Exécuter `await categoriseEmail(MOCK_EMAIL_ID, MOCK_EMAIL_TEXT)`.
        *   **Assertion :** Vérifier qu'aucune fonction de `email.database` n'a été appelée.
    3.  **Réponse JSON invalide de l'IA :**
        *   Configuration du mock : `mockedUseAI.mockResolvedValue({ text: 'not a valid json' });`
        *   **Assertion :** S'attendre à ce que l'appel `await categoriseEmail(...)` lève une exception (ou la gère gracieusement sans planter). Le test doit vérifier que l'erreur est bien capturée.

#### Test 8 : `prepareResponse(email, friendlyStyle)`

*   **Description :** Vérifie que le prompt passé à l'IA pour préparer une réponse est correctement formaté.
*   **Prérequis :** Mocker `useAI` pour intercepter le prompt qui lui est passé.
*   **Cas à tester :**
    1.  **Style amical :**
        *   Appeler `prepareResponse('some email content', true)`.
        *   **Assertion :** `expect(mockedUseAI).toHaveBeenCalledWith(expect.stringContaining('friendly style'), AiInteraction.ADVISE_ANSWER);`
    2.  **Style professionnel :**
        *   Appeler `prepareResponse('some email content', false)`.
        *   **Assertion :** `expect(mockedUseAI).toHaveBeenCalledWith(expect.stringContaining('professional style'), AiInteraction.ADVISE_ANSWER);`

---

## 2. Tests d'Intégration du Back-end

### 2.1. Flux complet : de la réception à la classification d'un email

**Objectif :** Valider que les modules `email-actions`, `eventManager`, et `email-automations` collaborent correctement pour traiter un nouvel email. Ce test simule un scénario réel mais sans dépendre des services externes (IA, base de données).

**Fichier de test :** `apps/backend/src/modules/email/email.integration.test.ts`

**Prérequis :**
*   Mocker le module `email.database` pour espionner (`spyOn`) les appels à `registerNewEmail`, `setTagEmail`, et `setProposalEmail`.
*   Mocker le module `@ai/aiSelector` pour contrôler la réponse de `useAI`.

#### Test 9 : Traitement d'un email de facture


*   **Description :** Simule la réception d'un email de facture, qui doit être correctement enregistré, classifié, et pour lequel une proposition de réponse doit être générée.
*   **Jeu de données initial :**
    *   `const MOCK_EMAIL_DATA: EmailData = { uid: 999, from: 'billing@fournisseur.com', subject: 'Votre facture', textContent: 'Voici votre facture pour le mois de mai.', /* ...autres champs... */ };`
*   **Configuration des mocks :**
    1.  `const registerSpy = vi.spyOn(emailDatabase, 'registerNewEmail');`
    2.  `const setTagSpy = vi.spyOn(emailDatabase, 'setTagEmail');`
    3.  `const setProposalSpy = vi.spyOn(emailDatabase, 'setProposalEmail');`
    4.  `const mockedUseAI = vi.mocked(useAI);`
    5.  `mockedUseAI.mockResolvedValueOnce({ text: '["Invoice"]' }); // Pour la classification`
    6.  `mockedUseAI.mockResolvedValueOnce({ text: 'Merci, nous allons procéder au paiement.' }); // Pour la proposition de réponse`
*   **Étapes d'exécution :**
    1.  Appeler la fonction de point d'entrée : `useReceivedEmail(MOCK_EMAIL_DATA);`
    2.  Attendre que la file d'attente de `eventManager` soit vide. `await new Promise(setImmediate);` (peut nécessiter plusieurs tours).
*   **Assertions :**
    1.  **Enregistrement initial :**
        *   `expect(registerSpy).toHaveBeenCalledTimes(1);`
        *   `expect(registerSpy).toHaveBeenCalledWith(expect.objectContaining({ uid: 999, clientId: expect.any(Number) }));`
    2.  **Appel à l'IA pour classification :**
        *   `expect(mockedUseAI).toHaveBeenCalledWith(expect.stringContaining('Voici votre facture'), AiInteraction.CATEGORIZE);`
    3.  **Sauvegarde des tags :**
        *   `expect(setTagSpy).toHaveBeenCalledTimes(1);`
        *   `expect(setTagSpy).toHaveBeenCalledWith(999, /* Valeur ID du tag pour "Invoice" */);`
    4.  **Appel à l'IA pour la proposition de réponse :**
        *   `expect(mockedUseAI).toHaveBeenCalledWith(expect.stringContaining('professional style'), AiInteraction.ADVISE_ANSWER);`
    5.  **Sauvegarde de la proposition :**
        *   `expect(setProposalSpy).toHaveBeenCalledTimes(1);`
        *   `expect(setProposalSpy).toHaveBeenCalledWith(999, 'Merci, nous allons procéder au paiement.');`

---

## 3. Tests du Front-end (Composants et Fonctionnels)

**Objectif :** Garantir que les composants React sont fiables, affichent correctement les données et répondent aux interactions de l'utilisateur. Ces tests doivent isoler le front-end du back-end en simulant les stores ou les réponses WebSocket.

**Framework suggéré :** `vitest` avec `@testing-library/react` pour le rendu des composants et la simulation des interactions.

### 3.1. Tests de Composants (Unitaires)

#### Test 10 `apps/frontend/src/components/buttonMulti/ButtonMulti.tsx`

*   **Contexte :** Ce composant gère un état interne (le menu est-il ouvert ?) et dépend d'un store externe pour ses actions.
*   **Prérequis :** Simuler la prop `source` qui est un hook vers un store Zustand.
    ```javascript
    // Dans votre fichier de test
    const mockSetCurrentAction = vi.fn();
    const mockStore = {
      currentAction: 0,
      options: ['Action A', 'Action B', 'Action C'],
      setCurrentAction: mockSetCurrentAction
    };
    const mockSource = () => mockStore;
    ```
*   **Tests à implémenter :**
    1.  **Test 1 (Affichage initial) :**
        *   Rendre le composant `<ButtonMulti source={mockSource} />`.
        *   **Assertion :** Le bouton doit afficher le texte de la première option (`"Action A"`) et la flèche pour ouvrir le menu. La liste `<ul>` ne doit pas être dans le DOM.
    2.  **Test 2 (Ouverture et affichage des options) :**
        *   Rendre le composant, puis simuler un clic sur la flèche `<span>`.
        *   **Assertion :** La liste `<ul>` doit maintenant être visible et contenir 3 éléments `<li>`. Le bouton doit avoir l'attribut `aria-expanded="true"`.
    3.  **Test 3 (Sélection d'une nouvelle action) :**
        *   Rendre le composant et ouvrir le menu.
        *   Simuler un clic sur le deuxième `<li>` ("Action B").
        *   **Assertion :** La fonction `mockSetCurrentAction` du store doit avoir été appelée avec l'index `1`. La liste `<ul>` doit de nouveau être masquée.


#### Test 11 `apps/frontend/src/components/sidebar/Sidebar.tsx`

*   **Contexte :** Ce composant affiche des listes de données provenant du `useEmailStore`.  
    Pour simplifier et fiabiliser les tests, on utilise directement la fonction `askList` afin de vérifier l’affichage des tags et des emails.

*   **Tests à implémenter :**
    1.  **Test 1 (Affichage des listes avec données) :**
        *   Appeler `askList(false, [{uid: 1, name: 'Inbox'}])` pour les tags et `askList(true, [{id: 'email-123', subject: 'Sujet de test'}])` pour les emails.
        *   **Assertion :** Un `<li>` avec le texte "Inbox" et un autre avec "Sujet de test" doivent être présents.
    2.  **Test 2 (Gestion des listes vides affiche "Loading...") :**
        *   Appeler `askList(false, [])` pour les tags et `askList(true, [])` pour les emails.
        *   **Assertion :** Le composant doit afficher deux `<li>` contenant le texte "Loading..." (un pour les tags, un pour les emails).

/!\ variante pour les emails


#### Test 12 `apps/frontend/src/components/emailContent/EmailContent.tsx`

*   **Contexte :** C'est un composant de présentation simple.
*   **Tests à implémenter :**
    1.  **Test 1 (Affichage des props) :**
        *   Rendre `<EmailContent title="Titre Test" content="Contenu Test"><p>Enfant</p></EmailContent>`.
        *   **Assertion :** Le composant doit afficher le titre, le contenu et le composant enfant passés en props.

### 3.2. Tests Fonctionnels (Intégration Front-end)

*   **Objectif :** Vérifier que les composants collaborent correctement, principalement via les stores.

*   **Scénario 1 : La mise à jour du store rafraîchit l'affichage du `Sidebar`**
    *   **Description :** Ce test crucial vérifie que le composant est réactif aux changements du store.
    *   **Prérequis :** Utiliser la librairie de test de Zustand ou `act` de React Testing Library pour gérer les mises à jour d'état.
    *   **Étapes :**
        1.  Initialiser le store avec des listes vides.
        2.  Rendre le composant `<Sidebar />`.
        3.  **Assertion initiale :** Vérifier que "Loading..." est affiché.
        4.  Simuler une mise à jour du store en lui injectant une nouvelle liste d'emails (ex: `act(() => { store.getState().setEmails(nouvelleListe); });`).
        5.  **Assertion finale :** `waitFor` (`@testing-library/react`) que les nouveaux sujets d'emails apparaissent à l'écran et que "Loading..." a disparu.

*   **Scénario 2 : La sélection d'un email met à jour l'état global**
    *   **Description :** Ce test garantit que l'interaction utilisateur dans `Sidebar` se propage correctement au store.
    *   **Prérequis :**
        1.  La fonction `selectEmail` dans `Sidebar.tsx` doit être implémentée pour appeler une fonction du store (ex: `setSelectedEmailId`).
        2.  Le store `useEmailStore` doit être testé avec un framework comme Zustand Testing Library ou en le simulant.
    *   **Étapes :**
        1.  Initialiser le store avec un état (une liste d'emails).
        2.  Rendre le composant `Sidebar`.
        3.  Simuler un clic sur le premier email de la liste.
        4.  **Assertion :** Vérifier que l'état du store a été mis à jour et que l'ID de l'email sélectionné est bien celui sur lequel on a cliqué.

*   **Scénario 2 : La mise à jour du store met à jour `EmailContent`**
    *   **Description :** Ce test est l'étape suivante du précédent. Il vérifie que lorsque l'état de l'email sélectionné change dans le store, le composant `EmailContent` (affiché dans `EmailsPage`) se met à jour pour afficher les nouvelles données.
    *   **Prérequis :** Le composant `EmailsPage` doit être modifié pour passer l'email sélectionné du store au composant `EmailContent`, au lieu du texte statique "Lorem Ipsum".
    *   **Étapes :**
        1.  Initialiser le store avec une liste d'emails et aucun email sélectionné.
        2.  Rendre la page complète `<EmailsPage />`. `EmailContent` devrait être vide ou afficher un message par défaut.
        3.  Simuler une mise à jour de l'état du store (en appelant `store.getState().setSelectedEmailId('email-123')`).
        4.  **Assertion :** `EmailContent` doit maintenant afficher le sujet et le contenu de l'email 'email-123'.

---

## 4. Tests End-to-End (E2E) avec Playwright

**Objectif :** Valider le pipeline complet (de la réception de l'email à son affichage) et l'utilisabilité de l'interface, en se basant **strictement sur les fonctionnalités existantes**.

**Prérequis :**
*   Un environnement de test capable de lancer le back-end et le front-end.
*   Une boîte email de test configurée dans le back-end.

### Scénario 1 : Visualisation et classification automatique d'un nouvel email

*   **Description :** Ce test est le plus crucial pour l'état actuel du projet. Il valide que l'ensemble de la chaîne de traitement fonctionne : connexion IMAP, analyse par l'IA, communication WebSocket, et affichage dans le front-end.
*   **Étapes :**
    1.  **Préparation :** Le script de test envoie un email avec un sujet et un contenu spécifiques (ex: "Facture de test pour E2E") à la boîte mail de test.
    2.  **Lancement :** Le test ouvre la page de l'application front-end avec Playwright.
    3.  **Attente et Vérification :**
        *   Le test attend qu'un élément contenant le sujet "Facture de test pour E2E" apparaisse dans la liste d'emails. Utiliser `page.waitForSelector()` ou une assertion Playwright.
        *   `await expect(page.locator('text=Facture de test pour E2E')).toBeVisible({ timeout: 15000 });` (un timeout généreux pour laisser le temps au back-end de traiter l'email).
    4.  **Action :**
        *   `await page.locator('text=Facture de test pour E2E').click();`
    5.  **Vérification finale :**
        *   Vérifier que le panneau de détail de l'email s'affiche.
        *   `await expect(page.locator('.email-detail-pane')).toBeVisible();`
        *   Vérifier que la catégorie suggérée par l'IA (ex: "Invoice") est bien affichée dans ce panneau.
        *   `await expect(page.locator('.suggested-category')).toHaveText('Invoice');` (l'identifiant du sélecteur est à adapter).

### Scénario 2 : Navigation au clavier dans la liste d'emails

*   **Description :** Ce test valide l'accessibilité de base de l'application en simulant une navigation au clavier, une fonctionnalité importante même pour une interface non finalisée.
*   **Étapes :**
    1.  **Préparation :** L'application est ouverte et affiche une liste d'au moins deux emails.
    2.  **Action et Vérification (Focus initial) :**
        *   `await page.keyboard.press('Tab');` pour déplacer le focus sur le premier élément interactif (probablement le premier email de la liste).
        *   `await expect(page.locator('.email-list-item:nth-child(1)')).toBeFocused();` (le sélecteur est à adapter).
    3.  **Action et Vérification (Déplacement) :**
        *   `await page.keyboard.press('ArrowDown');`
        *   `await expect(page.locator('.email-list-item:nth-child(2)')).toBeFocused();`
    4.  **Action et Vérification (Sélection) :**
        *   `await page.keyboard.press('Enter');`
        *   `await expect(page.locator('.email-detail-pane .subject')).toHaveText('Sujet du deuxième email');` (vérifier que le détail du bon email est affiché).

---

## 4. Estimation de la Couverture de Code

L'objectif principal des tests n'est pas d'atteindre 100% de couverture, mais de s'assurer que toute la logique métier critique est robuste et testée. Voici une estimation réaliste de ce que vous pouvez attendre avec la stratégie décrite dans ce guide.

*   **`apps/backend/src/core/eventManager.ts` : 95% - 100%**
    *   Les tests unitaires proposés sont exhaustifs et couvrent tous les cas de figure de la file d'attente (nominal, asynchrone, erreur). Il est tout à fait possible d'atteindre une couverture quasi complète pour ce module critique.

*   **`apps/backend/src/modules/email/email-automations.ts` : 90% - 95%**
    *   Les fonctions pures (`getClientId`, `defineEmailAutomation`) peuvent être testées à 100%.
    *   Les fonctions d'orchestration (`categoriseEmail`, `prepareResponse`) sont testées en simulant l'IA, ce qui permet de couvrir toutes les branches logiques internes. La petite portion non couverte serait le code d'appel réel à `useAI`, ce qui est acceptable.

*   **Couverture Globale du Back-end (estimée) : 80% - 85%**
    *   En se concentrant sur ces fichiers qui contiennent la majorité de la logique complexe, la couverture globale du back-end sera élevée. Le code restant (configuration, points d'entrée principaux comme `index.ts`) est souvent plus simple et moins critique à tester unitairement. Ce score représente un excellent niveau de confiance dans la stabilité de l'application.

*   **Tests E2E :**
    *   La couverture de code n'est pas la métrique principale pour les tests E2E. Leur but est de valider des flux fonctionnels. Les deux scénarios proposés valident **100% du flux critique actuel** (réception -> traitement -> affichage), ce qui est l'objectif le plus important.
