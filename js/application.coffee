#
# Routeless Backbone Contacts
#

class App
    contacts: null
    listView: null
    showView: null
    editView: null

    constructor: ->
        @contacts = new ContactCollection
        @listView = new ListContactView {collection: @contacts}
        @showView = new ShowContactView {collection: @contacts}
        @editView = new EditContactView {collection: @contacts}

    start: ->
        @list()

    list: ->
        @listView.render()

    show: (model) ->
        @showView.render model

    edit: (model) ->
        @editView.render model


class Contact extends Backbone.Model
    localStorage: new Store 'contacts'

    getName: -> @get('name')
    getAddress: -> @get('address')
    getPhone: -> @get('phone')
    getMobile: -> @get('mobile')
    getEmail: -> @get('email')

    validate: (attrs) ->
        if not attrs.name then 'Contact name required'


class ContactCollection extends Backbone.Collection
    model: Contact

    localStorage: Contact::localStorage

    comparator: (contact) ->
        contact.getName()

    initialize: ->
        @fetch()


class ListContactView extends Backbone.View
    el: $('#page')

    template: _.template $('#list-template').html()

    events:
        'click button.create': 'create'
        'click button.clear': 'clear'
        'click button.import': 'import'

    render: ->
        console.log "render list #{@cid}"
        @el.html @template({contacts: @collection})

    create: (e) ->
        app.edit new Contact

    clear: (e) ->
        return if not confirm 'About to delete all data.'
        contact.destroy() for contact in @collection.toArray()
        @render()

    import: (e) ->
        # Load canned contacts from data.js
        return if not confirm 'About to import data.'
        @collection.create contact for contact in $IMPORT_DATA
        @render()


class ShowContactView extends Backbone.View
    el: $('#page')

    template: _.template $('#show-template').html()

    events:
        'click button.delete': 'delete'
        'click button.edit': 'edit'
        'click button.list': 'list'
        'click a.show': 'show'

    render: (model=@model) ->
        console.log "render contact #{@cid}"
        @model = model
        @el.html @template({contact: @model})

    list: (e) ->
        app.list()

    show: (e) ->
        # HTML5 DOM dataset property does not work on IE9, Safari or Android.
        #@model = @collection.get e.target.dataset.id
        @model = @collection.get e.target.getAttribute('data-id')
        @render()

    delete: (e) ->
        @model.destroy()
        app.list()

    edit: (e) ->
        app.edit @model


class EditContactView extends Backbone.View
    el: $('#page')

    template: _.template $('#edit-template').html()

    events:
        'click button.save': 'save'
        'click button.cancel': 'cancel'

    render: (model) ->
        console.log "edit contact #{@cid}"
        @model = model
        @el.html @template({contact: @model})

    save: (e) ->
        console.log "save contact #{@cid}"
        @model.save {
            name: @$('[name="name"]').val()
            address: @$('[name="address"]').val()
            phone: @$('[name="phone"]').val()
            mobile: @$('[name="mobile"]').val()
            email: @$('[name="email"]').val()
        },
        {
            success: (model, resp) =>
                @collection.add @model, {at: 0} if not @model.collection
                app.show @model
            error: (model, error) =>
                @el.find('.error').text error
        }

    cancel: (e) ->
        if @model.isNew() then app.list() else app.show @model


app = new App

$(document).ready ->
    console.log 'start app'
    app.start()
