// AuxoKit — component inventory for ONE Figma page.
// Run through the Figma MCP `use_figma` tool. Set PAGE_ID; run one call per page, in parallel
// (one message with several use_figma calls). Page ids: the unique `page` values in
// auxokit-design-system/references/components.json, plus any new component pages in the file.
// Save every returned JSON string as one line in a .jsonl file for diff-components.mjs.

const PAGE_ID = '2542:21012';

const page = await figma.getNodeByIdAsync(PAGE_ID);
if (!page) throw new Error('Page not found: ' + PAGE_ID);
await figma.setCurrentPageAsync(page);

const sets = page.findAllWithCriteria({ types: ['COMPONENT_SET'] });
const loose = page.findAllWithCriteria({ types: ['COMPONENT'] }).filter((c) => !c.parent || c.parent.type !== 'COMPONENT_SET');

const out = {
  page: PAGE_ID,
  pageName: page.name,
  sets: sets.map((s) => {
    const variants = {};
    const props = {};
    let defs = {};
    try { defs = s.componentPropertyDefinitions; } catch (e) { /* broken set */ }
    for (const [k, d] of Object.entries(defs)) {
      const name = k.split('#')[0];
      if (d.type === 'VARIANT') variants[name] = d.variantOptions;
      else props[name] = d.type;
    }
    return { node: s.id, name: s.name, count: s.children.length, description: (s.description || '').slice(0, 300), variants, props };
  }),
  loose: loose.slice(0, 50).map((c) => ({ node: c.id, name: c.name })),
};
const str = JSON.stringify(out);
if (str.length > 45000) throw new Error('Output too large for one call; filter sets by name');
return str;
