/*global Bloodhound:false */

(function(root, undefined) {
  "use strict";
  Ember.TypeAheadComponent = Ember.TextField.extend({

    didInsertElement: function() {
      this._super();
      var _this = this;

      if(!this.get("local") && !this.get('prefetch') && !this.get('remote') && !this.get('source')){
        throw "No data source set";
      }

      // Resolves futures where necessary.
      if (this.get("local") && jQuery.isFunction(this.get("local").then)){
        this.get("local").then(function(local) {
          _this.local = local;
          _this.initializeTypeahead();
        });
      } else {
        this.initializeTypeahead();
      }

      //Set Classes on the wrapping input element
      if (this.get("typeaheadClassNames")){
        this.$().parent().addClass(this.get("typeaheadClassNames"));
      }

      //Set Classes on the input element
      if (this.get("inputClassNames")){
        this.$().addClass(this.get("inputClassNames"));
      }

      //Set Classes on the hint input element
      if (this.get("hintClassNames")){
        this.$().parent().find('.tt-hint').addClass(this.get("hintClassNames"));
      }

      //Set Placeholder on the input element
      if (this.get("placeholder")){
        this.$().attr("placeholder", this.get("placeholder"));
      }
    },

    initializeTypeahead: function(){
      var _this = this;

      var source = null;

      if(this.get('source')){
         source = this.get('source');
      } else {
        var dataSuggester = new Bloodhound({
          datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
          queryTokenizer: Bloodhound.tokenizers.whitespace,
          local: this.get("local") || null,
          prefetch: this.get("prefetch") || null,
          remote: this.get("remote") || null
        });

        dataSuggester.initialize();
        source = dataSuggester.ttAdapter();
      }

      this.typeahead = this.$().typeahead({
        hint: this.get("hint") || true,
        highlight: this.get("highlight") || true,
        minLength: this.get("minLength") || 1
      },
      {
        name: this.get("name") || 'typeahead',
        displayKey: this.get("displayKey") || 'value',
        source: source,
        templates: this.get("templates") || {},
      });

      this.typeahead.on("typeahead:selected", function(event, item) {
        _this.set("selection", Ember.Object.create(item));
      });

      this.typeahead.on("typeahead:autocompleted", function(event, item) {
        _this.set("selection", Ember.Object.create(item));
      });

      if (this.get("selection")) {
        var name = this.get("displayKey");
        this.typeahead.val(this.get("selection."+name));
      }
    },

    selectionObserver: function() {
      if (Ember.isEmpty(this.get('selection')) === true) {
        return this.typeahead.val('');
      }

      return this.typeahead.val(this.get("selection").get(this.get("displayKey")));
    }.observes("selection")

  });
  Ember.Handlebars.helper('type-ahead', Ember.TypeAheadComponent);
}(this));
