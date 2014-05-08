!function(){

    var   Class                 = require('ee-class')
        , EventEmitter          = require('ee-event-emitter')
        , argv                  = require('ee-argv')
        , QueryBuilder          = require('./QueryBuilder')
        , Model                 = require('./Model')
        , RelatingSet           = require('./RelatingSet')
        , ModelBuilder          = require('./ModelBuilder')
        , QueryBuilderBuilder   = require('./QueryBuilderBuilder')
        , clone                 = require('clone')
        , log                   = require('ee-log');




    var dev = argv.has('dev-orm');



    // model initializer
    module.exports = new Class({


        init: function(_options){
            var   thisContext = this
                , Constructor;

            this._definition    = _options.definition;
            this._getDatabase   = _options.getDatabase;
            this._orm           = _options.orm;
            this._queryBuilders = _options.queryBuilders;

            // sotrage for relations
            this._mappingMap        = {};
            this._belongsToMap      = {};
            this._referenceMap      = {};
            this._columns           = {};
            this._genericAccessors  = {};


            // create Model Class
            this.createModel(Model);

            // create the querybuilder for this entity
            this.createQueryBuilder();


            // constructor to expose
            Constructor = function(options, relatingSets) {

                if (this instanceof Constructor) {

                    // new model instance
                    var instance = new thisContext.Model({
                          parameters        : options
                        , orm               : thisContext._orm
                        , definition        : thisContext._definition
                        , isFromDB          : options && options._isFromDB
                        , relatingSets      : relatingSets
                        , getDatabase       : thisContext._getDatabase
                    });

                    return instance;
                }
                else {
                    // return a querybuilder
                    var qb = new thisContext.QueryBuilder({
                        parameters: Array.prototype.slice.call(arguments)
                    });

                    return qb;
                }
            };


            // the model definition must be accesible publicly
            Constructor.definition = _options.definition;

            // expose if its a mapping table
            if (this._definition.isMapping) Constructor.isMapping = true;

            // let the user define accessornames
            Constructor.setMappingAccessorName = this.setMappingAccessorName.bind(this);
            Constructor.setReferenceAccessorName = this.setReferenceAccessorName.bind(this);

            Constructor.getDefinition = this.getDefinition.bind(this);

            return Constructor;
        }


        , getDefinition: function() {
            return this._definition;
        }


        , createQueryBuilder: function() {
            this.QueryBuilder = new QueryBuilderBuilder({
                  orm               : this._orm
                , queryBuilders     : this._queryBuilders
                , definition        : this._definition
                , getDatabase       : this._getDatabase
                , mappingMap        : this._mappingMap
                , belongsToMap      : this._belongsToMap
                , referenceMap      : this._referenceMap
                , columns           : this._columns
            });

            // store our instance of the querybuilders
            this._queryBuilders[this._definition.getTableName()] = this.QueryBuilder;
        }


        , createModel: function(Model) {
             this.Model = new ModelBuilder({
                  baseModel         : Model
                , definition        : this._definition
                , getDatabase       : this._getDatabase
                , mappingMap        : this._mappingMap
                , belongsToMap      : this._belongsToMap
                , referenceMap      : this._referenceMap
                , genericAccessors  : this._genericAccessors
                , columns           : this._columns
                , orm               : this._orm
            });
        }


        , setMappingAccessorName: function(mappingName, name) {
            if (!this.Model[name]) {
                if (!this._mappingMap[mappingName]) throw new Error('The mapping «'+mappingName+'» does not exists on the «'+this._definition.name+'» model!');

                this._mappingMap[mappingName].definition.aliasName = name;
                this._mappingMap[mappingName].definition.useGenericAccessor = false;

                this.createModel(Model);             
            }
            else throw new Error('The mapping accessor «'+name+'» on the model «'+this._model.name+'» is already in use!');
        }

        , setReferenceAccessorName: function(referenceName, name) {
            if (!this.Model[name]) {
                if (!this._referenceMap[referenceName]) throw new Error('The reference «'+referenceName+'» does not exists on the «'+this._definition.name+'» model!');

                this._referenceMap[referenceName].aliasName = name;
                this._referenceMap[referenceName].useGenericAccessor = false;

                this._genericAccessors[referenceName]

                this.createModel(Model);                     
            }
            else throw new Error('The reference accessor «'+name+'» on the model «'+this._model.name+'» is already in use!');
        }
    });
}();