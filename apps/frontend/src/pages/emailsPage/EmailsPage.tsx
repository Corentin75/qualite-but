import ButtonMulti                  from "@components/buttonMulti/ButtonMulti";
import EmailContent                 from "@components/emailContent/EmailContent";
import Sidebar                      from "@components/sidebar/Sidebar";
import { useButtonPanelEmailStore } from "@store/buttonActionEmail.store";
import { useEmailStore }            from "@store/emailStore";

import "./emailsPage.scss";

export default function EmailsPage() {

  const { initTagList, initEmailList } = useEmailStore();

  initTagList();
  initEmailList();

  const loremText = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

  return (
    <>
      <Sidebar />
      <EmailContent title="Heading" content={loremText} />
      <EmailContent title="Heading" content={loremText}>
        <ButtonMulti source={useButtonPanelEmailStore} />
      </EmailContent>
    </>
  );
};