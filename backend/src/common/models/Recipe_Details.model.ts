import { Schema, model } from 'mongoose';

const recipeSchema: Schema = new Schema(
    {
        recipe_id: {
            type: Number,
            require: true
        },
        recipe_name: {
            type: String,
            require: true
        },
        cuisine: {
            type: String,
            require: true
        },
        preparation_time: {
            type: Number,
            require: true
        },
        system_rating: {
            type: Number,
            require: true
        },
        is_rated: {
            type: Boolean,
            default: false
        },
        expiration_date: {
            type: Date
        },
        ingredients: {      // { ingredient_id: 1, ingredient_name: abc, category_id: 1}
            type: [JSON]
        },
        steps: {            // Description of cooking food
            type: [String]
        },
        images: {           // images of cooked food and other images like ingredients
            type: [String]
        },
        video_url: {        // video url of cooked food or how to cook food (can be youtube video)
            type: String
        },
        ratings: {
            type: [JSON]
        }
    },
    {
        collection: 'recipes',
        versionKey: false,
        timestamps: true,
        toObject: {
            virtuals: true,
            getters: true,
        },
        toJSON: {
            virtuals: true,
            getters: true,
        },
    },
);

const recipeModel = model('recipes', recipeSchema);
export default recipeModel;