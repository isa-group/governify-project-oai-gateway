/*!
governify-gateway 1.0.0, built on: 2018-03-27
Copyright (C) 2018 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-gateway

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/

/**
 * State-based routing for AngularJS 1.x
 * @version v1.0.9
 * @link https://ui-router.github.io
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@uirouter/core'), require('angular')) :
	typeof define === 'function' && define.amd ? define(['exports', '@uirouter/core', 'angular'], factory) :
	(factory((global['@uirouter/angularjs-resolve-service'] = {}),global['@uirouter/core'],global.angular));
}(this, (function (exports,core,angular) { 'use strict';

/** @module ng1 */ /** */
/**
 * Implementation of the legacy `$resolve` service for angular 1.
 */
var $resolve = {
    /**
     * Asynchronously injects a resolve block.
     *
     * This emulates most of the behavior of the ui-router 0.2.x $resolve.resolve() service API.
     *
    * ### Not bundled by default
     *
     * This API is no longer not part of the standard `@uirouter/angularjs` bundle.
     * For users of the prebuilt bundles, add the `release/resolveService.min.js` UMD bundle.
     * For bundlers (webpack, browserify, etc), add `@uirouter/angularjs/lib/legacy/resolveService`.
     *
     * ---
     *
     * Given an object `invocables`, where keys are strings and values are injectable functions,
     * injects each function, and waits for the resulting promise to resolve.
     * When all resulting promises are resolved, returns the results as an object.
     *
     * #### Example:
     * ```js
     * let invocables = {
     *   foo: [ '$http', ($http) =>
     *            $http.get('/api/foo').then(resp => resp.data) ],
     *   bar: [ 'foo', '$http', (foo, $http) =>
     *            $http.get('/api/bar/' + foo.barId).then(resp => resp.data) ]
     * }
     * $resolve.resolve(invocables)
     *     .then(results => console.log(results.foo, results.bar))
     * // Logs foo and bar:
     * // { id: 123, barId: 456, fooData: 'foo data' }
     * // { id: 456, barData: 'bar data' }
     * ```
     *
     * @param invocables an object which looks like an [[StateDeclaration.resolve]] object; keys are resolve names and values are injectable functions
     * @param locals key/value pre-resolved data (locals)
     * @param parent a promise for a "parent resolve"
     */
    resolve: function (invocables, locals, parent) {
        if (locals === void 0) { locals = {}; }
        var parentNode = new core.PathNode(new core.StateObject({ params: {}, resolvables: [] }));
        var node = new core.PathNode(new core.StateObject({ params: {}, resolvables: [] }));
        var context = new core.ResolveContext([parentNode, node]);
        context.addResolvables(core.resolvablesBuilder({ resolve: invocables }), node.state);
        var resolveData = function (parentLocals) {
            var rewrap = function (_locals) { return core.resolvablesBuilder({ resolve: core.mapObj(_locals, function (local) { return function () { return local; }; }) }); };
            context.addResolvables(rewrap(parentLocals), parentNode.state);
            context.addResolvables(rewrap(locals), node.state);
            var tuples2ObjR = function (acc, tuple) {
                acc[tuple.token] = tuple.value;
                return acc;
            };
            return context.resolvePath().then(function (results) { return results.reduce(tuples2ObjR, {}); });
        };
        return parent ? parent.then(resolveData) : resolveData({});
    }
};
/** @hidden */
var resolveFactory = function () { return $resolve; };
// The old $resolve service
angular.module('ui.router').factory('$resolve', resolveFactory);

exports.resolveFactory = resolveFactory;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=resolveService.js.map
