// Run through the Figma MCP `use_figma` tool (file TKsoawKvPxaNCff4q43Mli).
// Writes the generated description and documentation link onto each component set.
// ITEMS = a slice of generated/figma-descriptions.json → sets, as [{ node, description, docUrl }].
// Keep each call under the 50 KB code limit (about 40 sets per call); calls can run in parallel.
// Write plain text. The plugin API reads descriptions back HTML-escaped ("Don&#39;t", "&lt;Button&gt;") even though
// Figma and the published library show normal characters, so compare after decoding.
const ITEMS = [/* paste here */];

const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const changed = [];
const unchanged = [];
const missing = [];
for (const item of ITEMS) {
  const node = await figma.getNodeByIdAsync(item.node);
  if (!node || (node.type !== 'COMPONENT_SET' && node.type !== 'COMPONENT')) {
    missing.push(item.node);
    continue;
  }
  const links = item.docUrl ? [{ uri: item.docUrl }] : [];
  const sameLinks = JSON.stringify(node.documentationLinks || []) === JSON.stringify(links);
  if (decode(node.description) === item.description && sameLinks) {
    unchanged.push(item.node);
    continue;
  }
  node.description = item.description;
  node.documentationLinks = links;
  changed.push(item.node);
}
return { changed: changed.length, unchanged: unchanged.length, missing, changedIds: changed };
