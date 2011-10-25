#
# Routeless Backbone Contacts
#
'use strict'

class App
    constructor: ->
        @_contacts = new ContactCollection
        @_ribbonView = new RibbonView {collection: @_contacts}
        @_statusView = new StatusView {collection: @_contacts}
        @_listView = new ListView {collection: @_contacts}
        @_detailView = new DetailView {collection: @_contacts}

    start: ->
        @_ribbonView.render()
        @_statusView.render()
        @_listView.render()
        @_contacts.cursor.set()


class BaseModel extends Backbone.Model
    # Create model attribute getter/setter property.
    @attribute = (attr) ->
        Object.defineProperty @prototype, attr,
            get: -> @get attr
            set: (value) ->
                attrs = {}
                attrs[attr] = value
                @set attrs


class Contact extends BaseModel
    @attribute 'name'
    @attribute 'address'
    @attribute 'phone'
    @attribute 'mobile'
    @attribute 'email'
    localStorage: new Store 'contacts'

    validate: (attrs) ->
        if not attrs.name then 'Contact name required'


class ContactCollection extends Backbone.Collection
    model: Contact
    localStorage: Contact::localStorage

    comparator: (contact) ->
        contact.name

    initialize: ->
        @fetch()
        @cursor = new Cursor @
        @filter = new Filter @


# Filters a contacts collection by name.
class Filter
    constructor: (collection) ->
        @_query = ''
        @_collection = collection

    set: (query) ->
        return if query == @_query
        @_query = query
        @_collection.trigger 'filter'

    selection: ->
        @_collection.select (contact) =>
            contact.name.match RegExp(@_query or '.*', 'i')


# A Cursor object represents the currently selected model in a collection.
class Cursor
    constructor: (collection) ->
        @_collection = collection
        @_collection.bind 'remove', => @set()
        @_collection.bind 'reset', => @set()
        @_collection.bind 'filter', => @set()

    get: -> @_model

    set: (model=null) ->
        # Select first filtered model if 'model' is null.
        @return if model == @_model
        @_model = model or @_collection.filter.selection()[0] or null
        @_collection.trigger 'select'


class RibbonView extends Backbone.View
    el: $('#ribbon')

    template: _.template $('#ribbon-template').html()

    events:
        'click button.create': 'create'
        'click button.clear': 'clear'
        'click button.import': 'import'
        'keyup input.search': 'search'
        'change input.search': 'search' # So Selenium test works.

    render: ->
        console.log "render ribbon #{@cid}"
        @el.html @template()

    create: (e) ->
        @collection.cursor.set new Contact

    clear: (e) ->
        return if not confirm 'About to delete all data.'
        contact.destroy {silent: true} for contact in @collection.toArray()
        @collection.reset()

    import: (e) ->
        # Load canned contacts from data.js
        return if not confirm 'About to import data.'
        @collection.create contact, {silent: true} for contact in $IMPORT_DATA
        @collection.trigger 'reset', @collection

    search: (e) ->
        @collection.filter.set $(e.target).val()


class StatusView extends Backbone.View
    el: $('#status')

    template: _.template $('#status-template').html()

    initialize: ->
        @collection.bind 'add', @render
        @collection.bind 'remove', @render
        @collection.bind 'reset', @render
        @collection.bind 'filter', @render
        @collection.bind 'change', @render

    render: =>
        console.log "render status #{@cid}"
        @el.html @template {contacts: @collection.filter.selection()}


class ListView extends Backbone.View
    el: $('#list')

    events:
        'click li': 'select'

    template: _.template $('#list-template').html()

    initialize: ->
        @collection.bind 'add', @render
        @collection.bind 'remove', @render
        @collection.bind 'reset', @render
        @collection.bind 'filter', @render
        @collection.bind 'change', @render
        @collection.bind 'select', @renderCursor

    render: =>
        console.log "render list #{@cid}"
        @el.html @template {contacts: @collection.filter.selection()}
        @renderCursor()

    renderCursor: =>
        console.log "render cursor #{@cid}"
        @$('li.cursor').removeClass 'cursor'
        li = @$( "[data-id=#{@collection.cursor.get()?.id}]")
        li.addClass 'cursor'

    select: (e) ->
        model = @collection.get e.target.getAttribute('data-id')
        @collection.cursor.set model


class DetailView extends Backbone.View
    el: $('#detail')

    template: _.template $('#detail-template').html()

    events:
        'click button.save': 'save'
        'click button.delete': 'delete'

    initialize: ->
        @collection.bind 'select', @render

    render: =>
        console.log "render detail #{@cid}"
        @model = @collection.cursor.get()
        @el.html if @model is null then '' else @template({contact: @model})

    save: (e) ->
        console.log "save detail #{@cid}"
        @model.save {
            name: @$('[name="name"]').val()
            address: @$('[name="address"]').val()
            phone: @$('[name="phone"]').val()
            mobile: @$('[name="mobile"]').val()
            email: @$('[name="email"]').val()
        },
        {
            success: (model, resp) =>
                if not @model.collection
                    @collection.add @model, {at: 0}
                    @collection.cursor.set @model
            error: (model, error) =>
                @$('.error').text error
        }

    delete: (e) ->
        console.log "destroy contact #{@cid}"
        @model.destroy()


app = new App

# Dummy console.log for Internet Explorer.
if window.console is undefined then window.console = log: ->

$(document).ready ->
    console.log 'start app'
    app.start()
