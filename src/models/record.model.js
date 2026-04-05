import mongoose, { mongo } from "mongoose";
import { ALL_CATEGORIES } from "../constants/categories.js";

const financialRecordSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        min: [1, 'Amount must be greater than 0']
    },
    type: {
        type: String,
        enum: ['INCOME','EXPENSE'],
        required: true,
        index: true,
    },
    category: {
        type: String,
        enum: ALL_CATEGORIES,
        required: true,
        index: true,
    },
    date: {
        type: Date,
        required: true,
        index: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true,
    }
}, {timestamps: true})

// Compound index for common query patterns
// date range + type queries hit this index
financialRecordSchema.index({ date: -1, type: 1 })

// category + type queries hit this
financialRecordSchema.index({ category: 1, type: 1 })

// Automatically exclude soft deleted records from all queries
financialRecordSchema.pre(/^find/, function() {
  this.where({ isDeleted: false })
})

// Convert amount from paise to rupees/dollars before sending to client
financialRecordSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.amount = ret.amount / 100
    delete ret.__v
    return ret
  }
})

export const FinancialRecord = mongoose.model('FinancialRecord', financialRecordSchema)