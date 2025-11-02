import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getServiceById } from "../../services/serviceApi.js";
import { toast } from "react-toastify";
import useAuthStore from "../../store/useAuthStore.js";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await getServiceById(id);
        const serviceData = res?.data?.data?.service;
        setService(serviceData);
      } catch (err) {
        console.error("Error fetching service:", err);
        toast.error("Failed to load service details");
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  const handleShowContact = () => {
    if (!user) {
      toast.info("Please login to view contact details");
      navigate("/login");
      return;
    }
    setShowContact(true);
    toast.success("Contact details revealed!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl text-gray-400 mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Service Not Found</h2>
          <p className="text-gray-600 mb-6">
            The service you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/services")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  const {
    title = "Untitled Service",
    description = "No description available",
    price = 0,
    category = "Other",
    location = "Not specified",
    imageUrl = "https://via.placeholder.com/800x400?text=No+Image+Available",
    _id: serviceId,
    createdAt,
    provider: {
      contactNumber: providerContact = "No contact number",
      name: providerName = "Unknown Provider",
      email: providerEmail = "No email provided"
    } = {}
  } = service || {};

  const isOwnService = user?._id === service?.provider?._id;
  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString() : "N/A";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/services")}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-700 transition-colors"
        >
          <span className="mr-2">←</span> Back to Services
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Service Image */}
          <div className="w-full h-96 overflow-hidden bg-gray-200">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/800x400?text=No+Image+Available";
              }}
            />
          </div>

          <div className="p-8">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {category}
                  </span>
                  <span className="flex items-center">
                    📍 {location}
                  </span>
                  <span>Posted on {formattedDate}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">₹{price}</p>
                <p className="text-sm text-gray-500">per service</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>
            </div>

            {/* Provider Information */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Provider Information</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="w-32 text-gray-600 font-medium">Name:</span>
                  <span className="text-gray-900">{providerName}</span>
                </div>

                {/* Contact Details - Show only if user is logged in and has clicked show contact */}
                {(showContact || isOwnService) ? (
                  <>
                    <div className="flex items-center">
                      <span className="w-32 text-gray-600 font-medium">Email:</span>
                      <a 
                        href={`mailto:${providerEmail}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {providerEmail}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <span className="w-32 text-gray-600 font-medium">Contact:</span>
                      <a 
                        href={`tel:${providerContact}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {providerContact}
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-3">
                      Contact details are hidden. Click below to reveal.
                    </p>
                    <button
                      onClick={handleShowContact}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Show Contact Details
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Own Service Message */}
            {isOwnService && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-blue-700 font-medium">This is your service listing</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;