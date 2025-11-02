import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createServicesSchema } from "../../schemas/createServicesSchema.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createService } from "../../services/serviceApi.js";
import { CheckCircle, XCircle } from "lucide-react";

const categories = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Mechanic",
  "Grocery",
  "Painter",
  "Cleaning"
];

const CreateService = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createServicesSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price: 0,
      location: "",
      image: null,
    },
  });

  const selectedImage = watch("image");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setValue("image", file, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("price", data.price);
      formData.append("location", data.location);
      // Fix: Remove [0] since data.image is already a File object
      formData.append("image", data.image);

      await createService(formData);
      toast.success("Service created successfully");
      navigate("/provider/dashboard");
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to create service";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-md shadow-md">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          Create New Service
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block font-medium mb-1">Title</label>
            <input
              type="text"
              {...register("title")}
              className="w-full border px-4 py-2 rounded"
            />
            {errors.title && (
              <p className="text-red-500">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              {...register("description")}
              rows="4"
              className="w-full border px-4 py-2 rounded"
            />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </div>
          <div>
            <label className="block font-medium mb-1">Category</label>
            <select
              {...register("category")}
              className="w-full border px-4 py-2 rounded"
            >
              <option value="">Select a category</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500">{errors.category.message}</p>
            )}
          </div>
          <div>
            <label className="block font-medium mb-1">Price (₹)</label>
            <input
              type="number"
              {...register("price", { valueAsNumber: true })}
              className="w-full border px-4 py-2 rounded"
            />
            {errors.price && (
              <p className="text-red-500">{errors.price.message}</p>
            )}
          </div>
          <div>
            <label className="block font-medium mb-1">Location</label>
            <input
              type="text"
              {...register("location")}
              className="w-full border px-4 py-2 rounded"
            />
            {errors.location && (
              <p className="text-red-500">{errors.location.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="image" className="block font-medium mb-1">
              Upload Image
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              className="w-full border px-4 py-2 rounded"
              onChange={handleImageChange}
            />
            {selectedImage && !errors.image && (
              <div className="flex items-center gap-2 mt-1 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>{selectedImage.name}</span>
              </div>
            )}

            {errors.image && (
              <div className="flex items-center gap-2 mt-1 text-red-600">
                <XCircle className="w-5 h-5" />
                <span>{errors.image.message}</span>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {isSubmitting ? "Creating..." : "Create Service"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateService;