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
angular.module('showcase')
.controller('SidebarCtrl', SidebarCtrl);

function SidebarCtrl($scope, $resource, USAGES) {
    var vm = this;
    vm.currentView = 'gettingStarted';
    vm.basicUsages = USAGES.basic;
    vm.advancedUsages = USAGES.advanced;
    vm.withPluginsUsages = USAGES.withPlugins;
    // Functions
    vm.isActive = isActive;
    vm.isBasicUsageActive = isBasicUsageActive;
    vm.isAdvancedUsageActive = isAdvancedUsageActive;
    vm.isWithPluginsUsageActive = isWithPluginsUsageActive;

    // Listeners
    $scope.$on('event:changeView', function (event, view) {
        vm.currentView = view;
        vm.isBasicUsageCollapsed = vm.isBasicUsageActive();
        vm.isAdvancedUsageCollapsed = vm.isAdvancedUsageActive();
        vm.isWithPluginsUsageCollapsed = vm.isWithPluginsUsageActive();
    });

    function _isUsageActive(usages, currentView) {
        var active = false;
        angular.forEach(usages, function(usage) {
            if (currentView === usage.name) {
                active = true;
            }
        });
        return active;
    }

    function isActive(view) {
        return vm.currentView === view;
    }
    function isBasicUsageActive() {
        return _isUsageActive(USAGES.basic, vm.currentView);
    }
    function isAdvancedUsageActive() {
        return _isUsageActive(USAGES.advanced, vm.currentView);
    }
    function isWithPluginsUsageActive() {
        return _isUsageActive(USAGES.withPlugins, vm.currentView);
    }
}
