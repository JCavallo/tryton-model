var t = require('tap');
var _ = require('lodash');
var co = require('co');
var Session = require('tryton-session');
var model = require('..');
var data = require('./.data');
//
model.init(Session);
var session = new Session(data.server, data.database);
var cache;

function start() {
  return session.start(data.username, data.password);
}

function access() {
  t.ok(_.isPlainObject(session.access));
  t.ok(session.access['ir.model']);
  var sample = _.sample(session.access);
  t.ok(_.isPlainObject(sample));
  t.ok(!_.isNil(sample.create));
  t.ok(!_.isNil(sample.read));
  t.ok(!_.isNil(sample.write));
  t.ok(!_.isNil(sample.delete));
}

function check() {
  t.ok(_.isPlainObject(session.models));
  t.ok(session.models['ir.model']);
  var m = session.models['ir.model'];
  t.ok(m instanceof model.Model);
}

function models() {
  return co(function* () {
    yield model.Model.get(session, 'ir.model');
    check();
  });
}

function pack() {
  return co(function* () {
    cache = yield session.pack();
    t.isa(cache, 'string');
  });
}

function unpack() {
  return co(function* () {
    session = yield Session.unpack(cache);
    access();
    check();
  });
}

function stop() {
  return session.stop();
}
t.test(start)
  .then(access)
  .then(models)
  .then(pack)
  .then(unpack)
  .then(stop)
  .catch(t.threw);