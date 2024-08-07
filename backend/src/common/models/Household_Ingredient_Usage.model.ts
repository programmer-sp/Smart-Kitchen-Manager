import { Schema, model } from 'mongoose';

const householdIngredientUsageSchema: Schema = new Schema(
    {
        usage_id: {
            type: Schema.Types.ObjectId // TODO: check whether it geneates default id or not
        },
        household_id: {
            type: Number,
            require: true
        },
        ingredient_id: {
            type: Number,
            require: true
        },
        used_quantity: {
            type: Number
        },
        unit: {
            type: String
        },
        used_at: {
            type: Date,
        },
    },
    {
        collection: 'household_ingredient_Usage',
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

const householdIngredientUsageModel = model('householdIngredientUsage', householdIngredientUsageSchema);
export default householdIngredientUsageModel;