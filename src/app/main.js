'use strict';

var app = (function App() {
  const defaultScope = {
    name: 'global',
    varDeclarations: [],
    varAccesses: [],
    scopes: [],
    color: '#db1d0f',
  };
  const squareFallback = { x: 0, y: 0, width: 0, height: 0 };
  var code;
  var codeEditor;
  var codeDisplayer;
  var scopeBubbles;
  var visualizer;

  return { bootstrap };

  /**
   * Initialize the app.
   */
  function bootstrap() {
    code = {
      value: '',
      parsed: undefined,
      scopes: [{ ...defaultScope }],
      scopesNumber: 1,
      valid: true,
    };
    codeEditor = setupCodeEditor(document.getElementById('code-editor'), false);
    codeEditor.save();
    codeDisplayer = setupCodeEditor(document.getElementById('code-displayer'), true);
    scopeBubbles = document.getElementById('scopes');
    // visualizer = document.querySelector(
    //   '.code-displayer > .CodeMirror .CodeMirror-code',
    // );

    codeEditor.on('change', onInput);
    return codeEditor;
  }

  function setupCodeEditor(codeEditor, readOnly) {
    CodeMirror.colorize();
    var codeMirror = CodeMirror.fromTextArea(codeEditor, {
      mode: 'application/javascript',
      value: ``,
      lineNumbers: true,
      lineWrapping: true,
      autofocus: true,
      readOnly: readOnly,
      tabSize: 2,
      tabindex: 0,
    });

    return codeMirror;
  }

  /**
   *
   */
  function onInput(event) {
    code = processCode(Object.freeze(code), event.getValue());
    updateCodeDisplayer(code);
  }

  /**
   *
   */
  function processCode(code, value) {
    var processedCode = JSON.parse(JSON.stringify(code));
    try {
      processedCode.value = prettier
        .format(value, {
          parser: 'babel',
          plugins: prettierPlugins,
          useTabs: true,
        })
        .replace(
          /(?<tabs>\t*)(?<other>.*)(?<pre>function *.*\()(?<args>.+)(?<post>\))/g,
          '$<tabs>$<other>$<pre>\n$<tabs>\t$<args>\n$<tabs>$<post>',
        );
      processedCode.valid = true;
    } catch (e) {
      processedCode.value = e.toString();
      processedCode.valid = false;
    }

    processedCode.parsed = processedCode.valid
      ? esprima.parse(processedCode.value)
      : null;

    processedCode = processScopes(Object.freeze(processedCode));

    return processedCode;
  }

  /**
   *
   */
  function processScopes(code) {
    var processedScopes = [{ ...defaultScope }];

    return { ...code, scope: processedScopes };
  }

  /**
   *
   */
  function updateCodeDisplayer(code) {
    requestAnimationFrame(() => {
      // write(code.value);
      codeDisplayer.setValue(code.value);
    });
    if (code.valid && code.value) {
      requestAnimationFrame(function clearBubbles() {
        clearVisualization(code);
      });
      requestAnimationFrame(function drawBubbles() {
        setVisualization(code);
      });
    } else {
      requestAnimationFrame(function clearBubbles() {
        clearVisualization(code);
      });
    }
  }

  /**
   *
   */
  function write(code) {
    codeDisplayer.innerHTML = '';
    var codeLines = code.split('\n');
    codeLines.forEach((codeLine) => {
      var line = document.createElement('div');
      {
        let codeFragments = codeLine.split('\t');
        codeFragments.forEach((codeFragment) => {
          if (codeFragment == '') {
            var tab = document.createElement('span');
            tab.classList.add('tab');
            line.appendChild(tab);
          }
        });
      }
      {
        let lineCode = document.createElement('span');
        lineCode.textContent = codeLine;
        line.appendChild(lineCode);
      }
      line.classList.add('line');
      codeDisplayer.appendChild(line);
    });
  }

  /**
   *
   */
  function setVisualization(code) {
    // var visualizerFigure = visualizer.getBoundingClientRect();
    // drawBubble(visualizerFigure, visualizerFigure);
    // elements.forEach((e) => {
    //   console.log(e.textContent);
    // });
  }

  /**
   *
   */
  function drawBubble(
    {
      x: bubbleX = 0,
      y: bubbleY = 0,
      width: bubbleWidth = 0,
      height: bubbleHeight = 0,
    } = squareFallback,
    { x = 0, y = 0 } = squareFallback,
    color = defaultScope.color,
  ) {
    var bubble = document.createElement('div');
    bubble.classList.add('scopes__bubble');
    bubble.style = `
                    background-color: ${color};
                    width: ${bubbleWidth}px;
                    height: ${bubbleHeight}px;
                    top: ${bubbleX - x}px;
                    left: ${bubbleY - y}px;
                    `;
    bubble.style.width = bubbleWidth;
    bubble.style.height = bubbleHeight;
    scopeBubbles.appendChild(bubble);
  }

  /**
   *
   */
  function clearVisualization(code) {
    scopeBubbles.innerHTML = '';
  }
})();

app.bootstrap();
