import { Schema, model } from 'mongoose';

const userRatingSchema: Schema = new Schema(
    {
        userId: {
            type: String,
            default: ""
        },
        recipeId: {
            type: Schema.Types.ObjectId,
            ref: 'recipes',
            require: true
        },
        ratings: {
            type: Number,
            default: 0
        },
    },
    {
        collection: 'userRating',
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

const userRatingModel = model('userRating', userRatingSchema);
export default userRatingModel;