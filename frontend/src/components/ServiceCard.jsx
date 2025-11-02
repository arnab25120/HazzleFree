import { Link } from "react-router-dom"; 
import useAuthStore from "../store/useAuthStore.js";

const ServiceCard = ({ service, onEdit, onDelete }) => {
  const { user } = useAuthStore();

  const isProvider = user?.role === "provider" && !user?.isAdmin;
  const isAdmin = user?.isAdmin;

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Image Container with enhanced styling */}
      <div className="relative overflow-hidden rounded-t-2xl">
        <img
          src={service?.imageUrl}
          alt={service.title}
          className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Image overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Approval Status Badge */}
        <div className="absolute top-4 right-4">
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border ${
            service.isApproved 
              ? "bg-green-500/90 text-white border-green-400/50 shadow-lg shadow-green-500/25" 
              : "bg-yellow-500/90 text-white border-yellow-400/50 shadow-lg shadow-yellow-500/25"
          }`}>
            {service.isApproved ? "✓ Approved" : "⏳ Pending"}
          </div>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/50">
            <div className="text-sm font-medium text-gray-600">Priced at</div>
            <div className="text-xl font-bold text-gray-900">₹{service.price}</div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative p-6 space-y-4">
        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300 line-clamp-2">
          {service.title}
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {service.description.slice(0, 100)}...
        </p>

        {/* Service Details */}
        <div className="space-y-3">
          {/* Category */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">CATEGORY</div>
              <div className="text-sm font-semibold text-gray-900">{service.category}</div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">LOCATION</div>
              <div className="text-sm font-semibold text-gray-900">{service.location}</div>
            </div>
          </div>
        </div>

        {/* View Details Button */}
        <div className="pt-4">
          <Link
            to={`/services/${service._id}`}
            className="group/btn relative block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold text-center shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              View Details
              <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
          </Link>
        </div>

        {/* Provider Status */}
        {isProvider && (
          <div className={`relative overflow-hidden rounded-xl p-3 text-center font-semibold text-sm ${
            service.isActive
              ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200"
              : "bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-800 border border-yellow-200"
          }`}>
            <div className="relative z-10 flex items-center justify-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                service.isActive ? "bg-green-500 animate-pulse" : "bg-yellow-500"
              }`}></div>
              {service.isActive ? "Active Service" : "Inactive Service"}
            </div>
          </div>
        )}

        {/* Provider Action Buttons - Only show if both onEdit and onDelete props are provided */}
        {isProvider && service.isActive && onEdit && onDelete && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onEdit(service._id)}
              className="group/edit flex-1 relative bg-gradient-to-r from-yellow-500 to-amber-500 text-white py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:from-yellow-600 hover:to-amber-600 transform hover:scale-[1.02] overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </span>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover/edit:translate-x-full transition-transform duration-500"></div>
            </button>
            
            <button
              onClick={() => onDelete(service._id)}
              className="group/delete flex-1 relative bg-gradient-to-r from-red-500 to-rose-500 text-white py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:from-red-600 hover:to-rose-600 transform hover:scale-[1.02] overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </span>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover/delete:translate-x-full transition-transform duration-500"></div>
            </button>
          </div>
        )}
      </div>

      {/* Decorative corner element */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
};

export default ServiceCard;