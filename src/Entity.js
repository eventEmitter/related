(function() {
    'use strict';


    let log                     = require('ee-log');
    let type                    = require('ee-types');
    let QueryBuilderGenerator   = require('./QueryBuilderGenerator');
    let ModelInstance           = require('./ModelInstance');
    let ModelProxy              = require('./ModelProxy');



    class Entity {


        /**
         * set up the related orm
         */
        constructor(options) {

            // store db reference and definition
            Object.defineProperty(this, 'database', {value: options.database});
            Object.defineProperty(this, 'definition', {value: options.definition});


            // dynamically create the model && querybuilder
            let Model = this.createModel();
            let QueryBuilder = this.createQueryBuilder();



            // create the constructor that is beeing returneed
            let Constructor = function(...args) {


                // check what has to be returned 
                if (this instanceof Constructor) {

                    if (args.length > 1) throw new Error(`When instantiating the '${this.definition.getAliasName()}' model, an object, a map, a weak map or nothing can passed to the constructor, got too many arguments!`);
                    else {

                        // instantiate model
                        let modelInstance = new Model(args[0]);


                        // called with the new keyword
                        // return a new model instance
                        return new Proxy(modelInstance, ModelProxy);
                    }
                }
                else {


                    // return a query builder instance
                    return new QueryBuilder({
                        args: args
                    });
                }
            };


            return Constructor;
        }







        defineReferenceNam(localColumn, name) {

        }




        defineMappingName(mappingEntity, name) {

        }




        defineReferecedByName(foreignColumn, name) {

        }





        use(UserModel) {
            this.UserModel = UserModel;
        }







        /**
         * builds the querybuilder instance 
         * for this entity
         *
         * @returns {constructor}
         */
        createQueryBuilder() {
            return new QueryBuilderGenerator({
                  database    : this.database
                , definition  : this.definition
            });
        }





        /**
         * builds the model instance 
         * for this entity
         *
         * @returns {constructor}
         */
        createModel() {
            return new ModelInstance({
                  database    : this.database
                , definition  : this.definition
                , UserModel   : this.UserModel
            });
        }
    }

    

    module.exports = Entity;
})();
