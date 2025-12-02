import { create } from 'zustand'

export interface ButtonMultiStore {
  currentAction   : number
  options         : string[]
  setCurrentAction: (actionId: number) => void
  setOptions      : (options: string[]) => void
}

function createButtonMultiStore(options: string[] = []) {
  return create<ButtonMultiStore>((set) => ({
    currentAction: 0,
    options,
    setCurrentAction: (actionId: number) => {
      set({ currentAction: actionId })
    },
    setOptions: (options:string[]) => set({ options }),
  }))
}

export const useButtonListEmailStore  = createButtonMultiStore(["archiver", "effacer", "changer de catégorie"]);//TODO plus tard charger les options depuis le backend
export const useButtonPanelEmailStore = createButtonMultiStore(["archiver", "envoyer", "effacer", "reformuler", "proposer une réponse"]);//TODO plus tard charger les options depuis le backend

//TODO fin de journée : ajouter la source dans le composant, ca ne fonctionne pas pour le moment