/**
 * @license Copyright (c) 2010-2015, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */

/*jslint plusplus: true */
/*global define, java */

'use strict';

let isJavaObj: (obj: object) => boolean,
    hasOwn = Object.prototype.hasOwnProperty;

function hasProp(obj: object, prop: PropertyKey) {
    return hasOwn.call(obj, prop);
}

isJavaObj = function () {
    return false;
};

//Rhino, but not Nashorn (detected by importPackage not existing)
//Can have some strange foreign objects.
const java = global['java'];
if (typeof java !== 'undefined' && java.lang && java.lang.Object && typeof global['importPackage'] !== 'undefined') {
    isJavaObj = function (obj) {
        return obj instanceof java.lang.Object;
    };
}

export class lang {
    // makeJsArrayString added after porting to this project
    //Converts an JS array of strings to a string representation.
    //Not using JSON.stringify() for Rhino's sake.
    static makeJsArrayString(ary: string[]) {
        return '["' + ary.map(function (item) {
            //Escape any double quotes, backslashes
            return lang.jsEscape(item);
        }).join('","') + '"]';
    }

    static backSlashRegExp = /\\/g;
    static ostring = Object.prototype.toString;

    static isArray = Array.isArray || function (it) {
        return lang.ostring.call(it) === "[object Array]";
    }

    static isFunction(it) {
        return lang.ostring.call(it) === "[object Function]";
    }

    static isRegExp(it) {
        return it && it instanceof RegExp;
    }

    static hasProp = hasProp;

    //returns true if the object does not have an own property prop,
    //or if it does, it is a falsy value.
    static falseProp (obj: object, prop: string) {
        return !hasProp(obj, prop) || !obj[prop];
    }

    //gets own property value for given prop on object
    static getOwn(obj: object, prop: string) {
        return hasProp(obj, prop) && obj[prop];
    }

    private static _mixin(dest, source, override){
        var name;
        for (name in source) {
            if(source.hasOwnProperty(name) &&
                (override || !dest.hasOwnProperty(name))) {
                dest[name] = source[name];
            }
        }

        return dest; // Object
    }

    /**
     * mixin({}, obj1, obj2) is allowed. If the last argument is a boolean,
     * then the source objects properties are force copied over to dest.
     */
    static mixin(dest, ...objects){
        var parameters = Array.prototype.slice.call(arguments),
            override, i, l;

        if (!dest) { dest = {}; }

        if (parameters.length > 2 && typeof arguments[parameters.length-1] === 'boolean') {
            override = parameters.pop();
        }

        for (i = 1, l = parameters.length; i < l; i++) {
            lang._mixin(dest, parameters[i], override);
        }
        return dest; // Object
    }

    /**
     * Does a deep mix of source into dest, where source values override
     * dest values if a winner is needed.
     * @param  {Object} dest destination object that receives the mixed
     * values.
     * @param  {Object} source source object contributing properties to mix
     * in.
     * @return {[Object]} returns dest object with the modification.
     */
    static deepMix(dest, source) {
        lang.eachProp(source, function (value, prop) {
            if (typeof value === 'object' && value &&
                !lang.isArray(value) && !lang.isFunction(value) &&
                !(value instanceof RegExp)) {

                if (!dest[prop]) {
                    dest[prop] = {};
                }
                lang.deepMix(dest[prop], value);
            } else {
                dest[prop] = value;
            }
        });
        return dest;
    }

    /**
     * Does a type of deep copy. Do not give it anything fancy, best
     * for basic object copies of objects that also work well as
     * JSON-serialized things, or has properties pointing to functions.
     * For non-array/object values, just returns the same object.
     * @param  {Object} obj      copy properties from this object
     * @param  {Object} [result] optional result object to use
     * @return {Object}
     */
    static deeplikeCopy (obj) {
        var type, result;

        if (lang.isArray(obj)) {
            result = [];
            obj.forEach(function(value) {
                result.push(lang.deeplikeCopy(value));
            });
            return result;
        }

        type = typeof obj;
        if (obj === null || obj === undefined || type === 'boolean' ||
            type === 'string' || type === 'number' || lang.isFunction(obj) ||
            lang.isRegExp(obj)|| isJavaObj(obj)) {
            return obj;
        }

        //Anything else is an object, hopefully.
        result = {};
        lang.eachProp(obj, function(value, key) {
            result[key] = lang.deeplikeCopy(value);
        });
        return result;
    }

    static delegate = (function () {
        // boodman/crockford delegation w/ cornford optimization
        function TMP() {}
        return function (obj: object, props: string[]) {
            TMP.prototype = obj;
            var tmp = new TMP();
            TMP.prototype = null;
            if (props) {
                lang.mixin(tmp, props);
            }
            return tmp; // Object
        };
    }());

    /**
     * Helper function for iterating over an array. If the func returns
     * a true value, it will break out of the loop.
     */
    static each(ary, func) {
        if (ary) {
            var i;
            for (i = 0; i < ary.length; i += 1) {
                if (func(ary[i], i, ary)) {
                    break;
                }
            }
        }
    }

    /**
     * Cycles over properties in an object and calls a function for each
     * property value. If the function returns a truthy value, then the
     * iteration is stopped.
     */
    static eachProp(obj, func) {
        var prop;
        for (prop in obj) {
            if (hasProp(obj, prop)) {
                if (func(obj[prop], prop)) {
                    break;
                }
            }
        }
    }

    //Similar to Function.prototype.bind, but the "this" object is specified
    //first, since it is easier to read/figure out what "this" will be.
    static bind(obj, fn) {
        return function () {
            return fn.apply(obj, arguments);
        };
    }

    //Escapes a content string to be be a string that has characters escaped
    //for inclusion as part of a JS string.
    static jsEscape(content: string) {
        return content.replace(/(["'\\])/g, '\\$1')
            .replace(/[\f]/g, "\\f")
            .replace(/[\b]/g, "\\b")
            .replace(/[\n]/g, "\\n")
            .replace(/[\t]/g, "\\t")
            .replace(/[\r]/g, "\\r");
    }
};
