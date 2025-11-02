import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyServices, deleteService} from "../../services/serviceApi.js";

import ServiceCard from "../../components/ServiceCard.jsx";
import { toast } from "react-toastify";

const ProviderDashboard = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const navigate = useNavigate();

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await getMyServices();
      
      // Add debugging logs
      console.log('API Response:', res);
      console.log('Response data:', res.data);
      console.log('Services data:', res.data?.data);
      
      // Extract services and pagination from the correct path
      const servicesData = res?.data?.data?.services;
      const paginationData = res?.data?.data?.pagination;
      
      // Ensure we always set an array
      if (Array.isArray(servicesData)) {
        setServices(servicesData);
        setPagination(paginationData);
      } else {
        console.warn('Unexpected API response format:', res);
        console.warn('Expected services array at res.data.services, got:', servicesData);
        setServices([]);
        setPagination(null);
        setError('Unexpected data format received from server');
      }
      
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to fetch your services');
      toast.error("Failed to fetch your services.");
      setServices([]); // Ensure services is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/provider/edit/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service?"
    );
    if (!confirmDelete) return;
    
    try {
      await deleteService(id);
      toast.success("Service deleted successfully");
      
      // Extra safety check before filtering
      setServices((prev) => {
        if (Array.isArray(prev)) {
          return prev.filter((service) => service._id !== id);
        }
        console.warn('Services state is not an array during delete:', prev);
        return [];
      });
    } catch (err) {
      console.error('Error deleting service:', err);
      toast.error("Failed to delete the service");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Add safety check before rendering
  const safeServices = Array.isArray(services) ? services : [];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
        Provider Dashboard
      </h1>
      
      {error && (
        <div className="text-center text-red-600 mb-4 p-4 bg-red-50 rounded-md">
          {error}
          <button 
            onClick={fetchServices}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}
      
      {loading ? (
        <p className="text-center text-gray-500">Loading your services...</p>
      ) : safeServices.length === 0 ? (
        <div className="text-center text-gray-600 mt-10 text-lg font-medium">
          You have not created any services yet
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeServices.map((service) => (
            <ServiceCard
              key={service._id}
              service={service}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;