import "./mainNav.scss";

export default function MainNav() {
  const tabs = ['Emails', 'Prospects / Clients', 'Projets'];
  const active = 0;

  return (
    <nav className="header">
      {tabs.map((tab, index) => (
        <button key={index} aria-pressed={index === active} >
          {tab}
        </button>
      ))}
    </nav>
  );
};