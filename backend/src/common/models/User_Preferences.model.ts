import { Schema, model } from 'mongoose';

const userPreferencesSchema: Schema = new Schema(
    {
        user_id: {
            type: Number,
            require: true
        },
        dietary_restrictions: {
            type: [String]
        },
        preferred_cuisines: {
            type: [String]
        },
    },
    {
        collection: 'user_preferences',
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

const userPreferencesModel = model('userPreferences', userPreferencesSchema);
export default userPreferencesModel;