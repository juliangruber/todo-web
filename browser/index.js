var engine = require('engine.io-stream');
var Doc = require('crdt').Doc;
var sorta = require('sorta');
var ready = require('domready');
var h = require('hyperscript');

/**
 * Models.
 */

var doc = window.DOC = new Doc();
var Model = require('todo-model')(doc);
var Tasks = Model.Tasks;
var Lists = Model.Lists;
var Users = Model.Users;

/**
 * Replication.
 */

var ws = engine('/engine');
ws.pipe(doc.createStream()).pipe(ws);

/**
 * Display tasks.
 */

function compare (a, b) {
  return a - b;
}

var list = sorta({
  compare : compare
}, function (row) {
  return h('p', row.key);
});

ready(function () {
  list.appendTo(document.body);
});

Tasks.findStream().on('data', function (task) {
  list.write({
    key : task.name(),
    value : task.ts()
  });
});

/**
 * Insert tasks.
 */

var input = h('input');
var form = h('form', { onsubmit : function (ev) {
  Tasks.add(input.value);
  input.value = '';
  ev.preventDefault();
}}, input);

ready(function () {
  document.body.appendChild(form);
});
