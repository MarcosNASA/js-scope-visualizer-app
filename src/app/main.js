/* eslint-disable guard-for-in */
'use strict';

var app = (function App() {
  // const defaultScope = {
  //   name: 'global',
  //   varDeclarations: [],
  //   varAccesses: [],
  //   scopes: [],
  //   startLine: null,
  //   endLine: null,
  //   color: '#db1d0f',
  // };
  const squareFallback = { x: 0, y: 0, width: 0, height: 0 };
  const defaultCode = {
    value: '',
    rawValue: '',
    codeLines: [],
    parsed: undefined,
    scopes: [],
    valid: true,
  };
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
    code = { ...defaultCode };
    codeEditor = setupCodeEditor(document.getElementById('code-editor'), false);
    codeEditor.save();
    codeDisplayer = setupCodeEditor(
      document.getElementById('code-displayer'),
      true,
    );
    scopeBubbles = document.getElementById('scopes');
    visualizer = document.querySelector(
      '.code-displayer > .CodeMirror .CodeMirror-code',
    );

    codeEditor.on('change', onInput);
    window.addEventListener('resize', onResize);
    return codeEditor;
  }

  function setupCodeEditor(codeEditor, readOnly) {
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
  function onResize(event) {
    updateCodeDisplayer(code);
  }

  /**
   *
   */
  function processCode(code, value) {
    var processedCode = JSON.parse(JSON.stringify(code));
    processedCode.rawValue = value;

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

    processedCode = processedCode.valid
      ? {
          ...processedCode,
          parsed: esprima.parse(processedCode.value, {
            range: true,
            loc: true,
            tokens: true,
          }),
        }
      : processedCode;

    processedCode = processedCode.valid
      ? processLines(Object.freeze(processedCode))
      : processedCode;

    processedCode = processedCode.valid
      ? processScopes(Object.freeze(processedCode))
      : processedCode;

    return processedCode;
  }

  function processLines(code) {
    var codeProcessedLines = { ...code };
    {
      let previousChars = 0;
      var codeLines = codeProcessedLines.value
        .split(/(\n)/)
        .map(function processLine(line) {
          var processedLine = {
            line,
            startChar: previousChars,
            endChar: previousChars + line.length,
          };
          previousChars = processedLine.endChar;
          return processedLine;
        })
        .filter(function filterEmptyLines(lineObj) {
          return lineObj.line !== '\n';
        });
    }

    return { ...codeProcessedLines, codeLines };
  }

  /**
   *
   */
  function processScopes(code) {
    var scopes = escope.analyze(Object.freeze(code.parsed), { ecmaVersion: 6 });

    var levels = eslevels.levels(Object.freeze(code.parsed), {
      mode: 'full',
      escopeOpts: {
        ecmaVersion: 6,
      },
    });

    var levelsNumber = [
      ...new Set(
        [...levels].map((level) => {
          return level[0];
        }),
      ),
    ].length;

    return {
      ...code,
      scopes: {
        ...scopes,
        scopesNumber: scopes.scopes.length,
        levels,
        levelsNumber,
      },
    };
  }

  /**
   *
   */
  function updateCodeDisplayer(code) {
    requestAnimationFrame(() => {
      codeDisplayer.setValue(code.value);
    });

    requestAnimationFrame(function clearBubbles() {
      restart();
      clearVisualization();
    });

    if (code.valid && code.value) {
      requestAnimationFrame(function setVisualization() {
        code = setBubbles(code);
        drawBubbles(code);
      });
    }
  }

  /**
   *
   */
  function setBubbles({ codeLines, scopes, ...rest }) {
    var visualizerFigure = visualizer.getBoundingClientRect();
    drawBubble(visualizerFigure, visualizerFigure);

    var codeLineElements = [
      ...visualizer.getElementsByClassName('CodeMirror-line'),
    ];

    var bubbles = {
      scopes: [],
    };
    for (let scope of scopes.scopes) {
      let {
        block: {
          range: [scopeRangeStart, scopeRangeEnd],
        },
        variables,
      } = scope;
      // let [scopeRangeStart, scopeRangeEnd] = scope.block.range;
      let scopeBubbleLines = [];
      let scopeBubbleVariables = [];
      for (let i = 0; i < codeLines.length; i++) {
        if (
          codeLines[i].startChar >= scopeRangeStart &&
          codeLines[i].endChar <= scopeRangeEnd
        ) {
          scopeBubbleLines.push(codeLineElements[i]);
          // scopeBubbleVariables.push(codeLineElements[i]);
        }
      }
      bubbles.scopes.push({
        lines: scopeBubbleLines,
        variables,
        color: randomColor(),
      });
    }

    console.log(bubbles);

    // for (let i = 0; i < codeLineElements.length; i++) {
    //   if (codeLineElements[i].textContent.trim() == codeLines[i].line.trim()) {
    //     console.log('equal');
    //   } else if (
    //     codeLineElements[i].textContent.trim() == '&#8203;' &&
    //     codeLines[i].line.trim() == ''
    //   ) {
    //     console.log('equal empty');
    //   } else {
    //     console.log('not equal');
    //     console.log(codeLineElements[i].textContent.trim());
    //     console.log(codeLines[i].line.trim());
    //   }
    //   console.log(codeLineElements[i]);
    //   console.log(codeLines[i]);
    // }

    console.log(scopes);
    return { codeLines, scopes, ...rest };
  }

  /**
   *
   */
  function drawBubbles({ codeLines, scopes, ...rest }) {}

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
    color = randomColor(),
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
  function clearVisualization() {
    scopeBubbles.innerHTML = '';
  }

  /**
   *
   */
  function restart() {
    code = { ...defaultCode };
  }
})();

app.bootstrap();
