import { Schema, model } from 'mongoose';
import config from "../config";

export const getBucketURL = (value: any) => {
    return value && value !== '' ? `${config.S3_BUCKET_URL}${value}` : '';
};

const ingredientSchema: Schema = new Schema(
    {
        ingredient_id: {
            type: Number,
            require: true
        },
        name: {
            type: String,
            require: true
        },
        category: {
            type: String,
            require: true
        },
        unit: {
            type: String
        },
        value: {
            type: Number
        },
        image_url: {
            type: String,
            get: getBucketURL,
        },
        nutritional_info: {
            type: JSON
        }
    },
    {
        collection: 'ingredients',
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

const ingredientModel = model('ingredients', ingredientSchema);
export default ingredientModel;