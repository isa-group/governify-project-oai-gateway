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
angular.module('showcase.serverSideProcessing', ['datatables'])
.controller('ServerSideProcessingCtrl', ServerSideProcessingCtrl);

function ServerSideProcessingCtrl(DTOptionsBuilder, DTColumnBuilder) {
    var vm = this;
    vm.dtOptions = DTOptionsBuilder.fromSource('data.json')
        .withPaginationType('full_numbers');
    //vm.dtOptions = DTOptionsBuilder.newOptions()
    //     .withOption('ajax', {
    //      // Either you specify the AjaxDataProp here
    //      // dataSrc: 'data',
    //      url: '/angular-datatables/data/serverSideProcessing',
    //      type: 'POST'
    //  })
    //  // or here
    //  .withDataProp('data')
    //    .withOption('processing', true)
    //     .withOption('serverSide', true)
    //     .withPaginationType('full_numbers');
    vm.dtColumns = [
        DTColumnBuilder.newColumn('id').withTitle('ID'),
        DTColumnBuilder.newColumn('firstName').withTitle('First name'),
        DTColumnBuilder.newColumn('lastName').withTitle('Last name').notVisible()
    ];
}
