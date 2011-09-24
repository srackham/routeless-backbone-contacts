(function() {
  var App, Contact, ContactCollection, EditContactView, ListContactView, ShowContactView, app;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  App = (function() {
    App.prototype.contacts = null;
    App.prototype.listView = null;
    App.prototype.showView = null;
    App.prototype.editView = null;
    function App() {
      this.contacts = new ContactCollection;
      this.listView = new ListContactView({
        collection: this.contacts
      });
      this.showView = new ShowContactView({
        collection: this.contacts
      });
      this.editView = new EditContactView({
        collection: this.contacts
      });
    }
    App.prototype.start = function() {
      return this.list();
    };
    App.prototype.list = function() {
      return this.listView.render();
    };
    App.prototype.show = function(model) {
      return this.showView.render(model);
    };
    App.prototype.edit = function(model) {
      return this.editView.render(model);
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
      return this.fetch();
    };
    return ContactCollection;
  })();
  ListContactView = (function() {
    __extends(ListContactView, Backbone.View);
    function ListContactView() {
      ListContactView.__super__.constructor.apply(this, arguments);
    }
    ListContactView.prototype.el = $('#page');
    ListContactView.prototype.template = _.template($('#list-template').html());
    ListContactView.prototype.events = {
      'click button.create': 'create',
      'click button.clear': 'clear',
      'click button.import': 'import'
    };
    ListContactView.prototype.render = function() {
      console.log("render list " + this.cid);
      return this.el.html(this.template({
        contacts: this.collection
      }));
    };
    ListContactView.prototype.create = function(e) {
      return app.edit(new Contact);
    };
    ListContactView.prototype.clear = function(e) {
      var contact, _i, _len, _ref;
      if (!confirm('About to delete all data.')) {
        return;
      }
      _ref = this.collection.toArray();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        contact = _ref[_i];
        contact.destroy();
      }
      return this.render();
    };
    ListContactView.prototype["import"] = function(e) {
      var contact, _i, _len;
      if (!confirm('About to import data.')) {
        return;
      }
      for (_i = 0, _len = $IMPORT_DATA.length; _i < _len; _i++) {
        contact = $IMPORT_DATA[_i];
        this.collection.create(contact);
      }
      return this.render();
    };
    return ListContactView;
  })();
  ShowContactView = (function() {
    __extends(ShowContactView, Backbone.View);
    function ShowContactView() {
      ShowContactView.__super__.constructor.apply(this, arguments);
    }
    ShowContactView.prototype.el = $('#page');
    ShowContactView.prototype.template = _.template($('#show-template').html());
    ShowContactView.prototype.events = {
      'click button.delete': 'delete',
      'click button.edit': 'edit',
      'click button.list': 'list',
      'click a.show': 'show'
    };
    ShowContactView.prototype.render = function(model) {
      if (model == null) {
        model = this.model;
      }
      console.log("render contact " + this.cid);
      this.model = model;
      return this.el.html(this.template({
        contact: this.model
      }));
    };
    ShowContactView.prototype.list = function(e) {
      return app.list();
    };
    ShowContactView.prototype.show = function(e) {
      this.model = this.collection.get(e.target.getAttribute('data-id'));
      return this.render();
    };
    ShowContactView.prototype["delete"] = function(e) {
      this.model.destroy();
      return app.list();
    };
    ShowContactView.prototype.edit = function(e) {
      return app.edit(this.model);
    };
    return ShowContactView;
  })();
  EditContactView = (function() {
    __extends(EditContactView, Backbone.View);
    function EditContactView() {
      EditContactView.__super__.constructor.apply(this, arguments);
    }
    EditContactView.prototype.el = $('#page');
    EditContactView.prototype.template = _.template($('#edit-template').html());
    EditContactView.prototype.events = {
      'click button.save': 'save',
      'click button.cancel': 'cancel'
    };
    EditContactView.prototype.render = function(model) {
      console.log("edit contact " + this.cid);
      this.model = model;
      return this.el.html(this.template({
        contact: this.model
      }));
    };
    EditContactView.prototype.save = function(e) {
      console.log("save contact " + this.cid);
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
          }
          return app.show(this.model);
        }, this),
        error: __bind(function(model, error) {
          return this.el.find('.error').text(error);
        }, this)
      });
    };
    EditContactView.prototype.cancel = function(e) {
      if (this.model.isNew()) {
        return app.list();
      } else {
        return app.show(this.model);
      }
    };
    return EditContactView;
  })();
  app = new App;
  if (typeof window.console === 'undefined') {
    window.console = {
      log: function() {}
    };
  }
  $(document).ready(function() {
    console.log('start app');
    return app.start();
  });
}).call(this);
