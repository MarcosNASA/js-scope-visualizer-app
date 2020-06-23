/* eslint-disable guard-for-in */
'use strict';

var app = (function App() {
  const squareFallback = { x: 0, y: 0, width: 0, height: 0 };
  const defaultCode = {
    value: '',
    rawValue: '',
    codeLines: [],
    codeTokens: [],
    parsed: undefined,
    scopes: undefined,
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

    setEventListeners();

    /**
     *
     */
    function setEventListeners() {
      codeEditor.on('change', handleInput);
      var redrawDebounced = debounce(reDraw, 60);
      codeDisplayer.addEventListener('scroll', redrawDebounced, false);
      window.addEventListener('scroll', redrawDebounced, false);
      window.addEventListener('resize', redrawDebounced, false);

      function debounce(func, wait, immediate) {
        var debounce;
        return function debounced(...args) {
          var context = this;
          var later = function later() {
            debounce = null;
            if (!immediate) {
              func.apply(context, args);
            }
          };
          var callNow = immediate && !debounce;
          clearTimeout(debounce);
          debounce = setTimeout(later, wait);
          if (callNow) {
            func.apply(context, args);
          }
        };
      }
    }
  }

  /**
   *
   */
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
  async function handleInput(event) {
    code = processCode(code, event.getValue());
    await writeCode(code.value);
    updateCodeDisplayer(code);
  }

  /**
   *
   */
  function reDraw() {
    updateCodeDisplayer(code);
  }

  /**
   *
   */
  function processCode(code, value) {
    var processedCode = { ...code };
    processedCode.rawValue = value;

    try {
      processedCode.value = prettier.format(value, {
        parser: 'babel',
        plugins: prettierPlugins,
        useTabs: true,
      });
      // .replace(
      //   /(?<tabs>\t*)(?<other>.*)(?<pre>function *.*\()(?<args>.+)(?<post>\))/g,
      //   '$<tabs>$<other>$<pre>\n$<tabs>\t$<args>\n$<tabs>$<post>',
      // );
      processedCode.valid = true;
    } catch (e) {
      processedCode.value = e.toString();
      processedCode.valid = false;
    }

    if (!processedCode.valid) {
      return processedCode;
    }

    processedCode = {
      ...processedCode,
      parsed: esprima.parse(processedCode.value, {
        range: true,
        loc: true,
        tokens: true,
      }),
    };

    processedCode = processScopes(processedCode);

    processedCode = processLines(processedCode);

    return processedCode;
  }

  function processLines(code) {
    var codeProcessedLines = { ...code };
    var codeLines = [];
    var codeTokens = [];
    {
      let previousChars = 0;
      for (let line of codeProcessedLines.value.split(/(\n)/)) {
        let startChar = previousChars;

        for (let token of line.split(/([a-zA-Z0-9]+)/g)) {
          let processedToken = {
            token,
            startChar: previousChars,
            endChar: previousChars + token.length,
          };
          previousChars = processedToken.endChar;
          codeTokens.push(processedToken);
        }

        let processedLine = {
          line,
          startChar,
          endChar: previousChars,
        };

        codeLines.push(processedLine);
      }
    }

    codeLines = codeLines.filter(function filterEmptyLines(processedLine) {
      return processedLine.line !== '\n';
    });

    codeTokens = codeTokens.filter(function filterEmptyTokens(processedToken) {
      return processedToken.token.trim();
    });

    return { ...codeProcessedLines, codeLines, codeTokens };
  }

  /**
   *
   */
  function processScopes(code) {
    var scopes = escope.analyze(code.parsed, { ecmaVersion: 6 });

    return {
      ...code,
      scopes: {
        ...scopes,
        scopesNumber: scopes.scopes.length,
        scopesColors: randomColor({
          count: scopes.scopes.length,
          luminosity: 'bright',
          seed: 'JSSCOPEVISUALIZER',
        }),
      },
    };
  }

  /**
   *
   */
  function writeCode(code) {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        write(code);
        resolve();
      });
    });
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
      codeLine
        .split(/([a-zA-Z0-9]+)/g)
        .filter(function filterEmptyTokens(token) {
          return token;
        })
        .forEach(function tokenizeLine(token) {
          if (!token) {
            return;
          }

          var word = document.createElement('span');
          word.textContent = token;

          // if (
          //   !jsKeywords.find(function findKeyword(keyword) {
          //     return keyword == token;
          //   }) &&
          //   token.match(/([a-zA-Z0-9]+)/g)
          // ) {
          //   word.classList.add('variable');
          // }

          line.appendChild(word);
        });
      line.classList.add('line');
      codeDisplayer.appendChild(line);
    });
  }

  /**
   *
   */
  async function updateCodeDisplayer(code) {
    await clearVisualization();

    if (code.valid && code.value) {
      code = setBubbles(code);
      drawBubbles(code);
    }
  }

  /**
   *
   */
  function setBubbles({ scopes, codeLines, codeTokens, ...rest }) {
    var codeLineElements = [...codeDisplayer.getElementsByClassName('line')];
    var codeTokenElements = [];
    [...codeLineElements].forEach((codeLineElement) => {
      codeTokenElements.push(...codeLineElement.querySelectorAll('span'));
    });
    codeTokenElements = codeTokenElements.filter(
      function filterEmptyTokenElements(tokenElement) {
        return tokenElement.textContent.trim();
      },
    );

    console.log(codeLines);
    console.log(codeTokens);
    console.log(codeLineElements);
    console.log(codeTokenElements);

    console.log(scopes);

    var bubbles = [];
    var preparedOuterScopeVariables = [];
    for (let [
      index,
      {
        block: {
          range: [scopeRangeStart, scopeRangeEnd],
        },
        through: outerScopeVariables,
      },
    ] of scopes.scopes.entries()) {
      let scopeColor = scopes.scopesColors[index];

      // Identify outer scope variables.
      for (let reference of outerScopeVariables) {
        let { identifier } = reference;
        let {
          identifier: { name, range: [startChar, endChar] = [0, 0] },
        } = reference;
        preparedOuterScopeVariables.push({
          name,
          startChar,
          endChar,
          color: undefined,
          identifier,
        });
      }

      let scopeBubbleLines = [];
      let hasFinished = false;
      let removeFirstLine = false;
      let removeLastLine = false;
      for (let i = 0; i < codeLines.length && !hasFinished; i++) {
        if (
          codeLines[i].startChar >= scopeRangeStart &&
          codeLines[i].endChar <= scopeRangeEnd
        ) {
          scopeBubbleLines.push(codeLineElements[i]);

          if (codeLines[i].startChar == scopeRangeStart) {
            removeFirstLine = true;
          }

          if (codeLines[i].endChar == scopeRangeEnd) {
            removeLastLine = true;
          }

          if (codeLines[i].endChar >= scopeRangeEnd) {
            hasFinished = true;
          }
        }
      }

      scopeBubbleLines =
        scopeBubbleLines.slice(
          removeFirstLine ? 1 : 0,
          removeLastLine ? -1 : undefined,
        ) || [];

      bubbles.push({
        lines: scopeBubbleLines,
        color: scopeColor,
      });
    }

    var scopeBubbleVariables = [];
    for (let j = 0; j < codeTokens.length; j++) {
      if (
        jsKeywords.find(function findKeyword(keyword) {
          return keyword == codeTokens[j].token;
        }) ||
        !codeTokens[j].token.match(/([a-zA-Z0-9]+)/g)
      ) {
        continue;
      }

      let foundOuterScopeVariable = preparedOuterScopeVariables.find(
        (preparedOuterScopeVariable) => {
          return (
            preparedOuterScopeVariable.startChar == codeTokens[j].startChar &&
            preparedOuterScopeVariable.endChar == codeTokens[j].endChar
          );
        },
      );

      if (!foundOuterScopeVariable) {
        continue;
      }

      scopeBubbleVariables.push({
        ...foundOuterScopeVariable,
        tokenElement: codeTokenElements[j],
      });
    }

    for (let [index, scope] of scopes.scopes.entries()) {
      for (let {
        identifiers: [identifier],
      } of scope.variables) {
        if (!identifier) {
          continue;
        }

        let scopeBubbleVariable = scopeBubbleVariables.find(
          function matchReference(scopeBubbleVariable) {
            return scopeBubbleVariable.identifier == identifier;
          },
        );

        if (!scopeBubbleVariable) {
          continue;
        }

        scopeBubbleVariable.color = scopes.scopesColors[index];
      }

      // for (let {
      //   identifiers: [identifier],
      // } of scope.variables) {
      //   if (!identifier) {
      //     continue;
      //   }

      //   let scopeBubbleVariable = scopeBubbleVariables.find(
      //     function matchReference(scopeBubbleVariable) {
      //       return scopeBubbleVariable.identifier == identifier;
      //     },
      //   );

      //   if (!scopeBubbleVariable) {
      //     continue;
      //   }

      //   scopeBubbleVariable.color = scopes.scopesColors[index];
      // }
    }

    return {
      scopes,
      codeLines,
      codeTokens,
      ...rest,
      bubbles: { scopeBubbles: [...bubbles], scopeBubbleVariables },
    };
  }

  /**
   *
   */
  function drawBubbles({
    bubbles: {
      scopeBubbles: [{ lines, color }, ...bubbles],
      scopeBubbleVariables,
    },
  }) {
    var {
      x: minX,
      y: minVisibleY,
      height: minVisibleHeight,
    } = codeDisplayer.getBoundingClientRect();

    // GLOBAL BUBBLE.
    var { x, y, width, height } = lines[0].getBoundingClientRect();
    drawBubble({ x, y, width, height: height }, color, true);

    // SCOPE BUBBLES.
    for (let { lines, color } of bubbles) {
      let {
        y: lineY,
        width: lineWidth,
        height: lineHeight,
      } = lines[0].getBoundingClientRect();

      if (
        lineY < minVisibleY ||
        lineY + lineHeight > minVisibleY + minVisibleHeight
      ) {
        continue;
      }

      var visibleLines = [...lines];

      while (
        lineY + lineHeight * (visibleLines.length + 1) >
        minVisibleY + minVisibleHeight
      ) {
        visibleLines.pop();
      }

      let tabsWidth = 0;
      let { x: lineX } = [...lines[0].querySelectorAll('span')]
        .filter(function filterEmptyTokens(token) {
          return token.textContent;
        })[0]
        .getBoundingClientRect();

      for (let token of [...lines[0].querySelectorAll('span.tab')]) {
        console.log(token);

        let { width: tabWidth } = token.getBoundingClientRect();

        tabsWidth += tabWidth;
      }

      let bubbleX = Math.max(lineX, minX);

      drawBubble(
        {
          x: bubbleX,
          y: lineY,
          width: bubbleX == lineX ? lineWidth - tabsWidth - 6 : width,
          height: lineHeight * visibleLines.length,
        },
        color,
        false,
      );
    }

    // VARIABLE BUBBLES.

    for (let { tokenElement, color } of scopeBubbleVariables) {
      let {
        x: tokenX,
        y: tokenY,
        width: tokenWidth,
        height: tokenHeight,
      } = tokenElement.getBoundingClientRect();

      if (
        tokenY < minVisibleY ||
        tokenY + tokenHeight > minVisibleY + minVisibleHeight
      ) {
        continue;
      }

      drawBubble(
        {
          x: Math.max(tokenX, minX),
          y: tokenY,
          width: tokenWidth,
          height: tokenHeight,
        },
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
    color = code.scopes.scopesColors[0],
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
                    top: ${bubbleY}px;
                    left: ${bubbleX}px;
                    `;
    scopeBubbles.appendChild(bubble);
  }

  /**
   *
   */
  function clearVisualization() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        scopeBubbles.innerHTML = '';
        resolve();
      });
    });
  }
})();

app.bootstrap();
