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
            default: false,
            require: true
        },
        expiration_date: {
            type: Date
        },
        ingredients: {
            type: [JSON]
        },
        steps: {
            type: [String]
        },
        images: {
            type: [String]
        },
        video_url: {
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