import { useEmailStore } from "@store/emailStore";

import type { Email, TagListResponse } from "@sharedWebsocketEmail/websocketEmail.types";

import "./sidebar.scss";

export default function Sidebar() {
  const {tagsList, emails} = useEmailStore();

  function selectEmail(emailUid: string) {
    console.log(emailUid);
  }

  function selectTag(tagId: number) {
    console.log(tagId);
  }

  return (
    <aside className="sidebar">
      <ul>
        {(tagsList as TagListResponse[]).map((tag) => (
          <li key={tag.uid+tag.name} onClick={()=>selectTag(tag.uid)}>
            {tag.name}
          </li>
        ))}
      </ul>

      <ul>
        {(emails as Email[]).map((email) => (
          <li key={email.id} onClick={()=>selectEmail(email.id)}>
            {email.subject}
          </li>
        ))}
        <button>delete</button>
      </ul>
    </aside>
  );
};