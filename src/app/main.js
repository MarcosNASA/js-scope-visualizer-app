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
    bubbles: [],
    valid: true,
  };
  var code;
  var codeEditor;
  var codeDisplayer;
  var scopeBubbles;

  return { bootstrap };

  /**
   * Initialize the app.
   */
  function bootstrap() {
    code = { ...defaultCode };
    codeEditor = setupCodeEditor(document.getElementById('code-editor'));
    codeDisplayer = document.getElementById('code-displayer');
    scopeBubbles = document.getElementById('scopes');

    codeEditor.on('change', handleInput);
    codeDisplayer.onscroll = handleDisplayerScroll;
    window.onresize = handleResize;
  }

  function setupCodeEditor(codeEditor) {
    var codeMirror = CodeMirror.fromTextArea(codeEditor, {
      mode: 'application/javascript',
      value: ``,
      lineNumbers: true,
      lineWrapping: true,
      autofocus: true,
      readOnly: false,
      tabSize: 2,
      tabindex: 0,
    });

    return codeMirror;
  }

  /**
   *
   */
  function handleInput(event) {
    code = processCode(code, event.getValue());
    updateCodeDisplayer(code);
  }

  /**
   *
   */
  function handleDisplayerScroll(event) {
    console.log(event);

    scopeBubbles.scrollTop = event.target.scrollTop;
  }

  /**
   *
   */
  function handleResize() {
    console.log(code);
    // code = processCode(code, code.value);
    // updateCodeDisplayer(code);
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
      ? processLines(processedCode)
      : processedCode;

    processedCode = processedCode.valid
      ? processScopes(processedCode)
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
    var scopes = escope.analyze(code.parsed, { ecmaVersion: 6 });

    var levels = eslevels.levels(code.parsed, {
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
      write(code.value);
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
  function write(code) {
    codeDisplayer.innerHTML = '';
    var codeLines = code.split('\n');
    codeLines.forEach(function customLineWriting(codeLine) {
      var line = document.createElement('div');
      {
        let codeFragments = codeLine.split('\t');
        codeFragments.forEach(function addTabs(codeFragment) {
          if (codeFragment == '') {
            var tab = document.createElement('span');
            tab.classList.add('tab');
            line.appendChild(tab);
          }
        });
      }
      {
        let lineCode = document.createElement('span');
        codeLine
          .split(/([a-zA-Z0-9]+)/g)
          .filter(function filterEmptyTokens(token) {
            return token;
          })
          .forEach(function tokenizeLine(token) {
            var word = document.createElement('span');
            word.textContent = token;
            lineCode.appendChild(word);
          });
        line.appendChild(lineCode);
      }
      line.classList.add('line');
      codeDisplayer.appendChild(line);
    });
  }

  /**
   *
   */
  function setBubbles({ codeLines, scopes, ...rest }) {
    var codeLineElements = [...codeDisplayer.getElementsByClassName('line')];

    var bubbles = [];

    for (let scope of scopes.scopes) {
      let {
        block: {
          range: [scopeRangeStart, scopeRangeEnd],
        },
        variables,
      } = scope;
      let scopeColor = randomColor();
      let scopeBubbleLines = [];

      for (let i = 0; i < codeLines.length; i++) {
        if (
          codeLines[i].startChar >= scopeRangeStart &&
          codeLines[i].endChar <= scopeRangeEnd
        ) {
          scopeBubbleLines.push(codeLineElements[i]);
        }
      }
      let scopeBubbleVariables = [];

      for (let {
        name,
        identifiers: [
          { loc: { start: startChar, end: endChar } = {} } = {},
        ] = [],
      } of variables) {
        scopeBubbleVariables.push({
          name,
          startChar,
          endChar,
          color: scopeColor,
        });
      }

      bubbles.push({
        lines: scopeBubbleLines,
        scopeBubbleVariables,
        color: scopeColor,
      });
    }

    return { codeLines, scopes, ...rest, bubbles };
  }

  /**
   *
   */
  function drawBubbles({
    codeLines,
    bubbles: [{ lines, color }, ...bubbles],
    ...rest
  }) {
    var codeLineElements = [...codeDisplayer.getElementsByClassName('line')];
    var codeDisplayerFigure = scopeBubbles.getBoundingClientRect();

    // GLOBAL.
    var { x, y, width, height } = lines[0].getBoundingClientRect();
    drawBubble(
      { x, y, width, height: height * lines.length },
      squareFallback,
      color,
      true,
    );

    // REST.
    for (let { lines, color } of bubbles) {
      let { x, y, width, height } = lines[0].getBoundingClientRect();
      drawBubble(
        { x, y, width, height: height * lines.length },
        squareFallback,
        color,
        false,
      );
    }
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
    color = randomColor(),
    isGlobal = false,
  ) {
    var bubble = document.createElement('div');
    bubble.classList.add(
      isGlobal ? 'scopes__bubble--global' : 'scopes__bubble',
    );
    bubble.style = `
                    background-color: ${color};
                    width: ${bubbleWidth}px;
                    height: ${bubbleHeight}px;
                    top: ${bubbleY - y}px;
                    left: ${bubbleX - x}px;
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
