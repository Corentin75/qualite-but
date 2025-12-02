type EmailContentProps = {
  title: string;
  content: string;
  children?: React.ReactNode
}

export default function EmailContent ({ title, content, children }: EmailContentProps) {
  return (
    <article className="emailContent">
      <h2>{title}</h2>
      <p>{content}</p>
      {children}
    </article>
  );
};