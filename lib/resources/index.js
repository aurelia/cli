exports.locateResource = function(path) {
  try {
    return require.resolve('./' + path);
  } catch (e) {
    console.log(`Error locating resource: ${path}`);
    console.error(e);
    throw e;
  }
};
