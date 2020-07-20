import j from 'jquery';

function isNumber(obj) {
  return typeof obj === 'number';
}

function isFunction(obj) {
  return typeof obj === 'function';
}

function isArray(obj) {
  return Array.isArray(obj);
}

function isArrayLike(obj) {
  const length = !!obj && obj.length;
  return isArray(obj) || !isFunction(obj) && isNumber(length) && length > -1 && length % 1 == 0;
}

function each(source, callback) {
  let i = 0;

  if (isArrayLike(source)) {
    for (; i < source.length; i++) {
      if (callback(source[i], i, source) === false) break;
    }
  } else if (source) {
    for (i in source) {
      if (callback(source[i], i, source) === false) break;
    }
  }

  return source;
}

const contents = elm => {
  return elm ? Array.from(elm.childNodes) : [];
};

const removeElements = nodes => {
  if (isArrayLike(nodes)) {
    each(Array.from(nodes), e => removeElements(e));
  } else if (nodes) {
    const parentNode = nodes.parentNode;
    if (parentNode) parentNode.removeChild(nodes);
  }
};

const createDiv = () => {
  return document.createElement('div');
};

const createDOM = html => {
  const elm = createDiv();
  elm.innerHTML = html.trim();
  return each(contents(elm), elm => removeElements(elm));
};

const abc = {
  a: 1,
  b: 1,
  c: 1
};

var index = () => {
  const {
    a,
    b,
    c
  } = abc;
  return [createDOM("    <div class=\"os-host\">        <div class=\"os-resize-observer-host\"></div>        <div class=\"os-padding\">            <div class=\"os-viewport\">                <div class=\"os-content\">                    fdfhdfgh                </div>            </div>        </div>        <div class=\"os-scrollbar os-scrollbar-horizontal\">            <div class=\"os-scrollbar-track\">                <div class=\"os-scrollbar-handle\"></div>            </div>        </div>        <div class=\"os-scrollbar os-scrollbar-vertical\">            <div class=\"os-scrollbar-track\">                <div class=\"os-scrollbar-handle\"></div>            </div>        </div>        <div class=\"os-scrollbar-corner\"></div>    </div>"), j('div'), a, b, c];
};

export default index;
//# sourceMappingURL=overlayscrollbars.esm.js.map