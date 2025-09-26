import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import AISidebarWidget from './ai-sidebar'


function _activate(app: JupyterFrontEnd){
  console.log('AI Sidebar')
  
  const command: string = 'aisbw:open';
    app.commands.addCommand(command, {
      label: 'AI',
      execute: () => {
        const widget = new AISidebarWidget();
        console.log(widget)
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
  activate: _activate
};

export default plugin;
