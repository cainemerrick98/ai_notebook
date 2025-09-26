import * as React from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';

interface Message {
    sender: string
    content: string
}

const AISidebar = () => {
    const [messages, SetMessages] = React.useState<Message[]>([]);
    const [input, setInput] = React.useState('');

    const sendMessage = () =>{
        if(!input.trim()) return;

        const newMessages = [...messages, {sender:'User', content:input}]

        SetMessages(newMessages)
        setInput('')
    }
    
    return( 
        <div style={{ display: 'flex', flexDirection: 'column', height:'100%', justifyContent:'space-between'}}>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                {messages.map((msg, idx) => (
                    <div
                    key={idx}
                    style={{
                        marginBottom:'6px',
                        textAlign: msg.sender == 'User' ? 'left' : 'right'
                    }}
                    > { msg.content }
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', padding: '8px' }}>
                <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                style={{
                    flex: 1,
                    padding: '6px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    marginRight: '6px'
                }}
                />
                <button
                onClick={sendMessage}
                style={{
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: '4px',
                    background: '#1976d2',
                    color: 'white',
                    cursor: 'pointer'
                }}
                >
                Send
                </button>
            </div>
        </div>
    );
};

class AISidebarWidget extends ReactWidget{
    constructor(){
        super()
        this.addClass('aisbw')
        this.id = 'ai-sidebar'
    }

    render(): JSX.Element{
        return <AISidebar/>
    }
}

export default AISidebarWidget
