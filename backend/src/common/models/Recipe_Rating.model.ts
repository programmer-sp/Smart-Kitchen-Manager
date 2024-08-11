import { Schema, model } from 'mongoose';

const recipeRatingSchema: Schema = new Schema(
    {
        rating_id: {
            type: Number,
            require: true
        },
        user_id: {
            type: Number,
            require: true
        },
        recipe_id: {
            type: Number,
            require: true
        },
        rating: {
            type: Number,
            require: true
        },
        review: {
            type: String
        },
    },
    {
        collection: 'recipe_ratings',
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

const recipeRatingModel = model('recipeRating', recipeRatingSchema);
export default recipeRatingModel;