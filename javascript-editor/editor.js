/**
 * Functions in this module simulate what an editor plugin might do. For real-world examples,
 * see https://github.com/serenadeai/code and https://github.com/serenadeai/atom.
 */

exports.getEditorState = (limited) => {
  const filename = "file.js";
  if (limited) {
    return {
      filename,
    };
  }

  return {
    source: "console.log('hello world!');\n",
    cursor: 3,
    filename,
  };
};

exports.nextTab = () => {
  console.log("Switching to the next tab!");
};

exports.previousTab = () => {
  console.log("Switching to the previous tab!");
};

exports.setCursor = (cursor) => {
  console.log(`Setting editor cursor position to: ${cursor}`);
};

exports.setSource = (source) => {
  console.log(`Setting editor source to:\n${source}`);
};
