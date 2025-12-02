import EmailsPage       from './pages/emailsPage/EmailsPage'
import MainNav          from './components/mainNav/MainNav'
import { useMainStore } from '@store/main.store';

import "./App.scss"

export default function App() {

  const {isConnected } = useMainStore();

  function connecting() {
    return <div style={{
        width         : "100vw",
        height        : "100vh",
        display       : "flex",
        alignItems    : "center",
        justifyContent: "center",
        textAlign     : "center"
      }}>connecting...</div>
  }

  function showApp() {
    return (
      <>
        <MainNav />
        <main className="contentArea" data-page="emailsPage">
          <EmailsPage />
        </main>
      </>
    )
  }

  return isConnected ? showApp() : connecting();
}