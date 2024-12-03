document.addEventListener('DOMContentLoaded', () => {
  class InteractiveConsole {
    constructor() {
      this.createConsole();
      this.secureConsoleMethods();
      this.attachEventListeners();
    }

    // Create HTML structure for the console
    createConsole() {
      let consoleHTML = `
        <div id="interactiveConsole" style="display: none;">
          <div id="consoleLog"></div>
          <div id="consoleInput">
            <input type="text" id="consoleCommand" placeholder="Enter code here...">
            <button id="executeCommand">Run</button>
          </div>
        </div>
        <button id="consoleToggle" style="bottom: 10px">Console</button>
      `;

      let container = document.createElement('div');
      container.id = 'consoleContainer';
      container.innerHTML = consoleHTML;
      document.body.appendChild(container);

      // Cache elements
      this.consoleContainer = document.getElementById('interactiveConsole');
      this.consoleLog = document.getElementById('consoleLog');
      this.consoleCommand = document.getElementById('consoleCommand');
      this.executeCommand = document.getElementById('executeCommand');
      this.consoleToggle = document.getElementById('consoleToggle');
    }

    // Secure console methods
    secureConsoleMethods() {
      let originalLog = console.log;
      let originalWarn = console.warn;
      let originalError = console.error;
      let originalClear = console.clear;

      console.log = (...args) => {
        originalLog(...args);
        this.appendToConsole('log', args);
      };

      console.warn = (...args) => {
        originalWarn(...args);
        this.appendToConsole('warn', args);
      };

      console.error = (...args) => {
        originalError(...args);
        this.appendToConsole('error', args);
        this.showConsole(); // Auto-show on error
      };

      console.clear = () => {
        originalClear();
        this.clearConsole();
      };

      window.onerror = (message, source, lineno, colno) => {
        this.appendToConsole('error', [`${message} at ${source}:${lineno}:${colno}`]);
        this.showConsole(); // Auto-show on error
      };
    }

    // Append messages to the console log
    appendToConsole(type, args) {
      let logMessage = document.createElement('div');
      let content =
        args.length === 1 && typeof args[0] === 'object'
          ? JSON.stringify(args[0], null, 2)
          : args.join(' ');

      logMessage.style.color = type === 'log' ? '#98c379' : type === 'warn' ? '#e5c07b' : '#e06c75';
      logMessage.textContent = `[${type.toUpperCase()}] ${content}`;
      this.consoleLog.appendChild(logMessage);
      this.consoleLog.scrollTop = this.consoleLog.scrollHeight;
    }

    // Clear console log
    clearConsole() {
      this.consoleLog.innerHTML = '';
    }

    // Show console
    showConsole() {
      this.consoleContainer.style.display = 'flex';
      this.consoleToggle.style.bottom = '30%';
    }

    // Hide console
    hideConsole() {
      this.consoleContainer.style.display = 'none';
      this.consoleToggle.style.bottom = '10px';
    }

    // Attach event listeners
    attachEventListeners() {
      this.consoleToggle.addEventListener('click', () => {
        if (this.consoleContainer.style.display === 'flex') {
          this.hideConsole();
        } else {
          this.showConsole();
        }
      });

      this.executeCommand.addEventListener('click', () => this.executeInputCommand());
      this.consoleCommand.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.executeInputCommand();
      });
    }

    // Execute input command
    executeInputCommand() {
      let command = this.consoleCommand.value.trim();
      if (command) {
        try {
          let result = eval(command);
          this.appendToConsole('log', [`Result: ${result}`]);
        } catch (error) {
          this.appendToConsole('error', [error.message]);
        }
        this.consoleCommand.value = '';
      }
    }
  }

  new InteractiveConsole();
});