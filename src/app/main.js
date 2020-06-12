'use strict';

var app = (function App() {
  const defaultScope = {
    name: 'global',
    varDeclarations: [],
    varAccesses: [],
    scopes: [],
    color: 'rgba(220, 30, 15, 0.5)',
  };
  const squareFallback = { x: 0, y: 0, width: 0, height: 0 };
  var code;
  var codeEditor;
  var codeDisplayer;
  var canvas;
  var ctx;
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
    codeDisplayer = setupCodeEditor(
      document.getElementById('code-displayer'),
      true,
    );
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    visualizer = document.querySelector(
      '.code-displayer > .CodeMirror .CodeMirror-code',
    );

    codeEditor.on('change', onInput);
  }

  function setupCodeEditor(codeEditor, readOnly) {
    CodeMirror.colorize();
    var codeMirror = CodeMirror.fromTextArea(codeEditor, {
      mode: 'application/javascript',
      // value: !readOnly
      //   ? ``
      //   : '',
      lineNumbers: true,
      lineWrapping: true,
      autofocus: !readOnly,
      readOnly,
      tabSize: 2,
      tabindex: 0,
    });

    return codeMirror;
  }

  function onInput(event) {
    code = processCode(Object.freeze(code), event.getValue());
    updateCodeDisplayer(code);
  }

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

  function processScopes(code) {
    var processedScopes = [{ ...defaultScope }];

    console.log(processedScopes);

    return { ...code, scope: processedScopes };
  }

  function updateCodeDisplayer(code) {
    requestAnimationFrame(() => {
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

  function setVisualization(code) {
    var visualizerFigure = visualizer.getBoundingClientRect();
    drawBubble(code.scopes[0].color, visualizerFigure, visualizerFigure);
    var elements = visualizer.querySelectorAll('pre.CodeMirror-line');
    elements.forEach((e) => {
      console.log(e.textContent);
    });
  }

  function drawBubble(
    color,
    {
      x: bX = 0,
      y: bY = 0,
      width: bWidth = 0,
      height: bHeight = 0,
    } = squareFallback,
    { x = 0, y = 0 } = squareFallback,
  ) {
    ctx.fillStyle = color;
    console.log(ctx);
    console.log(bX, bY, bWidth, bHeight);
    ctx.fillRect(bX - x, bY - y, bWidth, bHeight);
    console.log(canvas);
  }

  function clearVisualization(code) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
})();

app.bootstrap();
