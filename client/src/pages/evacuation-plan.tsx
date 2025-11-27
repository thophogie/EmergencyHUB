import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Users, 
  Info,
  Layers,
  Heart,
  Zap,
  AlertTriangle,
  Droplets,
  Shield,
  Share2,
  Printer,
  MessageCircle,
  CheckCircle2,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { loadGoogleMapsScript } from "@/lib/google-maps";

type EvacuationCenter = {
  id: number;
  name: string;
  distance: string;
  capacity: string;
  status: string;
  latitude?: string;
  longitude?: string;
};

type HazardZone = {
  id: number;
  name: string;
  type: string;
  coordinates: string[];
  severity: string;
};

type Poi = {
  id: number;
  name: string;
  type: string;
  latitude: string;
  longitude: string;
  address?: string;
  available: boolean;
};

type Member = {
  id: number;
  householdId: number;
  name: string;
  contact?: string;
  lastKnownLocation?: string;
  status: string;
};

export default function EvacuationPlan() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("map");
  const [mapCenter] = useState<[number, number]>([13.0345, 123.4567]);

  // Layer toggles
  const [showHazardZones, setShowHazardZones] = useState(true);
  const [showMedical, setShowMedical] = useState(true);
  const [showPetShelter, setShowPetShelter] = useState(false);
  const [showCharging, setShowCharging] = useState(false);

  // Family tracking
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [myStatus, setMyStatus] = useState("unknown");

  // Fix Leaflet default marker icon issue
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Fetch data
  const { data: centers = [] } = useQuery<EvacuationCenter[]>({
    queryKey: ["evacuationCenters"],
    queryFn: async () => {
      const res = await fetch("/api/evacuation-centers");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: hazardZones = [] } = useQuery<HazardZone[]>({
    queryKey: ["hazardZones"],
    queryFn: async () => {
      const res = await fetch("/api/hazard-zones");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: pois = [] } = useQuery<Poi[]>({
    queryKey: ["pois"],
    queryFn: async () => {
      const res = await fetch("/api/pois");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["members", 1],
    queryFn: async () => {
      const res = await fetch("/api/households/1/members");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/members/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", 1] });
      toast({
        title: "Status Updated",
        description: "Your status has been shared with your family.",
      });
    },
  });

  

  const handleShareLocation = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Evacuation Route',
          text: 'I am evacuating to a safe location. Here is my current location.',
          url: window.location.href,
        });
        toast({
          title: "Location Shared",
          description: "Your evacuation route has been shared.",
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      toast({
        title: "Share Not Supported",
        description: "Your browser doesn't support sharing.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleSafeStatus = () => {
    const newStatus = myStatus === "safe" ? "unknown" : "safe";
    setMyStatus(newStatus);
    if (members.length > 0) {
      updateStatusMutation.mutate({ id: members[0].id, status: newStatus });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl relative">
      <header className="bg-brand-blue text-white p-4 sticky top-0 z-20 shadow-md flex items-center gap-3">
        <button 
          onClick={() => setLocation("/")} 
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-display font-bold text-xl tracking-wide uppercase">Evacuation Plan</h1>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 bg-white border-b">
          <TabsTrigger value="map" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white">
            <MapPin className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="family" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white">
            <Users className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="guide" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white">
            <Info className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="faq" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white">
            <MessageCircle className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="h-96 bg-slate-200 rounded-xl overflow-hidden shadow-lg" data-testid="leaflet-map">
            <MapContainer
              center={mapCenter}
              zoom={14}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Evacuation Centers */}
              {centers.map((center) => {
                if (center.latitude && center.longitude) {
                  return (
                    <Marker
                      key={center.id}
                      position={[parseFloat(center.latitude), parseFloat(center.longitude)]}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold">{center.name}</h3>
                          <p className="text-sm">{center.distance} • {center.capacity}</p>
                          <p className={`text-sm font-bold ${center.status === 'Open' ? 'text-green-600' : 'text-red-600'}`}>
                            {center.status}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                }
                return null;
              })}

              {/* Hazard Zones */}
              {showHazardZones && hazardZones.map((zone) => {
                const coordinates = zone.coordinates.map((coord) => {
                  const [lat, lng] = coord.split(',').map(parseFloat);
                  return [lat, lng] as [number, number];
                });
                return (
                  <Polygon
                    key={zone.id}
                    positions={coordinates}
                    pathOptions={{
                      color: zone.type === "flood" ? "#3b82f6" : "#f59e0b",
                      fillColor: zone.type === "flood" ? "#3b82f6" : "#f59e0b",
                      fillOpacity: 0.2,
                    }}
                  >
                    <Popup>{zone.name}</Popup>
                  </Polygon>
                );
              })}

              {/* POIs */}
              {pois.map((poi) => {
                let shouldShow = false;
                if (poi.type === "medical" && showMedical) shouldShow = true;
                if (poi.type === "pet-shelter" && showPetShelter) shouldShow = true;
                if (poi.type === "charging" && showCharging) shouldShow = true;

                if (shouldShow) {
                  return (
                    <Marker
                      key={poi.id}
                      position={[parseFloat(poi.latitude), parseFloat(poi.longitude)]}
                    >
                      <Popup>{poi.name}</Popup>
                    </Marker>
                  );
                }
                return null;
              })}
            </MapContainer>
          </div>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm font-bold">
                  <Layers size={16} className="text-brand-blue" />
                  Map Layers
                </Label>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-sm">
                    <Droplets size={14} className="text-blue-500" />
                    Hazard Zones
                  </Label>
                  <Switch checked={showHazardZones} onCheckedChange={setShowHazardZones} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-sm">
                    <Shield size={14} className="text-red-500" />
                    Medical Stations
                  </Label>
                  <Switch checked={showMedical} onCheckedChange={setShowMedical} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-sm">
                    <Heart size={14} className="text-purple-500" />
                    Pet-Friendly Shelters
                  </Label>
                  <Switch checked={showPetShelter} onCheckedChange={setShowPetShelter} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-sm">
                    <Zap size={14} className="text-yellow-500" />
                    Charging Stations
                  </Label>
                  <Switch checked={showCharging} onCheckedChange={setShowCharging} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleShareLocation} className="flex-1 bg-brand-blue" data-testid="button-share">
              <Share2 className="w-4 h-4 mr-2" />
              Share Route
            </Button>
            <Button onClick={handlePrint} variant="outline" data-testid="button-print">
              <Printer className="w-4 h-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="family" className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <h3 className="font-bold text-green-800 mb-2">Your Safety Status</h3>
              <Button 
                onClick={toggleSafeStatus}
                className={`w-full ${myStatus === 'safe' ? 'bg-green-600' : 'bg-slate-400'}`}
                data-testid="button-im-safe"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {myStatus === 'safe' ? "I'm Safe ✓" : "Mark as Safe"}
              </Button>
              {myStatus === 'safe' && (
                <p className="text-xs text-green-700 mt-2 text-center">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              )}
            </CardContent>
          </Card>

          <section>
            <h2 className="text-brand-blue font-bold text-lg mb-3">Family Group</h2>
            {members.length === 0 ? (
              <Card>
                <CardContent className="p-4 text-center text-slate-500">
                  <User className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No family members added yet.</p>
                  <Button className="mt-3 bg-brand-blue">Add Family Member</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <Card key={member.id} data-testid={`member-${member.id}`}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-brand-blue">{member.name}</h4>
                        {member.contact && (
                          <p className="text-xs text-slate-500">{member.contact}</p>
                        )}
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        member.status === 'safe' ? 'bg-green-100 text-green-700' :
                        member.status === 'danger' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {member.status === 'safe' ? '✓ Safe' : member.status === 'danger' ? '⚠ Danger' : 'Unknown'}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="guide" className="flex-1 overflow-y-auto p-4 space-y-4 print:text-black">
          <Card>
            <CardContent className="p-4 space-y-4">
              <h2 className="text-brand-blue font-bold text-xl">Evacuation Guide</h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-brand-blue mb-2">Before You Leave:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li>Gather your Go Bag essentials</li>
                    <li>Turn off utilities (gas, electricity, water)</li>
                    <li>Lock windows and doors</li>
                    <li>Alert family members</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-brand-blue mb-2">During Evacuation:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    <li>Follow designated evacuation routes</li>
                    <li>Avoid flood zones and hazard areas</li>
                    <li>Stay with your group</li>
                    <li>Follow local official instructions</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-brand-blue mb-2">Emergency Contacts:</h3>
                  <div className="bg-slate-50 p-3 rounded-lg space-y-1 text-sm">
                    <p><strong>MDRRMO:</strong> (054) 123-4567</p>
                    <p><strong>Police:</strong> 117</p>
                    <p><strong>Fire:</strong> 160</p>
                    <p><strong>Medical:</strong> 911</p>
                  </div>
                </div>
              </div>

              <Button onClick={handlePrint} className="w-full bg-brand-blue mt-4 print:hidden">
                <Printer className="w-4 h-4 mr-2" />
                Print This Guide
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="flex-1 overflow-y-auto p-4 space-y-3">
          <h2 className="text-brand-blue font-bold text-lg mb-3">Frequently Asked Questions</h2>
          
          {[
            {
              q: "When should I evacuate?",
              a: "Evacuate immediately when local authorities issue a mandatory evacuation order. Don't wait for the situation to worsen."
            },
            {
              q: "What should I bring?",
              a: "Bring your Go Bag with essentials: water, food, medicine, important documents, flashlight, and phone charger."
            },
            {
              q: "Can I bring my pets?",
              a: "Yes! Pet-friendly shelters are marked on the map. Make sure your pets have ID tags and carriers."
            },
            {
              q: "What if I have mobility issues?",
              a: "Contact MDRRMO at 0917-772-5016 for special assistance. They provide transportation for people with disabilities."
            },
            {
              q: "How do I know which center to go to?",
              a: "Use the map to find the nearest open evacuation center. Choose based on distance, capacity, and road conditions."
            },
            {
              q: "What if roads are flooded?",
              a: "Check the hazard zones layer on the map. Use alternative routes and never drive through flooded areas."
            },
          ].map((faq, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <h3 className="font-bold text-brand-blue mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-700">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
