(function() {
  var App, Contact, ContactCollection, Cursor, DetailView, Filter, ListView, RibbonView, StatusView, app;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  App = (function() {
    function App() {
      this._contacts = new ContactCollection;
      this._ribbonView = new RibbonView({
        collection: this._contacts
      });
      this._statusView = new StatusView({
        collection: this._contacts
      });
      this._listView = new ListView({
        collection: this._contacts
      });
      this._detailView = new DetailView({
        collection: this._contacts
      });
    }
    App.prototype.start = function() {
      this._ribbonView.render();
      this._statusView.render();
      this._listView.render();
      return this._contacts.cursor.set();
    };
    return App;
  })();
  Contact = (function() {
    __extends(Contact, Backbone.Model);
    function Contact() {
      Contact.__super__.constructor.apply(this, arguments);
    }
    Contact.prototype.localStorage = new Store('contacts');
    Contact.prototype.getName = function() {
      return this.get('name');
    };
    Contact.prototype.getAddress = function() {
      return this.get('address');
    };
    Contact.prototype.getPhone = function() {
      return this.get('phone');
    };
    Contact.prototype.getMobile = function() {
      return this.get('mobile');
    };
    Contact.prototype.getEmail = function() {
      return this.get('email');
    };
    Contact.prototype.validate = function(attrs) {
      if (!attrs.name) {
        return 'Contact name required';
      }
    };
    return Contact;
  })();
  ContactCollection = (function() {
    __extends(ContactCollection, Backbone.Collection);
    function ContactCollection() {
      ContactCollection.__super__.constructor.apply(this, arguments);
    }
    ContactCollection.prototype.model = Contact;
    ContactCollection.prototype.localStorage = Contact.prototype.localStorage;
    ContactCollection.prototype.comparator = function(contact) {
      return contact.getName();
    };
    ContactCollection.prototype.initialize = function() {
      this.fetch();
      this.cursor = new Cursor(this);
      return this.filter = new Filter(this);
    };
    return ContactCollection;
  })();
  Filter = (function() {
    function Filter(collection) {
      this._query = '';
      this._collection = collection;
    }
    Filter.prototype.set = function(query) {
      if (query === this._query) {
        return;
      }
      this._query = query;
      return this._collection.trigger('filter');
    };
    Filter.prototype.selection = function() {
      return this._collection.select(__bind(function(contact) {
        return contact.getName().match(RegExp(this._query || '.*', 'i'));
      }, this));
    };
    return Filter;
  })();
  Cursor = (function() {
    function Cursor(collection) {
      this._collection = collection;
      this._collection.bind('remove', __bind(function() {
        return this.set();
      }, this));
      this._collection.bind('reset', __bind(function() {
        return this.set();
      }, this));
      this._collection.bind('filter', __bind(function() {
        return this.set();
      }, this));
    }
    Cursor.prototype.get = function() {
      return this._model;
    };
    Cursor.prototype.set = function(model) {
      if (model == null) {
        model = null;
      }
      if (model === this._model) {
        this["return"];
      }
      this._model = model || this._collection.filter.selection()[0] || null;
      return this._collection.trigger('select');
    };
    return Cursor;
  })();
  RibbonView = (function() {
    __extends(RibbonView, Backbone.View);
    function RibbonView() {
      RibbonView.__super__.constructor.apply(this, arguments);
    }
    RibbonView.prototype.el = $('#ribbon');
    RibbonView.prototype.template = _.template($('#ribbon-template').html());
    RibbonView.prototype.events = {
      'click button.create': 'create',
      'click button.clear': 'clear',
      'click button.import': 'import',
      'keyup input.search': 'search'
    };
    RibbonView.prototype.render = function() {
      console.log("render ribbon " + this.cid);
      return this.el.html(this.template());
    };
    RibbonView.prototype.create = function(e) {
      return this.collection.cursor.set(new Contact);
    };
    RibbonView.prototype.clear = function(e) {
      var contact, _i, _len, _ref;
      if (!confirm('About to delete all data.')) {
        return;
      }
      _ref = this.collection.toArray();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        contact = _ref[_i];
        contact.destroy({
          silent: true
        });
      }
      return this.collection.reset();
    };
    RibbonView.prototype["import"] = function(e) {
      var contact, _i, _len;
      if (!confirm('About to import data.')) {
        return;
      }
      for (_i = 0, _len = $IMPORT_DATA.length; _i < _len; _i++) {
        contact = $IMPORT_DATA[_i];
        this.collection.create(contact, {
          silent: true
        });
      }
      return this.collection.trigger('reset', this.collection);
    };
    RibbonView.prototype.search = function(e) {
      return this.collection.filter.set($(e.target).val());
    };
    return RibbonView;
  })();
  StatusView = (function() {
    __extends(StatusView, Backbone.View);
    function StatusView() {
      this.render = __bind(this.render, this);
      StatusView.__super__.constructor.apply(this, arguments);
    }
    StatusView.prototype.el = $('#status');
    StatusView.prototype.template = _.template($('#status-template').html());
    StatusView.prototype.initialize = function() {
      this.collection.bind('add', this.render);
      this.collection.bind('remove', this.render);
      this.collection.bind('reset', this.render);
      this.collection.bind('filter', this.render);
      return this.collection.bind('change', this.render);
    };
    StatusView.prototype.render = function() {
      console.log("render status " + this.cid);
      return this.el.html(this.template({
        contacts: this.collection.filter.selection()
      }));
    };
    return StatusView;
  })();
  ListView = (function() {
    __extends(ListView, Backbone.View);
    function ListView() {
      this.renderCursor = __bind(this.renderCursor, this);
      this.render = __bind(this.render, this);
      ListView.__super__.constructor.apply(this, arguments);
    }
    ListView.prototype.el = $('#list');
    ListView.prototype.events = {
      'click li': 'select'
    };
    ListView.prototype.template = _.template($('#list-template').html());
    ListView.prototype.initialize = function() {
      this.collection.bind('add', this.render);
      this.collection.bind('remove', this.render);
      this.collection.bind('reset', this.render);
      this.collection.bind('filter', this.render);
      this.collection.bind('change', this.render);
      return this.collection.bind('select', this.renderCursor);
    };
    ListView.prototype.render = function() {
      console.log("render list " + this.cid);
      this.el.html(this.template({
        contacts: this.collection.filter.selection()
      }));
      return this.renderCursor();
    };
    ListView.prototype.renderCursor = function() {
      var li, _ref;
      console.log("render cursor " + this.cid);
      this.$('li.cursor').removeClass('cursor');
      li = this.$("[data-id=" + ((_ref = this.collection.cursor.get()) != null ? _ref.id : void 0) + "]");
      return li.addClass('cursor');
    };
    ListView.prototype.select = function(e) {
      var model;
      model = this.collection.get(e.target.getAttribute('data-id'));
      return this.collection.cursor.set(model);
    };
    return ListView;
  })();
  DetailView = (function() {
    __extends(DetailView, Backbone.View);
    function DetailView() {
      this.render = __bind(this.render, this);
      DetailView.__super__.constructor.apply(this, arguments);
    }
    DetailView.prototype.el = $('#detail');
    DetailView.prototype.template = _.template($('#detail-template').html());
    DetailView.prototype.events = {
      'click button.save': 'save',
      'click button.delete': 'delete'
    };
    DetailView.prototype.initialize = function() {
      return this.collection.bind('select', this.render);
    };
    DetailView.prototype.render = function() {
      console.log("render detail " + this.cid);
      this.model = this.collection.cursor.get();
      return this.el.html(this.model === null ? '' : this.template({
        contact: this.model
      }));
    };
    DetailView.prototype.save = function(e) {
      console.log("save detail " + this.cid);
      return this.model.save({
        name: this.$('[name="name"]').val(),
        address: this.$('[name="address"]').val(),
        phone: this.$('[name="phone"]').val(),
        mobile: this.$('[name="mobile"]').val(),
        email: this.$('[name="email"]').val()
      }, {
        success: __bind(function(model, resp) {
          if (!this.model.collection) {
            this.collection.add(this.model, {
              at: 0
            });
            return this.collection.cursor.set(this.model);
          }
        }, this),
        error: __bind(function(model, error) {
          return this.$('.error').text(error);
        }, this)
      });
    };
    DetailView.prototype["delete"] = function(e) {
      console.log("destroy contact " + this.cid);
      return this.model.destroy();
    };
    return DetailView;
  })();
  app = new App;
  if (window.console === void 0) {
    window.console = {
      log: function() {}
    };
  }
  $(document).ready(function() {
    console.log('start app');
    return app.start();
  });
}).call(this);
