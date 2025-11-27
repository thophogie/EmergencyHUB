import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Plus,
  Camera,
  Video,
  Users,
  Car,
  Home,
  TreePine,
  Heart,
  Flame,
  Waves,
  AlertTriangle,
  User,
  Phone,
  Mail,
  Building,
  Route,
  CloudRain,
  Wind,
  Zap,
  Anchor,
  Plane,
  Train,
  Bus,
  Bike,
  Truck,
  Cross,
  Shield,
  Siren,
  Ship,
  Fuel,
  Factory,
  School,
  Hospital,
  Store,
  Warehouse,
  Tent,
  Mountain,
  Sun,
  Moon,
  Cloud,
  Eye,
  EyeOff,
  Locate,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

const INCIDENT_TYPES = [
  { id: "fire", label: "Fire", icon: Flame, color: "text-red-500" },
  { id: "flood", label: "Flood", icon: Waves, color: "text-blue-500" },
  { id: "landslide", label: "Landslide", icon: TreePine, color: "text-amber-600" },
  { id: "vehicular-accident", label: "Vehicular Accident", icon: Car, color: "text-gray-600" },
  { id: "medical-emergency", label: "Medical Emergency", icon: Heart, color: "text-red-600" },
  { id: "earthquake", label: "Earthquake", icon: AlertTriangle, color: "text-amber-500" },
  { id: "storm", label: "Severe Weather", icon: CloudRain, color: "text-blue-400" },
  { id: "explosion", label: "Explosion", icon: Zap, color: "text-yellow-500" },
  { id: "structural-collapse", label: "Building Collapse", icon: Building, color: "text-gray-700" },
  { id: "hazardous-material", label: "Chemical Spill", icon: Factory, color: "text-purple-500" },
  { id: "power-outage", label: "Power Outage", icon: Zap, color: "text-yellow-400" },
  { id: "water-outage", label: "Water Supply Issue", icon: Waves, color: "text-cyan-500" },
];

const VEHICLE_TYPES = [
  { id: "car", label: "Car", icon: Car },
  { id: "motorcycle", label: "Motorcycle", icon: Bike },
  { id: "truck", label: "Truck", icon: Truck },
  { id: "bus", label: "Bus", icon: Bus },
  { id: "ambulance", label: "Ambulance", icon: Cross },
  { id: "police", label: "Police Vehicle", icon: Shield },
  { id: "fire-truck", label: "Fire Truck", icon: Siren },
  { id: "train", label: "Train", icon: Train },
  { id: "plane", label: "Airplane", icon: Plane },
  { id: "ship", label: "Ship", icon: Ship },
];

const LOCATION_TYPES = [
  { id: "residential", label: "Residential Area", icon: Home },
  { id: "commercial", label: "Commercial Area", icon: Store },
  { id: "industrial", label: "Industrial Zone", icon: Factory },
  { id: "road", label: "Road/Way", icon: Route },
  { id: "school", label: "School/Campus", icon: School },
  { id: "hospital", label: "Hospital/Medical Facility", icon: Hospital },
  { id: "public", label: "Public Space", icon: Users },
  { id: "transport", label: "Transport Hub", icon: Train },
  { id: "utility", label: "Utility Infrastructure", icon: Fuel },
  { id: "wilderness", label: "Wilderness/Nature", icon: TreePine },
];

const SEVERITY_LEVELS = [
  { id: "low", label: "Low Impact", color: "bg-green-500" },
  { id: "medium", label: "Medium Impact", color: "bg-yellow-500" },
  { id: "high", label: "High Impact", color: "bg-orange-500" },
  { id: "critical", label: "Critical", color: "bg-red-500" },
];

const WEATHER_CONDITIONS = [
  { id: "clear", label: "Clear", icon: Sun },
  { id: "cloudy", label: "Cloudy", icon: Cloud },
  { id: "rainy", label: "Rainy", icon: CloudRain },
  { id: "stormy", label: "Stormy", icon: Wind },
  { id: "snowy", label: "Snowy", icon: Mountain },
  { id: "foggy", label: "Foggy", icon: EyeOff },
];

export default function ReportIncident() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [numberOfPeople, setNumberOfPeople] = useState("");
  const [contactInfo, setContactInfo] = useState({ 
    name: "", 
    phone: "", 
    email: "",
    address: ""
  });
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [incidentDetails, setIncidentDetails] = useState({
    vehicleType: "",
    locationType: "",
    weatherCondition: "",
    estimatedDamage: "",
    injuries: "",
    fatalities: "",
    responseAgencies: [],
    specialNotes: ""
  });
  const [showSensitiveFields, setShowSensitiveFields] = useState(false);
  const [locationData, setLocationData] = useState({
    latitude: null,
    longitude: null,
    address: "Getting current location...",
    error: null
  });
  const [isLocating, setIsLocating] = useState(false);

  const submitIncident = useMutation({
    mutationFn: async (data) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Report Submitted Successfully",
        description: "Your incident report has been received by the MDRRMO.",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Could not submit your report. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setIsLocating(true);
    setLocationData(prev => ({ ...prev, address: "Getting current location...", error: null }));

    if (!navigator.geolocation) {
      setLocationData(prev => ({ 
        ...prev, 
        error: "Geolocation is not supported by your browser",
        address: "Location not available"
      }));
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationData({
          latitude,
          longitude,
          address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
          error: null
        });

        // Reverse geocode to get address (in real app, you'd use a service like Google Maps API)
        reverseGeocode(latitude, longitude);
        setIsLocating(false);
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "The request to get user location timed out.";
            break;
          default:
            errorMessage = "An unknown error occurred.";
            break;
        }
        setLocationData(prev => ({ 
          ...prev, 
          error: errorMessage,
          address: "Location not available"
        }));
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const reverseGeocode = (latitude, longitude) => {
    // In a real application, you would use a reverse geocoding service
    // For demo purposes, we'll just show coordinates
    // Example of what you might do with a real API:
    /*
    fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`)
      .then(response => response.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          const address = data.results[0].formatted;
          setLocationData(prev => ({ ...prev, address }));
        }
      })
      .catch(() => {
        // Fallback to coordinates if geocoding fails
        setLocationData(prev => ({ 
          ...prev, 
          address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
        }));
      });
    */

    // For demo, we'll just update with a more readable format
    setLocationData(prev => ({ 
      ...prev, 
      address: `Nearby: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedType || !description) {
      toast({
        title: "Missing Information",
        description: "Please select incident type and provide a description.",
        variant: "destructive",
      });
      return;
    }

    submitIncident.mutate({
      type: selectedType,
      severity,
      description,
      location: locationData,
      isAnonymous,
      numberOfPeople,
      contactInfo,
      incidentDetails,
      media: { photos: photos.length, videos: videos.length }
    });
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const handleVideoUpload = (e) => {
    if (e.target.files) {
      const newVideos = Array.from(e.target.files);
      setVideos(prev => [...prev, ...newVideos]);
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const getTypeIcon = (typeId) => {
    const type = INCIDENT_TYPES.find(t => t.id === typeId);
    return type ? type.icon : AlertTriangle;
  };

  const getVehicleIcon = (vehicleId) => {
    const vehicle = VEHICLE_TYPES.find(v => v.id === vehicleId);
    return vehicle ? vehicle.icon : Car;
  };

  const getLocationIcon = (locationId) => {
    const location = LOCATION_TYPES.find(l => l.id === locationId);
    return location ? location.icon : MapPin;
  };

  const getWeatherIcon = (weatherId) => {
    const weather = WEATHER_CONDITIONS.find(w => w.id === weatherId);
    return weather ? weather.icon : Sun;
  };

  return (
    <div className="min-h-screen bg-blue-950 flex flex-col max-w-md mx-auto shadow-2xl relative">
      <header className="bg-blue-950 text-white p-4 sticky top-0 z-20 shadow-md flex items-center gap-3 border-b-2 border-yellow-500">
        <motion.button 
          onClick={() => setLocation("/")}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={24} />
        </motion.button>
        <h1 className="font-display font-bold text-xl tracking-wide uppercase">Report an Incident</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Incident Type Selection */}
          <section className="space-y-3">
            <Label className="text-yellow-500 font-bold text-sm uppercase tracking-wider">Incident Type *</Label>
            <div className="grid grid-cols-2 gap-3">
              {INCIDENT_TYPES.map((type) => {
                const IconComponent = type.icon;
                return (
                  <motion.button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      selectedType === type.id
                        ? 'border-yellow-500 bg-yellow-500/20'
                        : 'border-white/20 bg-blue-900 hover:bg-blue-800'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <IconComponent size={24} className={selectedType === type.id ? type.color : 'text-white'} />
                    <span className={`text-xs font-medium ${selectedType === type.id ? 'text-yellow-500' : 'text-white'}`}>
                      {type.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Severity Level */}
          <AnimatePresence>
            {selectedType && (
              <motion.section 
                className="space-y-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Label className="text-yellow-500 font-bold text-sm uppercase tracking-wider">Severity Level</Label>
                <div className="flex gap-2">
                  {SEVERITY_LEVELS.map((level) => (
                    <motion.button
                      key={level.id}
                      type="button"
                      onClick={() => setSeverity(level.id)}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all text-xs font-medium ${
                        severity === level.id
                          ? 'border-yellow-500 bg-yellow-500/20 text-yellow-500'
                          : 'border-white/20 bg-blue-900 text-white hover:bg-blue-800'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${level.color}`}></div>
                      {level.label}
                    </motion.button>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Time of Incident */}
          <section className="space-y-3">
            <Label className="text-yellow-500 font-bold text-sm uppercase tracking-wider">Time of Incident</Label>
            <div className="flex gap-3">
              <div className="flex-1 bg-blue-900 border border-white/20 rounded-lg p-3 flex items-center gap-2 text-white">
                <Calendar size={18} className="text-yellow-500" />
                <span className="text-sm font-medium">{format(new Date(), "MMM dd, yyyy")}</span>
              </div>
              <div className="flex-1 bg-blue-900 border border-white/20 rounded-lg p-3 flex items-center gap-2 text-white">
                <Clock size={18} className="text-yellow-500" />
                <span className="text-sm font-medium">{format(new Date(), "hh:mm a")}</span>
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="space-y-3">
            <Label className="text-yellow-500 font-bold text-sm uppercase tracking-wider">Location</Label>
            <div className="bg-blue-900 border border-white/20 rounded-xl overflow-hidden">
              <div className="h-32 bg-blue-800 relative w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-800 opacity-70"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    className="bg-yellow-500 text-blue-950 p-2 rounded-full shadow-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <MapPin size={24} fill="currentColor" />
                  </motion.div>
                </div>
              </div>
              <div className="p-3 bg-blue-900">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <MapPin size={16} />
                    <span className="text-sm font-bold">Current Location</span>
                  </div>
                  <motion.button 
                    type="button" 
                    onClick={getCurrentLocation}
                    className="text-xs font-bold text-yellow-500 underline flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isLocating}
                  >
                    {isLocating ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" />
                        Locating...
                      </>
                    ) : (
                      <>
                        <Locate size={12} />
                        Refresh
                      </>
                    )}
                  </motion.button>
                </div>
                <div className="text-white text-sm p-2 bg-blue-800/50 rounded-lg border border-white/10">
                  {locationData.error ? (
                    <span className="text-red-300">{locationData.error}</span>
                  ) : (
                    <span>{locationData.address}</span>
                  )}
                </div>
                {locationData.latitude && locationData.longitude && (
                  <div className="mt-2 text-xs text-white/70">
                    Coordinates: {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="space-y-3">
            <Label className="text-yellow-500 font-bold text-sm uppercase tracking-wider">Description *</Label>
            <div className="relative">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide a detailed description of what happened..."
                className="w-full min-h-[120px] p-4 rounded-xl border border-white/20 bg-blue-900 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 resize-none text-sm placeholder:text-white/50"
                maxLength={500}
              />
              <div className="absolute bottom-3 right-3 text-xs text-white/50 font-mono">
                {description.length}/500
              </div>
            </div>
          </section>

          {/* Media Upload */}
          <section className="space-y-3">
            <Label className="text-yellow-500 font-bold text-sm uppercase tracking-wider">
              Add Photos or Video <span className="text-white/50 font-normal normal-case">(Optional)</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <Label htmlFor="photo-upload">
                  <div className="h-24 border-2 border-dashed border-white/30 rounded-xl flex flex-col items-center justify-center gap-2 text-white hover:border-yellow-500 hover:bg-yellow-500/10 transition-all cursor-pointer">
                    <Camera size={24} className="text-yellow-500" />
                    <span className="text-xs font-bold">Add Photos</span>
                  </div>
                </Label>
              </div>
              <div>
                <Input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <Label htmlFor="video-upload">
                  <div className="h-24 border-2 border-dashed border-white/30 rounded-xl flex flex-col items-center justify-center gap-2 text-white hover:border-yellow-500 hover:bg-yellow-500/10 transition-all cursor-pointer">
                    <Video size={24} className="text-yellow-500" />
                    <span className="text-xs font-bold">Add Videos</span>
                  </div>
                </Label>
              </div>
            </div>

            {/* Preview uploaded media */}
            {(photos.length > 0 || videos.length > 0) && (
              <div className="mt-3">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {photos.map((photo, index) => (
                    <motion.div
                      key={index}
                      className="relative flex-shrink-0"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="w-16 h-16 bg-blue-800 rounded-lg flex items-center justify-center">
                        <Camera size={16} className="text-yellow-500" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                  {videos.map((video, index) => (
                    <motion.div
                      key={`video-${index}`}
                      className="flex-shrink-0"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="w-16 h-16 bg-blue-800 rounded-lg flex items-center justify-center">
                        <Video size={16} className="text-yellow-500" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Additional Details Toggle */}
          <motion.button
            type="button"
            onClick={() => setShowAdditionalFields(!showAdditionalFields)}
            className="w-full p-3 bg-blue-900 border border-white/20 rounded-xl flex items-center justify-between text-white"
            whileHover={{ scale: 1.02 }}
          >
            <span className="font-medium">Additional Details</span>
            <motion.div
              animate={{ rotate: showAdditionalFields ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Plus size={20} className="text-yellow-500" />
            </motion.div>
          </motion.button>

          {/* Additional Fields */}
          <AnimatePresence>
            {showAdditionalFields && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                {/* Incident Specific Details */}
                <div className="space-y-4">
                  <h3 className="text-yellow-500 font-bold text-sm uppercase tracking-wider">Incident Details</h3>

                  {/* Vehicle Type */}
                  {selectedType === "vehicular-accident" && (
                    <div className="space-y-2">
                      <Label className="text-yellow-500 text-sm font-medium">Vehicle Type Involved</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {VEHICLE_TYPES.map((vehicle) => {
                          const IconComponent = vehicle.icon;
                          return (
                            <button
                              key={vehicle.id}
                              type="button"
                              onClick={() => setIncidentDetails(prev => ({ ...prev, vehicleType: vehicle.id }))}
                              className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                                incidentDetails.vehicleType === vehicle.id
                                  ? 'border-yellow-500 bg-yellow-500/20'
                                  : 'border-white/20 bg-blue-900 hover:bg-blue-800'
                              }`}
                            >
                              <IconComponent size={16} className={incidentDetails.vehicleType === vehicle.id ? 'text-yellow-500' : 'text-white'} />
                              <span className={`text-xs ${incidentDetails.vehicleType === vehicle.id ? 'text-yellow-500' : 'text-white'}`}>
                                {vehicle.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Location Type */}
                  <div className="space-y-2">
                    <Label className="text-yellow-500 text-sm font-medium">Location Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {LOCATION_TYPES.map((location) => {
                        const IconComponent = location.icon;
                        return (
                          <button
                            key={location.id}
                            type="button"
                            onClick={() => setIncidentDetails(prev => ({ ...prev, locationType: location.id }))}
                            className={`p-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                              incidentDetails.locationType === location.id
                                ? 'border-yellow-500 bg-yellow-500/20'
                                : 'border-white/20 bg-blue-900 hover:bg-blue-800'
                            }`}
                          >
                            <IconComponent size={16} className={incidentDetails.locationType === location.id ? 'text-yellow-500' : 'text-white'} />
                            <span className={`text-xs ${incidentDetails.locationType === location.id ? 'text-yellow-500' : 'text-white'}`}>
                              {location.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Weather Condition */}
                  <div className="space-y-2">
                    <Label className="text-yellow-500 text-sm font-medium">Weather Condition</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {WEATHER_CONDITIONS.map((weather) => {
                        const IconComponent = weather.icon;
                        return (
                          <button
                            key={weather.id}
                            type="button"
                            onClick={() => setIncidentDetails(prev => ({ ...prev, weatherCondition: weather.id }))}
                            className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                              incidentDetails.weatherCondition === weather.id
                                ? 'border-yellow-500 bg-yellow-500/20'
                                : 'border-white/20 bg-blue-900 hover:bg-blue-800'
                            }`}
                          >
                            <IconComponent size={16} className={incidentDetails.weatherCondition === weather.id ? 'text-yellow-500' : 'text-white'} />
                            <span className={`text-xs ${incidentDetails.weatherCondition === weather.id ? 'text-yellow-500' : 'text-white'}`}>
                              {weather.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Casualties and Damage */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-yellow-500 text-sm font-medium">Estimated Damage (₱)</Label>
                      <Input
                        type="number"
                        value={incidentDetails.estimatedDamage}
                        onChange={(e) => setIncidentDetails(prev => ({ ...prev, estimatedDamage: e.target.value }))}
                        placeholder="0"
                        className="bg-blue-900 border border-white/20 text-white placeholder:text-white/50 focus:ring-yellow-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-yellow-500 text-sm font-medium">Injuries</Label>
                      <Input
                        type="number"
                        value={incidentDetails.injuries}
                        onChange={(e) => setIncidentDetails(prev => ({ ...prev, injuries: e.target.value }))}
                        placeholder="0"
                        className="bg-blue-900 border border-white/20 text-white placeholder:text-white/50 focus:ring-yellow-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-yellow-500 text-sm font-medium">Fatalities</Label>
                      <Input
                        type="number"
                        value={incidentDetails.fatalities}
                        onChange={(e) => setIncidentDetails(prev => ({ ...prev, fatalities: e.target.value }))}
                        placeholder="0"
                        className="bg-blue-900 border border-white/20 text-white placeholder:text-white/50 focus:ring-yellow-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-yellow-500 text-sm font-medium">People Affected</Label>
                      <Input
                        type="number"
                        value={numberOfPeople}
                        onChange={(e) => setNumberOfPeople(e.target.value)}
                        placeholder="0"
                        className="bg-blue-900 border border-white/20 text-white placeholder:text-white/50 focus:ring-yellow-500"
                      />
                    </div>
                  </div>

                  {/* Response Agencies */}
                  <div className="space-y-2">
                    <Label className="text-yellow-500 text-sm font-medium">Response Agencies Needed</Label>
                    <Select 
                      onValueChange={(value) => {
                        const agencies = value ? value.split(',') : [];
                        setIncidentDetails(prev => ({ ...prev, responseAgencies: agencies }));
                      }}
                      value={incidentDetails.responseAgencies.join(',')}
                    >
                      <SelectTrigger className="bg-blue-900 border border-white/20 text-white">
                        <SelectValue placeholder="Select agencies" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fire-dept">Fire Department</SelectItem>
                        <SelectItem value="police">Police</SelectItem>
                        <SelectItem value="medical">Medical Services</SelectItem>
                        <SelectItem value="rescue">Rescue Team</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="environmental">Environmental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Special Notes */}
                  <div className="space-y-2">
                    <Label className="text-yellow-500 text-sm font-medium">Special Notes</Label>
                    <Textarea
                      value={incidentDetails.specialNotes}
                      onChange={(e) => setIncidentDetails(prev => ({ ...prev, specialNotes: e.target.value }))}
                      placeholder="Any additional information or special considerations..."
                      className="bg-blue-900 border border-white/20 text-white placeholder:text-white/50 focus:ring-yellow-500 resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Sensitive Information Toggle */}
                <motion.button
                  type="button"
                  onClick={() => setShowSensitiveFields(!showSensitiveFields)}
                  className="w-full p-3 bg-blue-900 border border-white/20 rounded-xl flex items-center justify-between text-white"
                  whileHover={{ scale: 1.02 }}
                >
                  <span className="font-medium">Sender Information</span>
                  <motion.div
                    animate={{ rotate: showSensitiveFields ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Plus size={20} className="text-yellow-500" />
                  </motion.div>
                </motion.button>

                {/* Sender Information Fields */}
                <AnimatePresence>
                  {showSensitiveFields && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div className="space-y-3">
                        <Label className="text-yellow-500 text-sm font-medium">Contact Information</Label>
                        <div className="space-y-2">
                          <div className="relative">
                            <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500" />
                            <Input
                              type="text"
                              value={contactInfo.name}
                              onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Full Name"
                              className="pl-10 bg-blue-900 border border-white/20 text-white placeholder:text-white/50 focus:ring-yellow-500"
                            />
                          </div>
                          <div className="relative">
                            <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500" />
                            <Input
                              type="tel"
                              value={contactInfo.phone}
                              onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="Phone Number"
                              className="pl-10 bg-blue-900 border border-white/20 text-white placeholder:text-white/50 focus:ring-yellow-500"
                            />
                          </div>
                          <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500" />
                            <Input
                              type="email"
                              value={contactInfo.email}
                              onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="Email Address"
                              className="pl-10 bg-blue-900 border border-white/20 text-white placeholder:text-white/50 focus:ring-yellow-500"
                            />
                          </div>
                          <div className="relative">
                            <Home size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500" />
                            <Input
                              type="text"
                              value={contactInfo.address}
                              onChange={(e) => setContactInfo(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="Address"
                              className="pl-10 bg-blue-900 border border-white/20 text-white placeholder:text-white/50 focus:ring-yellow-500"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Anonymous Reporting */}
          <section className="bg-blue-900 p-4 rounded-xl border border-white/20 flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-yellow-500 font-bold">Report Anonymously</Label>
              <p className="text-xs text-white/70">Hide your identity from public records</p>
            </div>
            <Switch 
              checked={isAnonymous} 
              onCheckedChange={setIsAnonymous}
              className="data-[state=checked]:bg-yellow-500 data-[state=unchecked]:bg-blue-800"
            />
          </section>
        </form>
      </main>

      {/* Footer with Action Buttons */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-blue-950 border-t border-yellow-500/30 shadow-[0_-4px_10px_rgba(0,0,0,0.2)] flex gap-3 z-20 max-w-md mx-auto">
        <Button 
          variant="outline" 
          className="flex-1 border-white/30 text-white font-bold h-12 rounded-xl hover:bg-white/10"
          type="button"
          onClick={() => setLocation("/")}
        >
          Cancel
        </Button>
        <Button 
          className="flex-[2] bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold h-12 rounded-xl shadow-md shadow-yellow-500/20 transition-all"
          onClick={handleSubmit}
          disabled={!selectedType || submitIncident.isPending}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {submitIncident.isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-blue-950/30 border-t-blue-950 rounded-full animate-spin"></span>
              Submitting...
            </span>
          ) : (
            "Submit Report"
          )}
        </Button>
      </footer>
    </div>
  );
}