/* global document */
const cssUrlMatcher = /url\s*\(\s*(?!['"]data)([^) ]+)\s*\)/gi;

// copied from aurelia-templating-resources css-resource
// This behaves differently from webpack's style-loader.
// Here we change './hello.png' to 'foo/hello.png' if base address is 'foo/bar'.
// Note 'foo/hello.png' is technically a relative path in css,
// this is designed to work with aurelia-router setup.
// We inject css into a style tag on html head, it means the 'foo/hello.png'
// is related to current url (not css url on link tag), or <base> tag in html
// head (which is recommended setup of router if not using hash).
export function fixupCSSUrls(address: string, css: string) {
  if (typeof css !== 'string') {
    throw new Error(`Failed loading required CSS file: ${address}`);
  }
  return css.replace(cssUrlMatcher, (match, p1) => {
    const quote = p1.charAt(0);
    if (quote === '\'' || quote === '"') {
      p1 = p1.substr(1, p1.length - 2);
    }
    const absolutePath = absoluteModuleId(address, p1);
    if (absolutePath === p1) {
      return match;
    }
    return 'url(\'' + absolutePath + '\')';
  });
}

function absoluteModuleId(baseId: string, moduleId: string) {
  if (moduleId[0] !== '.') return moduleId;

  const parts = baseId.split('/');
  parts.pop();

  moduleId.split('/').forEach(p => {
    if (p === '.') return;
    if (p === '..') {
      parts.pop();
      return;
    }
    parts.push(p);
  });

  return parts.join('/');
}

// copied from aurelia-pal-browser DOM.injectStyles
export function injectCSS(css: string, id: string) {
  if (typeof document === 'undefined' || !css) return;
  css = fixupCSSUrls(id, css);

  if (id) {
    const oldStyle = document.getElementById(id);
    if (oldStyle) {
      const isStyleTag = oldStyle.tagName.toLowerCase() === 'style';

      if (isStyleTag) {
        oldStyle.innerHTML = css;
        return;
      }

      throw new Error('The provided id does not indicate a style tag.');
    }
  }

  const node = document.createElement('style');
  node.innerHTML = css;
  node.type = 'text/css';

  if (id) {
    node.id = id;
  }

  document.head.appendChild(node);
}
