import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "Plumber",
          "Electrician",
          "Mechanic",
          "Tutor",
          "Babysitter",
          "Cleaning",
          "Carpenter",
          "Other",
        ],
        message: "{VALUE} is not a valid category",
      },
    },
    location: {
      type: String,
      required: [true, "Service location is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Service price is required"],
      min: [0, "Price must be a positive number"],
    },
    imageUrl: {
      type: String,
      default: "",
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Provider is required"],
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
serviceSchema.index({ category: 1, location: 1, isApproved: 1, isActive: 1 });
serviceSchema.index({ provider: 1, isActive: 1 });
serviceSchema.index({ createdAt: -1 });

// Virtual for formatted price
serviceSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price.toFixed(2)}`;
});

// Static method to get valid categories
serviceSchema.statics.getValidCategories = function() {
  return this.schema.path('category').enumValues;
};

export const Service = mongoose.model("Service", serviceSchema);