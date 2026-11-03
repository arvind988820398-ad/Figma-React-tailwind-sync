// Appended to the generated entry: exposes window.__NS__ = { ...components, Icons, stories, renderStories }.
const ns = {};
for (const m of Object.values(mods)) for (const [k, v] of Object.entries(m)) if (/^[A-Z]/.test(k) && (typeof v === 'function' || (v && typeof v === 'object' && v.$$typeof))) ns[k] = v;
for (const m of Object.values(mods)) for (const [k, v] of Object.entries(m)) if (typeof v === 'function' && !(k in ns)) ns[k] = v; // helpers such as buttonVariants
ns.Icons = Icons;
const stories = {};
for (const [comp, m] of Object.entries(storyMods)) {
  const meta = m.default || {};
  const list = {};
  for (const k of (storyOrder[comp] || []).concat(Object.keys(m))) { const v = m[k]; if (k !== 'default' && v && typeof v === 'object' && !(k in list)) list[k] = v; }
  stories[comp] = { meta, stories: list };
}
ns.stories = stories;

function storyElement(comp, name) {
  const entry = stories[comp];
  if (!entry) throw new Error('no stories for ' + comp);
  const meta = entry.meta;
  const story = entry.stories[name];
  if (!story) throw new Error('no story ' + name + ' in ' + comp);
  const args = Object.assign({}, meta.args, story.args);
  const Comp = story.component || meta.component;
  const render = story.render || meta.render || ((a) => React.createElement(Comp, a));
  const ctx = { args, name, title: meta.title, parameters: Object.assign({}, meta.parameters, story.parameters), globals: {} };
  let el = () => render(args, ctx);
  const decorators = [].concat(story.decorators || [], meta.decorators || []);
  for (const dec of decorators) {
    const inner = el;
    el = () => dec(inner, ctx);
  }
  return React.createElement(el); // as a component, so a render() that uses hooks works
}

// Renders the named stories of a component into `root`, each with a small caption.
ns.renderStories = function (comp, root, names, opts = {}) {
  const entry = stories[comp];
  const chosen = names && names.length ? names : Object.keys(entry.stories).slice(0, 3);
  const children = chosen.map((n) =>
    React.createElement(
      'section',
      { key: n, className: 'ds-story', 'data-story': n },
      opts.captions === false ? null : React.createElement('p', { className: 'ds-story-caption' }, n.replace(/([a-z])([A-Z])/g, '$1 $2')),
      React.createElement('div', { className: 'ds-story-body' }, storyElement(comp, n)),
    ),
  );
  const rootEl = ReactDOM.createRoot(root);
  rootEl.render(React.createElement(React.StrictMode, null, React.createElement('div', { className: 'ds-stories' }, children)));
  return rootEl;
};
window.__NS__ = ns;
