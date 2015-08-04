import jspm from 'jspm';
import Promise from 'bluebird';
import whacko from 'whacko';

export function unbundle(opts) {

  var packagePath = opts.packagePath || '.';
  jspm.setPackagePath(opts.packagePath);

  var tasks = [jspm.unbundle(), unbundleTemplate(opts)];

  return Promise.all(tasks)
    .then(() => {
      console.log('Unbundle completed!');
    });
}

function removeTemplateInjection(opts) {
  var file =  // get normalized path of the index.html relative to baseURL;
  return Promise
    .promisify(fs.readFile)(file, {
      encoding: utf8
    })
    .then((content) => {
      return Promise.resolve(whacko.load(content));
    })
    .then(removeInvalidLinks($))
    .then(removeLinkInjections($))
}

function removeInvalidLinks($) {
  // search all the links with `aurelia-view-bundle` in `index.html`
  // complare with aureliafile's bundle config.
  // find the invalid links from the comparisn
  // remove them from the DOM
  // return promise with clean DOM.
}

function removeLinkInjection() {

}
