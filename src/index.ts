import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';
import { 
  INotebookTracker
} from '@jupyterlab/notebook';
import AISidebarWidget from './ai-sidebar'


function _activate(app: JupyterFrontEnd, tracker: INotebookTracker){
  console.log('AI Sidebar')
  
  const command: string = 'aisbw:open';
    app.commands.addCommand(command, {
      label: 'AI',
      execute: () => {
        const widget = new AISidebarWidget(tracker);
        app.shell.add(widget, 'right', {rank: 0})
        app.shell.activateById(widget.id);
      }
    });
  
  app.commands.execute(command);
}

/**
 * Initialization data for the frontend extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'frontend:plugin',
  description: 'Seamless integration of AI into notebooks',
  autoStart: true, 
  requires: [INotebookTracker],
  activate: _activate
};

export default plugin;
