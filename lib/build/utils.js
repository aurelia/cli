const path = require('path');
const crypto = require('crypto');

exports.generateBundleName = function(contents, fileName, rev) {
    var hash;
    if (rev === true){
        hash = exports.generateHash(new Buffer(contents, 'utf-8'))
    } else {
        hash = rev;
    }
    return rev ? exports.generateHashedPath(fileName, hash) : fileName;
}
exports.generateHashedPath = function(pth, hash){
    if (arguments.length !== 2) {
		throw new Error('`path` and `hash` required');
	}

	return modifyFilename(pth, function (filename, ext) {
		return filename + '-' + hash + ext;
	});
}
exports.revertHashedPath = function(pth, hash){
    if (arguments.length !== 2) {
		throw new Error('`path` and `hash` required');
	}

	return modifyFilename(pth, function (filename, ext) {
		return filename.replace(new RegExp('-' + hash + '$'), '') + ext;
	});
}
exports.generateHash = function(buf){
    if (!Buffer.isBuffer(buf)) {
		throw new TypeError('Expected a buffer');
	}
	return crypto.createHash('md5').update(buf).digest('hex').slice(0, 10);
}
exports.escapeForRegex = function(str){
	var matchers = /[|\\{}()[\]^$+*?.]/g;
	return str.replace(matchers, '\\$&');
}
exports.createSrcFileRegex = function(){
	var parts = Array.prototype.slice.call(arguments);
	var regexString = "\\b(?:src=(\"|')(.*))(";
	for (var i = 0; i < parts.length; i ++) {
		regexString = regexString + exports.escapeForRegex(parts[i]) + (i < (parts.length - 1) ? "(\/|\\\\)" : "");
	}
	regexString = regexString + "(.*?).js)(?:(\"|'))";
	return new RegExp(regexString);
}

function modifyFilename(pth, modifier){
    if (arguments.length !== 2) {
		throw new Error('`path` and `modifier` required');
	}

	if (Array.isArray(pth)) {
		return pth.map(function (el) {
			return modifyFilename(el, modifier);
		});
	}

	var ext = path.extname(pth);
	return path.join(path.dirname(pth), modifier(path.basename(pth, ext), ext));
}