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

'use strict';
angular.module('showcase.angularDirectiveInDOM', ['datatables'])
    .controller('AngularDirectiveInDomCtrl', AngularDirectiveInDomCtrl)
    .directive('datatableWrapper', datatableWrapper)
    .directive('customElement', customElement);

function AngularDirectiveInDomCtrl(DTOptionsBuilder, DTColumnBuilder) {
    var vm = this;
    vm.dtOptions = DTOptionsBuilder.fromSource('data.json')
        // Add your custom button in the DOM
        .withDOM('<"custom-element">pitrfl');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('id').withTitle('ID'),
        DTColumnBuilder.newColumn('firstName').withTitle('First name'),
        DTColumnBuilder.newColumn('lastName').withTitle('Last name').notVisible()
    ];
}

/**
 * This wrapper is only used to compile your custom element
 */
function datatableWrapper($timeout, $compile) {
    return {
        restrict: 'E',
        transclude: true,
        template: '<ng-transclude></ng-transclude>',
        link: link
    };

    function link(scope, element) {
        // Using $timeout service as a "hack" to trigger the callback function once everything is rendered
        $timeout(function () {
            // Compiling so that angular knows the button has a directive
            $compile(element.find('.custom-element'))(scope);
        }, 0, false);
    }
}

/**
 * Your custom element
 */
function customElement() {
    return {
        restrict: 'C',
        template: '<h1>My custom element</h1>'
    };
}
