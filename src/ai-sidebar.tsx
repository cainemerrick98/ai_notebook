import * as React from 'react';
import { ReactWidget } from '@jupyterlab/ui-components';
import { requestAPI } from './handler';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';

interface Message {
    sender: string
    content: string
}

interface LLMResponse{
    response: string
}

interface Context{
    cells:string
}

export async function callLLM(message: Message, context:Context): Promise<LLMResponse> {
  // POST request options
  const body = {
    message: message,
    context: context
  }
  const init: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };

  console.log(init)

  // Call the API extension
  const data = await requestAPI<LLMResponse>('llm', init);

  return data;
}

const AISidebar = ({ tracker }: { tracker: INotebookTracker }) => {
    const [messages, SetMessages] = React.useState<Message[]>([]);
    const [input, setInput] = React.useState('');
    const [currentNotebook, setCurrentNotebook] = React.useState<NotebookPanel | null>(null);
    const [currentCells, setCurrentCells] = React.useState<string[]>([]);
    const [selectedCell, setSelectedCell] = React.useState<string>('')

    React.useEffect(() => {
        const onNotebookChange = (_: any, panel: NotebookPanel | null) => {
            setCurrentNotebook(panel);
        }

        tracker.currentChanged.connect(onNotebookChange)

        if(tracker.currentWidget){
            setCurrentNotebook(tracker.currentWidget)
        }

        return () => {
            tracker.currentChanged.disconnect(onNotebookChange)
        }
    }, [tracker])

    React.useEffect(() => {
        if(!currentNotebook) {
            setCurrentCells([])   
            return
        }

        const notebook = currentNotebook.content;
        
        const updateCells = () => {
            setCurrentCells(
                notebook.widgets.map(cell => cell.model.sharedModel.getSource())
            )
        }

        updateCells()

        notebook.model?.cells.changed.connect(updateCells)
        notebook.model?.contentChanged.connect(updateCells)

        return () => {
            notebook.model?.cells.changed.disconnect(updateCells)
            notebook.model?.contentChanged.disconnect(updateCells)
        }

    }, [currentNotebook])
    

    const sendMessage = () => {
        if (!input.trim()) return;

        const userMessage = { sender: 'User', content: input };
        const includedContext = {cells: selectedCell}
        
        SetMessages(prev => [...prev, userMessage]);
        
        setInput('');
        
        callLLM(userMessage, includedContext).then(aiResponse => {
            SetMessages(prev => [...prev, { sender: 'Assistant', content: aiResponse.response }]);
        });
    };
    
    return( 
        <div style={{ display: 'flex', flexDirection: 'column', height:'100%', justifyContent:'space-between'}}>
            <h1>AI Assistant</h1>
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

            <div style={{ display: 'flex' , padding:'8px', borderTop:'1px solid'}}>
                <select onChange={(e) => setSelectedCell(e.target.value)}>
                    <option
                    id='null_option'
                    value=''
                    >Select a cell</option>
                    {currentCells.map((cell, idx) =>(
                        <option
                        key={idx}
                        id={`${idx}`}
                        value={cell}
                        > {`${idx}.${cell.slice(0, 10)}`}
                        </option>

                    ))}
                </select>
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
    tracker: INotebookTracker
    constructor(tracker: INotebookTracker){
        super()
        this.addClass('aisbw')
        this.id = 'ai-sidebar'
        this.tracker = tracker
    }

    render(): JSX.Element{
        return <AISidebar tracker={this.tracker}/>
    }
}

export default AISidebarWidget
