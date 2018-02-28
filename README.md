This is a vs code extension. Learn how to write vs code extensions here: https://code.visualstudio.com/docs/extensions/overview

## Getting Started
1. Install `Node.js` using `brew install node`/Windows equivalent. You should install at least version 6.x.
2. Navigate to this project directory and run `npm install`. You may also need to run `npm install -g npm`. 
3. Open the folder containing this README.md in Visual Studio Code.
4. Create an env/ folder in the loom folder, and create a file called discovery_credential.json.
5. Place a Watson Discovery credential in the file.
6. Go to the Debug menu in the left bar (4th icon down)
7. Click the green Run arrow with *Extension* selected in the top-left bar
8. Open the command bar using Shift-Command-P/Shift-Control-P and search for the appropriate command.

## Using the plugin
- With a supported filetype (currently only python), a "Weave Search" button is available at the top of the screen.
- - This allows for direct search of Watson's services.
- When working with code, highlight a selection and right-click -> select "Lucky Weave".
- - This will query Watson and display the first result.
- This can also be achieved with ctrl+shift+j with any selection (defaults to the current line)