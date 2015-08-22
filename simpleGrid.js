/* global utils, $, jQuery, define, module */
/* exported simpleGrid */
/*!
	simpleGrid.js - v: 0.1 - 2015-21-08

  	2015 Albert Cansado Sola; Licensed MIT
*/
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.simpleGrid = factory();
  	}
}(this, function () {
	"use strict";

	var recursiveProp = function (obj, path, value) {
        if (typeof path === "string") {
            path = path.split('.');
        }

        if(path.length > 1) {
            var key = path.shift();
            if (utils.isNull(obj[key]) || !utils.isObject(obj[key])) {
                obj[key] = {};
            }
            return recursiveProp(obj[key], path, value);
        } else {
            if (!utils.isUndefined(value)) {
                obj[path[0]] = value;
            }
            return obj[path[0]];
        }
    };

    function classReg( className ) {
        return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
    }

    var utils = {
        // Class
        hasClass: function(elem, c) {
            return classReg(c).test(elem.className);
        },
        addClass: function(elem, c) {
            if ( !utils.hasClass( elem, c ) ) {
                if (!utils.isEmpty(elem.className)) {
                    c = ' ' + c;
                }
                elem.className = elem.className + c;
            }
        },
        removeClass: function(elem, c) {
            elem.className = elem.className.replace( classReg( c ), '' );
        },
        toggleClass: function(elem, c) {
            var fn = utils.hasClass( elem, c ) ? utils.removeClass : utils.addClass;
            fn( elem, c );
        },
        // events
        on: function(elem, event, listener) {
            if (utils.isNodeList(elem)) {
                utils.foreach(elem, function (item) {
                    utils.on(item, event, listener);
                });
                return;
            }
            elem.addEventListener(event, listener.bind(event));
        },
        off: function(elem, event) {
            elem.removeEventListener(event);
        },
        // is...
        isNull: function (foo) {
            return Boolean(foo === null);
        },
        isUndefined: function(foo) {
            return typeof foo === 'undefined';
        },
        isEmpty: function (str) {
            return (!str || str.length === 0);
        },
        isElement: function (foo) {
            return !!(foo && foo.nodeType === 1);
        },
        isNodeList: function(foo) {
            // Work in IE??
            return (!utils.isUndefined(foo.length) && !utils.isUndefined(foo.item));
        },
        isJqObject: function(foo) {
            try {
                return foo instanceof jQuery;
            } catch (err) {
                return false;
            }
        },
        isObject: function (obj) {
            var type = typeof obj;

            return type === 'function' || type === 'object' && !!obj;
        },
        isFunction: function (foo) {
            return typeof foo === 'function';
        },
        isString: function(foo) {
            return typeof foo === 'string';
        },
        equalTag: function (el, tagName) {
            try {
                return el.tagName.toLowerCase() === tagName.toString();
            } catch (err) {
                return false;
            }
        },
        insert: function(el, foo, isHtml) {
            isHtml = !utils.isUndefined(isHtml) ? Boolean(isHtml) : true;
            if (utils.isElement(foo)) {
                el.appendChild(foo);
            } else {
                el[isHtml ? 'innerHTML' : 'textContent'] = foo.toString();
            }
            return el;
        },
        value: function(el, val) {
            if (!utils.isUndefined(val)) {
                if (utils.equalTag(el, 'input')) {
                    el.value = val;
                } else {
                    utils.insert(el, val);
                }
            }
            if (utils.equalTag(el, 'input')) {
                return el.value;
            } else if (utils.isElement(el)) {
                return el.innerHTML;
            }

            return el;
        },
        matchSelector: function (elem, selector, firstChar) {
            if (!selector) {
                return false;
            }

            if (utils.isUndefined(firstChar)) {
                firstChar = selector.charAt(0);
            }
            var matched = false;

            if (firstChar === '.') {
                // Class
                matched = utils.hasClass(elem, selector.substr(1));
            } else if (firstChar === '#') {
                // Id
                matched = (elem.id === selector.substr(1));
            } else if (firstChar === '[') {
                // Attribute
                matched = (elem.hasAttribute(selector.substr(1, selector.length - 1)));
            } else {
                // element tag
                matched = utils.equalTag(elem, selector);
            }

            return matched;
        },
        getParents: function(elem, selector, stopWhenFind) {
            var parents = [];
            var firstChar = '';
            if (selector) {
                firstChar = selector.charAt(0);
            }

            for ( ; elem && elem !== document; elem = elem.parentNode ) {

                if (selector) {
                    if (utils.matchSelector(elem, selector, firstChar)) {
                        parents.push(elem);
                    }
                } else {
                    parents.push(elem);
                }

                if (stopWhenFind && parents.length) {
                    break;
                }
            }

            return parents;
        },
        getParent: function (elem, selector) {
            var result = utils.getParents(elem, selector, true);
            return (result.length) ? result[0] : [];
        },
        foreach: function (el, callback) {
            if (utils.isNodeList(el)) {
                [].slice.call(el).forEach(callback);
            }
        },
        extend: function () {
            var extended = {};
            var merge = function (obj) {
                for (var prop in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                        if (utils.isObject(obj[prop])) {
                            extended[prop] = utils.extend(extended[prop], obj[prop]);
                        }
                        else {
                            extended[prop] = obj[prop];
                        }
                    }
                }
            };
            merge(arguments[0]);
            for (var i = 1, j = arguments.length; i < j; i++) {
                var obj = arguments[i];
                merge(obj);
            }
            return extended;
        },
        formatNumber: function (price, format, symbol) {
            var decimals = '';
            var thousands = '';
            var precision = 0;
            var space = false;
            var currency = false;
            for (var i = 0, j = format.length; i < j; i++) {
                switch (format[i]) {
                    case ',':
                    case '.':
                        if (decimals) {
                            thousands = decimals;
                        }
                        decimals = format[i];
                        precision = 0;
                        break;
                    case '#':
                        precision++;
                        break;
                    case ' ':
                        space = true;
                        break;
                    case 'c':
                        currency = (i === 0) ? 'first' : 'last';
                        break;
                    default:
                        break;
                }
            }

            var aux = Number(price).formatMoney(precision, decimals, thousands);
            if (currency && symbol) {
                if (currency === 'first') {
                    aux = (space) ? symbol + ' ' + aux : symbol + aux;
                } else {
                    aux = (space) ? aux + ' ' + symbol : aux + symbol;
                }
            }

            return aux;
        }
    };

    Number.prototype.formatMoney = function(c, d, t){
        c = isNaN(c = Math.abs(c)) ? 2 : c;
        d = utils.isUndefined(d) ? "." : d;
        t = utils.isUndefined(t) ? "," : t;

        var n = this,
            s = n < 0 ? "-" : "",
            i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
            j = (j = i.length) > 3 ? j % 3 : 0;

        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    };

    var defaults = {
        selector: ".js-simpleGrid",
        emptyText: "Nada :(",
        removeText: 'Are you sure you want to delete this row?',
        icons: {
            edit: '',
            remove: '',
            cancel: '',
            save: ''
        },
        oddClass: 'sg-odd',
        evenClass: 'sg-even',
        headers: [],
        allowEmpty: true,
        actions: {
            add: true,
            edit: true,
            remove: true
        },
        columns: {},
        sorting: true
    };

    var simpleGrid = function () {
        this.options = utils.extend({}, defaults, arguments[0]);
        this.el = document.querySelector(this.config('selector'));
        if (!this.el) {
            return;
        }
        this._data = {};
        this.init();
    };

    simpleGrid.prototype.nextId = 0;

    simpleGrid.prototype.data = function(foo, key, action) {
        if (utils.isUndefined(action) && !utils.isUndefined(key)) {
            action = key;
        }

        switch (action) {
            case 'edit':
                if (utils.isUndefined(key) || !utils.isObject(foo)) {
                    return false;
                }
                this._data[key] = foo;
                break;
            case 'remove':
                if (!utils.isString(foo)) {
                    return false;
                }
                delete this._data[foo];
                break;
            case 'get':
                var item = this._data[foo];
                if (utils.isUndefined(item)) {
                    return '';
                }

                if (key === action) {
                    return item;
                }

                return (item.hasOwnProperty(key)) ? item[key] : '';
                /* falls through */
            case 'addAll':
                if (!utils.isObject(foo)) {
                    return false;
                }
                this._data = foo;
                break;
            case 'add':
                /* falls through */
            default:
                if (!utils.isObject(foo)) {
                    return false;
                }
                this._data[key] = foo;
                break;
        }

        utils.insert(this.saveInput, JSON.stringify(this._data));

        return true;
    };

    simpleGrid.prototype.config = function (key, value) {
        return recursiveProp(this.options, key, value);
    };

    simpleGrid.prototype.init = function () {
        this.table = this.el.querySelector('table');
        this.emptyRow = this.table.querySelector('.sg-empty-row');
        this.addBtn = this.el.querySelector('.sg-add');
        this.saveInput = this.el.querySelector('.sg-textarea');

        if (utils.isNull(this.table) || utils.isNull(this.emptyRow) || utils.isNull(this.saveInput)) {
            throw "init elements are wrong";
        }

        // Get num th
        this.config('cols', this.table.querySelectorAll('th').length);

        // Work with tbody
        this.table = this.el.querySelector('tbody');

        // Create rows from data if exists
        this._initData();

        // Check if sorting
        if (this.config('sorting') && (window.jQuery && jQuery.tableDnD)) {
            this.orderBtn = this.el.querySelector('.sg-order');
            this._sorting();
        } else {
            this.config('sorting', false);
        }

        // Check Num rows
        var _numRows = this.table.rows.length;
        this.config('empty', (_numRows === 1));
        this.nextId = _numRows - 1;

        this._toggleEmpty(!this.config('empty'));

        this._attachEvents();
    };

    simpleGrid.prototype._initData = function () {
        var data = this.saveInput.innerHTML;
        if (utils.isEmpty(data)) {
            return;
        }

        try {
            this._data = JSON.parse(data);
        } catch (err) {
            return false;
        }

        for (var key in this._data) {
            if (this._data.hasOwnProperty(key)) {
                this.addRow(key, 0);
            }
        }
    };

    simpleGrid.prototype._allow = function (action) {
        if (utils.isUndefined(action)) {
            return false;
        }

        return Boolean(this.config('actions.' + action));
    };

    simpleGrid.prototype._setId = function() {
        var id = this.nextId;
        this.nextId += 1;
        return 'sg' + id;
    };

    simpleGrid.prototype._isNew = function(tr) {
        var result = false;
        if (utils.equalTag(tr, 'tr')) {
            result = Boolean(parseInt(tr.getAttribute('data-new'), 10));
        }

        return result;
    };

    simpleGrid.prototype._attachEvents = function () {
        if (this._allow('add')) {
            utils.on(this.addBtn, 'click', this.onAddRow.bind(this));
        }

        if (this.config('sorting')) {
            utils.on(this.orderBtn, 'click', this.onSaveOrder.bind(this));
        }

        utils.on(this.table, 'keypress', this.onKeyPress.bind(this));
    };

    simpleGrid.prototype._toggleEmpty = function (hide) {
        utils[(Boolean(hide)) ? 'addClass' : 'removeClass'](this.emptyRow, 'sg-hidden');
    };

    simpleGrid.prototype._evenOddClass = function(el, index) {
        utils.addClass(el, this.config((index % 2) ? 'evenClass' : 'oddClass'));
    };

    simpleGrid.prototype._resetRowsClass = function() {
        var rows = this.table.rows;
        for (var i = 1, j = rows.length - 1; i <= j; i++) {
            var tr = rows[i];
            utils.removeClass(tr, this.config('evenClass'));
            utils.removeClass(tr, this.config('oddClass'));
            this._evenOddClass(tr, i);
        }
    };

    simpleGrid.prototype._sorting = function() {
        if (!this.config('sorting')) {
            return false;
        }

        if (utils.isUndefined(this.tablednd)) {
            // Create
            this.tablednd = $(this.table).tableDnD({
                onDragClass: 'sg-drag'
            });
        } else {
            this.tablednd.tableDnDUpdate();
        }

        return true;
    };

    simpleGrid.prototype._formatContent = function(foo, label) {
        if (utils.isUndefined(label)) {
            return foo;
        }

        var opt = this.config('columns.' + label);
        if (opt) {
            if (opt.type === 'number') {
                foo = utils.formatNumber(foo, opt.format, opt.currency);
            }
        }

        return foo;
    };

    // Create Components

    simpleGrid.prototype._createEditBtn = function () {
        var btn = document.createElement('button');
        btn.className = 'sg-btn sg-btn--edit';
        btn.onclick = this.onEditRow.bind(this);
        btn.innerHTML = '<img src="' + this.config('icons.edit') + '" alt="Edit">';
        btn.href = '#';
        return btn;
    };

    simpleGrid.prototype._createDeleteBtn = function () {
        var btn = document.createElement('button');
        btn.className = 'sg-btn sg-btn--delete';
        btn.onclick = this.onDeleteRow.bind(this);
        btn.innerHTML = '<img src="' + this.config('icons.remove') + '" alt="Delete">';
        return btn;
    };

    simpleGrid.prototype._createCancelEditBtn = function () {
        var btn = document.createElement('button');
        btn.className = 'sg-btn sg-btn--cancel';
        btn.onclick = this.onCancelRow.bind(this);
        btn.innerHTML = '<img src="' + this.config('icons.cancel') + '" alt="Cancel">';
        return btn;
    };

    simpleGrid.prototype._createSaveBtn = function () {
        var btn = document.createElement('button');
        btn.className = 'sg-btn sg-btn--save';
        utils.on(btn, 'click', this.onSaveRow.bind(this));
        btn.innerHTML = '<img src="' + this.config('icons.save') + '" alt="Save">';
        return btn;
    };

    simpleGrid.prototype._createEditingDiv = function() {
        var div = document.createElement('div');
        div.className = 'sg-options--edit';
        div.appendChild(this._createSaveBtn());
        div.appendChild(this._createCancelEditBtn());

        return div;
    };

    simpleGrid.prototype._createNormalDiv = function() {
        var div = document.createElement('div');
        div.className = 'sg-options';
        if (this._allow('edit')) {
            div.appendChild(this._createEditBtn());
        }

        if (this._allow('remove')) {
            div.appendChild(this._createDeleteBtn());
        }

        return div;
    };

    simpleGrid.prototype._createOptionsCell = function (tr, pos) {
        var td = this.addCell(tr, pos);
        td.appendChild(this._createNormalDiv());
        td.appendChild(this._createEditingDiv());
    };

    simpleGrid.prototype._createInput = function (label, value) {
        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'sg-input';
        if (!utils.isUndefined(label)) {
            input.setAttribute('data-label', label);
        }
        if (!utils.isUndefined(value)) {
            input.value = value;
        }

        return input;
    };

    // Events

    simpleGrid.prototype.onKeyPress = function (ev) {
        if (ev.which === 13 || ev.charCode === 13) {
            this.onSaveRow(ev);
        }
    };

    simpleGrid.prototype.onAddRow = function (ev) {
        ev.preventDefault();

        var isEmpty = this.config('empty');
        if (isEmpty) {
            this._toggleEmpty(isEmpty);
            this.config('empty', !isEmpty);
        }
        this.addRow();
    };

    simpleGrid.prototype.onEditRow = function (ev) {
        ev.preventDefault();

        var tr = utils.getParent(ev.currentTarget, 'tr');
        if (tr) {
            tr.setAttribute('data-new', 0);
            this._toggleColumns(tr, true);
        }
    };

    simpleGrid.prototype.onDeleteRow = function (ev) {
        ev.preventDefault();

        if (!confirm(this.config('removeText'))) {
            return;
        }

        var tr = utils.getParent(ev.currentTarget, 'tr');
        if (tr) {
            this.removeRow(tr);
            this._resetRowsClass();
            this._sorting();
        }
    };

    simpleGrid.prototype.onCancelRow = function(ev) {
        ev.preventDefault();

        var tr = utils.getParent(ev.currentTarget, 'tr');
        var isNew = this._isNew(tr);
        if (isNew) {
            this.removeRow(tr);
        } else {
            this._toggleColumns(tr, false);
        }
    };

    simpleGrid.prototype.onSaveRow = function (ev) {
        ev.preventDefault();

        var tr = utils.getParent(ev.target, 'tr');
        var isNew = this._isNew(tr);
        var id = tr.getAttribute('data-id');
        var row = {};
        var emptyProps = true;

        for (var i = 0, j = this.config('cols') - 1; i < j; i++) {
            var td = tr.children[i];
            var inputValue = utils.value(td.children[0]);

            if (!utils.isEmpty(inputValue) && emptyProps) {
                emptyProps = false;
            }

            row[td.getAttribute('data-label')] = inputValue;
        }

        if (!this.config('allowEmpty') && emptyProps) {
            this.removeRow(tr);
            return;
        }

        this.data(row, id, (isNew) ? 'add' : 'edit');
        this._toggleColumns(tr);
        this._sorting();
    };

    simpleGrid.prototype.onSaveOrder = function(ev) {
        ev.preventDefault();

        var newData = {};
        var rows = this.table.rows;
        for (var i = 1, j = rows.length; i < j; i++) {
            var id = rows[i].getAttribute('data-id');
            newData[id] = this.data(id, 'get');
        }
        this.data(newData, 'addAll');
        this._resetRowsClass();
    };

    // Edit Row DOM

    simpleGrid.prototype._createColums = function(tr, id) {
        var isNew = this._isNew(tr);
        for (var i = 0, j = this.config('cols') - 1; i < j; i++) {
            var label = this.config('headers.' + i);

            var content = '';
            if (isNew) {
                content = this._createInput();
            } else {
                content = this._formatContent(this.data(id, label, 'get'), label);
            }

            this.addCell(tr, i, label, content);
        }

        this._createOptionsCell(tr, i);
    };

    simpleGrid.prototype._toggleColumns = function(tr, edit) {
        edit = (utils.isUndefined(edit)) ? false : edit;

        var id = tr.getAttribute('data-id');
        for (var i = 0, j = this.config('cols') - 1; i < j; i++) {
            var label = this.config('headers.' + i);
            var td = tr.children[i];

            var content = '';
            if (edit) {
                // Add input
                content = this._createInput(label, this.data(id, label, 'get'));
            } else {
                // View
                content = this._formatContent(this.data(id, label, 'get'), label);
            }

            td.innerHTML = '';
            utils.insert(td, content);
        }

        utils[(edit) ? 'addClass' : 'removeClass'](tr, 'sg-is-editing');
    };

    simpleGrid.prototype.addCell = function (tr, pos, label, html) {
        var td = tr.insertCell(pos);
        td.className = 'sg-col sg-col' + pos.toString();
        if (!utils.isUndefined(label)) {
            td.setAttribute('data-label', label);
        }

        if (!utils.isUndefined(html)) {
            var content = html;
            if (utils.isFunction(html)) {
                content = html.apply(this);
            }

            utils.insert(td, content);
        }

        return td;
    };

    simpleGrid.prototype.addRow = function (id, isNew) {
        if (utils.isUndefined(id)) {
            id = this._setId();
        }

        if (utils.isUndefined(isNew)) {
            isNew = 1;
        }

        try {
            var tr = this.table.insertRow(-1);

            tr.setAttribute('data-new', isNew);
            tr.setAttribute('data-id', id);
            this._evenOddClass(tr, this.table.rows.length - 1);

            this._createColums(tr, id);

            if (isNew) {
                utils.addClass(tr, 'sg-is-editing');
            }

        } catch (err) {
            this.removeRow(tr);
            return false;
        }
        return true;
    };

    simpleGrid.prototype.removeRow = function (tr) {
        try {
            this.data(tr.getAttribute('data-id'), 'remove');
            this.table.deleteRow(tr.rowIndex - 1);
        } catch (err) {}

        if (this.table.rows.length === 1) {
            this.config('empty', true);
            this.config('nextId', 0);
            this._toggleEmpty(false);
        }
    };

    return simpleGrid;
}));
