var Lang = { TypeScript: "TypeScript", JavaScript: "JavaScript", HTML: "HTML", CSS: "CSS", Tsx: "Tsx" };
function parse() {
  return {
    root: function() {
      return {
        find: function() { return null; },
        findAll: function() { return []; },
        commitEdits: function(edits) { return edits.join('\n'); },
      };
    },
  };
}
function parseFile() { return parse().root(); }
function parseCode() { return parse().root(); }
function patchCode(code) { return code; }
function applyRule() { return { edits: [], matches: [] }; }
function createPatchCode() { return async function(_a) { return _a.code; }; }
module.exports = { Lang: Lang, parse: parse, parseFile: parseFile, parseCode: parseCode, patchCode: patchCode, applyRule: applyRule, createPatchCode: createPatchCode, parseAsync: async function() { return parse(); } };
