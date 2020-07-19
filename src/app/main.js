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
  var snackBar;

  return { bootstrap };

  /**
   * Initialize the app.
   */
  function bootstrap() {
    code = { ...defaultCode };
    codeEditor = setupCodeEditor(document.getElementById('code-editor'));
    codeDisplayer = document.getElementById('code-displayer');
    scopeBubbles = document.getElementById('scopes');
    snackBar = document.getElementById('snackbar');

    setEventListeners();

    /**
     *
     */
    function setEventListeners() {
      var handleInputDebounced = debounce(handleInput, 500, false);
      codeEditor.on('change', handleInputDebounced);
      codeDisplayer.addEventListener('scroll', reDraw, { passive: true });
      window.addEventListener('resize', reDraw, { passive: true });

      /**
       *
       */
      async function handleInput(event) {
        try {
          code = processCode(code, event.getValue());

          if (!code.valid) {
            await clearBubbles();
            return;
          }
        } catch (e) {
          code.valid = false;
          await clearCode();
          await clearBubbles();
          displaySnackBar(e);
          return;
        }

        hideSnackBar();

        await writeCode(code.value);

        code = setBubbles(code);
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
       * @param {*} func
       * @param {*} wait
       * @param {*} immediate
       */
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
      lineWrapping: false,
      fixedGutter: false,
      coverGutterNextToScrollbar: true,
      matchBrackets: true,
      autofocus: true,
      readOnly: false,
      tabSize: 2,
      tabindex: 0,
    });

    codeMirror.setOption('theme', 'ayu-mirage');

    return codeMirror;
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
      processedCode.valid = true;
    } catch (e) {
      displaySnackBar(Object.assign({}, e));
      processedCode.value = e.toString();
      processedCode.valid = false;
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
    var ratios = [1.2, 1.35, 1.5, 1.75, 2, 2.3, 2.8, 3.2, 4.2, 5.2];

    var colorScales = [
      '#FF3333',
      '#FFA759',
      '#F0DB4F',
      '#BAE67E',
      '#5CCFE6',
      '#AE81FF',
    ].map(function processColor(color, index) {
      return {
        name: `${index}`,
        colorKeys: [color],
        colorspace: 'CAM02',
        ratios,
      };
    });

    var theme = leonardo.generateAdaptiveTheme({
      colorScales,
      baseScale: '1',
      brightness: 100,
    });

    var scopesColors = [];
    for (let { values } of theme) {
      if (!values) {
        continue;
      }

      for (let { value } of values) {
        scopesColors.push(value);
      }
    }

    // scopesColors[0] = '#0D1019';

    return {
      ...code,
      scopes: {
        ...scopes,
        scopesNumber: scopes.scopes.length,
        scopesColors,
      },
    };
  }

  /**
   *
   */
  function writeCode(code) {
    return new Promise((resolve) => {
      requestAnimationFrame(async () => {
        await write(code);
        resolve();
      });
    });
  }

  /**
   *
   */
  async function write(code) {
    await clearCode();

    var codeLines = code.split('\n');
    codeLines.forEach(function customLineWriting(codeLine, index) {
      var line = document.createElement('div');

      let lineCount = document.createElement('div');
      lineCount.classList.add('line-count');
      lineCount.textContent = index + 1;
      line.appendChild(lineCount);

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
    await clearBubbles();

    if (code.valid && code.value) {
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

    var bubbles = [];
    var preparedOuterScopeVariables = [];
    var parameters = [];
    for (let [index, scope] of scopes.scopes.entries()) {
      let {
        block: {
          range: [scopeRangeStart, scopeRangeEnd],
        },
        through: outerScopeVariables,
        variables: potentialParameters,
      } = scope;

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
          scope,
        });
      }

      // Identify function arguments.
      let functionParameters = potentialParameters.filter(
        function matchParameters(parameter) {
          if (!parameter.defs.length > 0) {
            return false;
          }

          return parameter.defs[0].type == 'Parameter';
        },
      );

      for (let {
        identifiers: [identifier],
      } of functionParameters) {
        if (!identifier) {
          continue;
        }

        let { name, range: [startChar, endChar] = [0, 0] } = identifier;
        parameters.push({
          name,
          startChar,
          endChar,
          color: undefined,
          identifier,
          scope,
        });
      }

      // Set scope bubbles.
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

      let foundFunctionParameter = parameters.find((parameter) => {
        return (
          parameter.startChar == codeTokens[j].startChar &&
          parameter.endChar == codeTokens[j].endChar
        );
      });

      if (!foundOuterScopeVariable && !foundFunctionParameter) {
        continue;
      }

      if (foundOuterScopeVariable) {
        scopeBubbleVariables.push({
          ...foundOuterScopeVariable,
          tokenElement: codeTokenElements[j],
        });
      }

      if (foundFunctionParameter) {
        scopeBubbleVariables.push({
          ...foundFunctionParameter,
          tokenElement: codeTokenElements[j],
        });
      }
    }

    for (let [index, scope] of scopes.scopes.entries()) {
      for (let {
        identifiers: [identifier],
      } of scope.variables) {
        if (index == 0 || !identifier) {
          continue;
        }

        let identifiedVariables = scopeBubbleVariables.filter(
          function matchIdentifier(scopeBubbleVariable) {
            return scopeBubbleVariable.identifier.name == identifier.name;
          },
        );

        if (!scopeBubbleVariables.length > 0) {
          continue;
        }

        for (let scopeBubbleVariable of identifiedVariables) {
          if (isAncestorScope(scope, scopeBubbleVariable.scope)) {
            scopeBubbleVariable.color =
              scope.type != 'for' && scope.type != 'with'
                ? scopes.scopesColors[index]
                : scopes.scopesColors[index + 1];
          }
        }
      }
    }

    return {
      scopes,
      codeLines,
      codeTokens,
      ...rest,
      bubbles: { scopeBubbles: [...bubbles], scopeBubbleVariables },
    };

    function isAncestorScope(ancestorScope, scope) {
      if (scope == null) {
        return false;
      }

      if (scope == ancestorScope) {
        return true;
      }

      return isAncestorScope(ancestorScope, scope.upper);
    }
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
    if (!lines[0]) {
      return;
    }

    var xOffset = document.documentElement.scrollLeft;
    var yOffset = document.documentElement.scrollTop;

    var {
      x: minVisibleX,
      y: minVisibleY,
      height: minVisibleHeight,
      width: minVisibleWidth,
    } = scopeBubbles.getBoundingClientRect();
    var maxVisibleY = minVisibleY + minVisibleHeight;
    var maxVisibleX = minVisibleX + minVisibleWidth;

    // GLOBAL BUBBLE.
    drawBubble(
      {
        x: minVisibleX,
        y: minVisibleY,
        width: minVisibleWidth,
        height: minVisibleHeight,
      },
      color,
      xOffset,
      yOffset,
    );

    // SCOPE BUBBLES.
    for (let { lines: bubbleLines, color } of bubbles) {
      if (!bubbleLines[0]) {
        continue;
      }

      let {
        y: lineY,
        height: lineHeight,
      } = bubbleLines[0].getBoundingClientRect();

      let lastTokens = [];
      for (let bubbleLine of bubbleLines) {
        if (!(bubbleLine.children.length > 0)) {
          continue;
        }

        lastTokens.push(bubbleLine.children[bubbleLine.children.length - 1]);
      }

      let bubbleEnd =
        lastTokens.reduce(function maxLineWidth(maxWidth, token) {
          let { x: tokenX, width: tokenWidth } = token.getBoundingClientRect();
          return Math.max(maxWidth, tokenX + tokenWidth);
        }, 0) || maxVisibleX;

      let { x: lineX } = [...bubbleLines[0].querySelectorAll('span')]
        .filter(function filterEmptyTokens(token) {
          return token.textContent;
        })[0]
        .getBoundingClientRect();

      let bubbleX = Math.max(lineX, minVisibleX);
      let bubbleY = Math.max(lineY, minVisibleY);

      drawBubble(
        {
          x: bubbleX,
          y: bubbleY,
          width: Math.min(bubbleEnd - bubbleX + 8.8, maxVisibleX - bubbleX - 6), // maxVisibleX - bubbleX - 6)
          height: Math.min(lineHeight * bubbleLines.length, maxVisibleY),
        },
        color,
        xOffset,
        yOffset,
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

      if (tokenY < minVisibleY || tokenY + tokenHeight > maxVisibleY) {
        continue;
      }

      let variableX = Math.max(tokenX, minVisibleX);
      let variableY = Math.max(tokenY, minVisibleY);
      let variableWidth = 0;

      if (variableX + tokenWidth > maxVisibleX) {
        if (variableX == minVisibleX) {
          // The bubble overlaps both sides.
          variableWidth = minVisibleWidth - 6;
        } else {
          // The bubble overlaps the right.
          variableWidth = tokenWidth - (tokenX + tokenWidth - maxVisibleX) - 6;
          variableWidth = maxVisibleX - variableX - 12;
        }
      } else {
        if (variableX == minVisibleX) {
          // The bubble overlaps the left.
          variableWidth = tokenWidth - (minVisibleX - tokenX);
        } else {
          // It doesn't overlap.
          variableWidth = tokenWidth;
        }
      }

      drawBubble(
        {
          x: variableX,
          y: variableY,
          width: variableWidth,
          height: tokenHeight,
        },
        color,
        xOffset,
        yOffset,
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
    xOffset = 0,
    yOffset = 0,
  ) {
    var bubble = document.createElement('div');
    bubble.classList.add('scopes__bubble');
    bubble.style = `
                    background-color: ${color};
                    width: ${bubbleWidth}px;
                    height: ${bubbleHeight}px;
                    top: ${bubbleY + yOffset}px;
                    left: ${bubbleX + xOffset}px;
                    `;

    scopeBubbles.appendChild(bubble);
  }

  /**
   *
   */
  function clearBubbles() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        while (scopeBubbles.firstChild) {
          scopeBubbles.removeChild(scopeBubbles.lastChild);
        }
        resolve();
      });
    });
  }

  /**
   *
   */
  function clearCode() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        while (codeDisplayer.firstChild) {
          codeDisplayer.removeChild(codeDisplayer.lastChild);
        }
        resolve();
      });
    });
  }

  /**
   *
   */
  function clearErrorElements() {
    return new Promise((resolve) => {
      while (snackBar.firstChild) {
        snackBar.removeChild(snackBar.lastChild);
      }
      resolve();
    });
  }

  /**
   *
   */
  function displaySnackBar(e) {
    requestAnimationFrame(function displayErrors() {
      if (snackBar.classList.contains('show')) {
        appendErrors();
      } else {
        showSnackBar();
      }
    });

    function showSnackBar() {
      snackBar.classList.add('show');
      var fadeIn = snackBar.animate(
        [
          {
            opacity: '0',
          },
          {
            opacity: '1',
          },
        ],
        { duration: 400 },
      );

      fadeIn.onfinish = appendErrors;
    }

    async function appendErrors() {
      await clearErrorElements();
      animateError();

      function animateError() {
        var errorElement = genereteErrorElement(e);
        snackBar.appendChild(errorElement);
        errorElement.animate([{ opacity: '0' }, { opacity: '1' }], {
          duration: 1000,
        });
      }
    }

    function genereteErrorElement(error) {
      if (error.codeFrame) {
        return generateSyntaxError(error);
      }

      return generateUnexpectedError(error);

      function generateSyntaxError(error) {
        var syntaxError = document.createElement('p');
        syntaxError.classList.add('syntax-message');
        syntaxError.textContent = `Syntax error at line ${error.loc.start.line}`;

        var errorLines = error.codeFrame.split(/(\n)/);

        for (let errorLine of errorLines) {
          let errorLineElement = document.createElement('span');
          errorLineElement.textContent = errorLine;
          syntaxError.appendChild(errorLineElement);
        }

        return syntaxError;
      }

      function generateUnexpectedError(error) {
        var unexpectedError = document.createElement('p');
        unexpectedError.classList.add('unexpected-message');
        unexpectedError.textContent = `Line: ${error.lineNumber} - ${error.description}`;
        return unexpectedError;
      }
    }
  }

  function hideSnackBar() {
    if (!snackBar.classList.contains('show')) {
      return;
    }

    var fadeOut = snackBar.animate(
      [
        {
          opacity: '1',
        },
        {
          opacity: '0',
        },
      ],
      { duration: 400 },
    );

    fadeOut.onfinish = removeShowClass;

    async function removeShowClass() {
      snackBar.classList.remove('show');
      await clearErrorElements();
    }
  }
})();

app.bootstrap();
