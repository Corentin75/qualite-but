  // import type { WebSocketMessage } from "@sharedWebsocketEmail/websocket.types";

import { create } from 'zustand';

import type { Email, TagListResponse } from '@sharedWebsocketEmail/websocketEmail.types';

  // import { sendWs, startWebsocket } from '../connexions/websocket';
import { registerActions, sendWs }                  from '../connexions/websocket';
import { WebSocketEmailAction, WebSocketTagAction } from '@sharedWebsocketEmail/websocketEmail.enum';



interface EmailState {
  emails       : Email[];
  selectedTag  : string    | null
  selectedEmail: Email     | null
  tagsList     : TagListResponse[]

  // actions tags
  initTagList : () => void
  setTagsList: (tags: TagListResponse[]) => void

  // actions emails
  initEmailList: () => void
  setEmailsList: (emails: Email[]) => void
    // setCurrentEmail: (email: Email) => void;
    // selectTag: (tag: string) => void;setTagsList
    // selectEmail: (email: Email) => void;
    // sendAction: (action: WebSocketEmailAction, emailId: string, response?: string) => void;
}

/* used to store all tags because tagList will be reduce with only used tags */
let allTags: string[] = [];

  // startWebsocket({
  //     [WebSocketEmailAction.GET_LIST]: ({data}:WebSocketMessage) => {
  //       console.log("GET_LIST", data);
  //     }

  //   },
  //   () => sendWs({
  //     action: WebSocketEmailAction.GET_LIST
  //   })
  // );

export const useEmailStore = create<EmailState>((set, get) => ({
  emails       : [],
  selectedTag  : 'important',
  selectedEmail: null,
  websocket    : null,
  tagsList     : [],

  //actions tags
  initTagList: () => askList(false, get().tagsList),
  setTagsList: (tags: TagListResponse[]) => set({ tagsList: tags }),

  // actions emails
  initEmailList: () => askList(true, get().emails),
  setEmailsList: (emails: Email[]) => set({ emails }),
  setCurrentEmail: (email: Email) => set({ selectedEmail: email }),


    // selectTag: (tag: string) => set({ selectedTag: tag }),
  
    // selectEmail: (email: Email) => set({ selectedEmail: email }),
  
    // sendAction: (action: WebSocketEmailAction, emailId: string, response?: string) => {
    //   if (!useEmailStore.getState().websocket) return;
    
    //   // const message = JSON.stringify({
    //   //   action,
    //   //   data: {
    //   //     response,
    //   //     emailID: emailId
    //   //   }
    //   // });
    
    //   // useEmailStore.getState().websocket.send(message);
    // }
}));


function askList(isEmail: boolean, currentList: TagListResponse[] | Email[]) {
  if (currentList.length > 0) return;
  if (!isEmail){
    useEmailStore.getState().setTagsList([{name: 'Loading...', uid: -1}]);
    sendWs({
      action: WebSocketTagAction.GET_LIST
    });
  }
  else {
    useEmailStore.getState().setEmailsList([{id: "", date: '', sender: '', subject: 'loading...', content: '', tags: []}]);
    sendWs({
      action: WebSocketEmailAction.GET_LIST
    });
  }
}


registerActions({

  [WebSocketTagAction.GET_LIST]: ({data}:{data:TagListResponse[]}) => {
    useEmailStore.getState().setTagsList(data);
  },

  [WebSocketEmailAction.GET_LIST]: ({data}:{data:Email[]}) => {
    useEmailStore.getState().setEmailsList(data);
  }
})