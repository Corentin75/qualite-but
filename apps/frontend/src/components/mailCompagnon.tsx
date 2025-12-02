import { useEmailStore } from '../stores/emailStore';
import { WebSocketEmailAction } from "@sharedWebsocketEmail/websocketEmail.enum";
import { categoriesSettings } from '@appSettings/emails.settings';

export default function MailCompagnon() {
  const { 
    emails, 
    selectedTag, 
    selectedEmail, 
    selectTag, 
    selectEmail, 
    sendAction 
  } = useEmailStore();
  
  // Filter emails by selected tag
  const filteredEmails = selectedTag 
    ? emails.filter(email => email.tags.includes(selectedTag))
    : emails;
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', padding: '20px' }}>
      {/* Left Panel: Tags and Emails */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Tags Section */}
        <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Tags</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {categoriesSettings.map(([tag, description, action]) => (
              <button
                key={tag}
                onClick={() => selectTag(tag)}
                style={{
                  padding: '8px 12px',
                  border: selectedTag === tag ? '2px solid #28a745' : '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: selectedTag === tag ? '#d4edda' : 'transparent'
                }}
              >
                {tag} ({filteredEmails.filter(email => email.tags.includes(tag)).length})
              </button>
            ))}
          </div>
        </div>
        
        {/* Emails List */}
        <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Emails</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {filteredEmails.map(email => (
              <div
                key={email.id}
                onClick={() => selectEmail(email)}
                style={{
                  padding: '10px',
                  border: '1px solid #eee',
                  cursor: 'pointer',
                  marginBottom: '5px',
                  backgroundColor: selectedEmail?.id === email.id ? '#e9ecef' : 'transparent'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{email.sender}</div>
                <div>{email.subject}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right Panel: Email Details */}
      <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        {selectedEmail ? (
          <>
            <div style={{ fontWeight: 'bold' }}>{selectedEmail.sender}</div>
            <div>{selectedEmail.subject}</div>
            <div>{selectedEmail.date}</div>
            <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <div style={{ fontWeight: 'bold' }}>Content:</div>
              <div>{selectedEmail.content}</div>
            </div>
            
            {/* Action Button */}
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={() => 
                  sendAction(
                    categoriesSettings.find(([tag]) => tag === selectedTag)?.[2] || WebSocketEmailAction.SEND,
                    selectedEmail.id
                  )
                }
                style={{ padding: '10px 15px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                {categoriesSettings.find(([tag]) => tag === selectedTag)?.[0] || 'Send'}
              </button>
            </div>
          </>
        ) : (
          <p>No email selected</p>
        )}
      </div>
    </div>
  );
}