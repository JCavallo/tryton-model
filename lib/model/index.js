var _ = require('lodash')
var utils = require('../utils')
var methods = require('../methods')

var types = {
  'char': require('./char'),
  'selection': require('./selection'),
  'datetime': require('./datetime'),
  'timestamp': require('./datetime'),
  'date': require('./date'),
  'time': require('./time'),
  'timedelta': require('./timedelta'),
  'float': require('./float'),
  'numeric': require('./numeric'),
  'integer': require('./integer'),
  'boolean': require('./boolean'),
  'many2one': require('./many2one'),
  'one2one': require('./one2one'),
  'one2many': require('./one2many'),
  'many2many': require('./many2many'),
  'reference': require('./reference'),
  'binary': require('./binary'),
  'dict': require('./dict')
}

function createField (model, desc) {
  var type = desc.type
  var Cls = types[type] || types['char']
  return new Cls(model, desc)
}

function Model (session, name, context) {
  if (this instanceof Model) {
    var fields = context // when used as ctor, context makes no sense
    this.session = session
    this.name = name
    this.fields = _.mapValues(fields, (f) => createField(this, f))
  } else {
    return session.rpc('model.' + name + '.' + methods.modelFields, [], context)
      .then((result) => {
        return new Model(session, name, result, context)
      })
  }
}

Model.prototype.checkAccess = function (action) {
  return !!this.session.access[this.name][action]
}

Model.get = function (session, name, lazy) {
  var model = session.models[name]
  if (lazy) {
    return utils.isPromise(model) ? null : model
  }
  if (model) {
    return utils.isPromise(model) ? model : Promise.resolve(model)
  } else {
    var promise = Model(session, name)
      .then((model) => {
        session.models[name] = model
        return model
      })
    session.models[name] = promise
    return promise
  }
}

module.exports = Model
