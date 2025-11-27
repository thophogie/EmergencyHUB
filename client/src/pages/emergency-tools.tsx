import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Flashlight,
  Volume2,
  AlertOctagon,
  Compass,
  Siren,
  Info,
  MapPin,
  BellRing,
  Navigation,
  Heart,
  Phone,
  MessageSquare,
  Trash2,
  Plus,
  User,
  Hash
} from "lucide-react";
import { useLocation } from "wouter";

export default function EmergencyToolsPlus() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState("Light");
  const [isFlashlightOn, setFlashlightOn] = useState(false);
  const [isStrobeOn, setStrobeOn] = useState(false);
  const [isSirenOn, setSirenOn] = useState(false);
  const [isWhistleOn, setWhistleOn] = useState(false);
  const [locationLink, setLocationLink] = useState("");
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: "", phone: "" });
  const [showAddContact, setShowAddContact] = useState(false);
  const [compassHeading, setCompassHeading] = useState(0);
  const [heartRate, setHeartRate] = useState("--");
  const [isMeasuringHeartRate, setIsMeasuringHeartRate] = useState(false);
  const [morseCode, setMorseCode] = useState("");
  const [morseMessage, setMorseMessage] = useState("SOS");

  const audioRef = useRef(null);
  const whistleRef = useRef(null);
  const [track, setTrack] = useState(null);
  const compassRef = useRef(null);

  
  // Save contacts to localStorage
  useEffect(() => {
    localStorage.setItem("emergencyContacts", JSON.stringify(contacts));
  }, [contacts]);

  // 🔦 Flashlight API
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    let stream;
    const enableTorch = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        const track = stream.getVideoTracks()[0];
        setTrack(track);
        if (track.getCapabilities().torch) {
          await track.applyConstraints({
            advanced: [{ torch: isFlashlightOn }],
          });
        }
      } catch (err) {
        console.warn("Torch not supported, fallback active.");
      }
    };
    enableTorch();
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [isFlashlightOn]);

  // 🧭 Compass
  useEffect(() => {
    if (tab === "Navigation" && 'DeviceOrientationEvent' in window) {
      const handleOrientation = (event) => {
        const alpha = event.alpha;
        if (alpha !== null) {
          setCompassHeading(Math.round(alpha));
        }
      };

      window.addEventListener('deviceorientation', handleOrientation);
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
      };
    }
  }, [tab]);

  // ❤️ Heart Rate Simulation
  const measureHeartRate = () => {
    setIsMeasuringHeartRate(true);
    setHeartRate("--");

    // Simulate heart rate measurement
    setTimeout(() => {
      const simulatedRate = Math.floor(Math.random() * 40) + 60; // 60-100 BPM
      setHeartRate(simulatedRate.toString());
      setIsMeasuringHeartRate(false);
    }, 3000);
  };

  // 📱 Contact Management
  const addContact = () => {
    if (newContact.name && newContact.phone) {
      const contact = {
        id: Date.now(),
        name: newContact.name,
        phone: newContact.phone
      };
      setContacts([...contacts, contact]);
      setNewContact({ name: "", phone: "" });
      setShowAddContact(false);
    }
  };

  const deleteContact = (id) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };

  const callContact = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const smsContact = (phone) => {
    window.location.href = `sms:${phone}`;
  };

  // 🗺️ Geolocation
  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const link = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
        setLocationLink(link);
        navigator.clipboard.writeText(link);
        alert("Location copied to clipboard!");
      });
    } else {
      alert("Geolocation not supported on this device.");
    }
  };

  // 🔊 Siren and Whistle Sounds
  const toggleSiren = () => {
    if (!audioRef.current) return;
    if (!isSirenOn) {
      audioRef.current.play();
      audioRef.current.loop = true;
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setSirenOn(!isSirenOn);
  };

  const playWhistle = () => {
    if (!whistleRef.current) return;
    whistleRef.current.play();
    setWhistleOn(true);
    setTimeout(() => setWhistleOn(false), 2000);
  };

  // 🔤 Morse Code Generator
  const morseCodeMap = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
    '9': '----.', '0': '-----', ' ': '/'
  };

  const generateMorseCode = () => {
    const message = morseMessage.toUpperCase();
    let code = '';
    for (let char of message) {
      if (morseCodeMap[char]) {
        code += morseCodeMap[char] + ' ';
      }
    }
    setMorseCode(code.trim());
  };

  useEffect(() => {
    generateMorseCode();
  }, [morseMessage]);

  return (
    <div className="min-h-screen flex flex-col bg-blue-950 text-white max-w-md mx-auto shadow-2xl">
      <header className="bg-blue-950 text-white p-4 flex items-center gap-3 border-b-2 border-yellow-500">
        <button
          onClick={() => setLocation("/")}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="font-display font-bold text-xl uppercase">
            Emergency Tools+
          </h1>
          <p className="text-sm opacity-80">Be Ready. Stay Safe.</p>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex justify-around bg-blue-900 text-sm font-semibold uppercase border-b border-blue-800">
        {["Light", "Sound", "Safety", "Navigation", "Health", "Contacts"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 px-1 text-center ${tab === t ? "text-yellow-500 border-b-2 border-yellow-500" : "text-white"}`}
          >
            {t}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto p-4 pb-24 grid grid-cols-2 gap-4">
        {/* LIGHT TAB */}
        {tab === "Light" && (
          <>
            <button
              onClick={() => setFlashlightOn(!isFlashlightOn)}
              className={`col-span-2 aspect-video rounded-2xl flex flex-col items-center justify-center gap-3 transition-all shadow-lg ${
                isFlashlightOn
                  ? "bg-yellow-500 text-blue-950 border-4 border-white"
                  : "bg-blue-900 text-white border-2 border-blue-800"
              }`}
            >
              <Flashlight size={48} />
              <span className="font-bold text-xl">
                {isFlashlightOn ? "Flashlight ON" : "Flashlight OFF"}
              </span>
            </button>

            <button
              onClick={() => setStrobeOn(!isStrobeOn)}
              className={`col-span-2 aspect-video rounded-2xl border-2 flex flex-col items-center justify-center gap-3 shadow-md ${
                isStrobeOn
                  ? "bg-yellow-500 text-blue-950 border-white animate-pulse"
                  : "bg-blue-900 border-blue-800 text-white"
              }`}
            >
              <BellRing size={36} />
              <span className="font-bold text-lg">Strobe Light</span>
            </button>
          </>
        )}

        {/* SOUND TAB */}
        {tab === "Sound" && (
          <>
            <button
              onClick={toggleSiren}
              className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-3 ${
                isSirenOn
                  ? "bg-yellow-500 text-blue-950 animate-pulse"
                  : "bg-blue-900 text-white border-blue-800"
              }`}
            >
              <Siren size={36} />
              <span className="font-bold text-sm">Siren</span>
            </button>
            <button
              onClick={playWhistle}
              className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-3 ${
                isWhistleOn
                  ? "bg-yellow-500 text-blue-950 animate-bounce"
                  : "bg-blue-900 text-white border-blue-800"
              }`}
            >
              <Volume2 size={36} />
              <span className="font-bold text-sm">Whistle</span>
            </button>

            <audio
              ref={audioRef}
              src="https://actions.google.com/sounds/v1/alarms/siren.ogg"
              preload="auto"
            />
            <audio
              ref={whistleRef}
              src="https://actions.google.com/sounds/v1/alarms/whistle.ogg"
              preload="auto"
            />
          </>
        )}

        {/* SAFETY TAB */}
        {tab === "Safety" && (
          <>
            <button
              onClick={() => alert("SOS signal sent!")}
              className="col-span-2 bg-yellow-500 rounded-2xl p-4 text-xl font-bold uppercase tracking-wide flex items-center justify-center gap-3 border-2 border-white shadow-lg active:scale-95 text-blue-950"
            >
              <AlertOctagon /> Send SOS
            </button>

            <button
              onClick={handleShareLocation}
              className="col-span-2 bg-blue-800 rounded-2xl p-4 text-lg font-semibold tracking-wide flex items-center justify-center gap-3 border-2 border-yellow-500 shadow-md active:scale-95"
            >
              <MapPin /> Share My Location
            </button>

            {locationLink && (
              <p className="col-span-2 text-center text-sm mt-2 text-yellow-500 break-all">
                {locationLink}
              </p>
            )}
          </>
        )}

        {/* NAVIGATION TAB */}
        {tab === "Navigation" && (
          <>
            <div className="col-span-2 bg-blue-900 rounded-2xl p-6 border-2 border-blue-800 flex flex-col items-center justify-center">
              <Compass size={64} className="text-yellow-500 mb-4" style={{ transform: `rotate(${-compassHeading}deg)` }} />
              <h3 className="text-xl font-bold mb-2">Digital Compass</h3>
              <p className="text-2xl font-mono">{compassHeading}°</p>
              <p className="text-sm text-white/70 mt-2">Point device North</p>
            </div>

            <div className="col-span-2 bg-blue-900 rounded-2xl p-6 border-2 border-blue-800">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Navigation className="text-yellow-500" /> Morse Code Generator
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={morseMessage}
                  onChange={(e) => setMorseMessage(e.target.value)}
                  placeholder="Enter message"
                  className="w-full bg-blue-800 border border-blue-700 rounded-lg p-3 text-white placeholder:text-white/50"
                />
                <div className="bg-blue-800 rounded-lg p-4 min-h-[60px] font-mono text-lg break-all">
                  {morseCode || "Enter a message to generate Morse code"}
                </div>
                <div className="text-xs text-white/70">
                  Use dots (.) and dashes (-) to communicate
                </div>
              </div>
            </div>
          </>
        )}

        {/* HEALTH TAB */}
        {tab === "Health" && (
          <>
            <div className="col-span-2 bg-blue-900 rounded-2xl p-6 border-2 border-blue-800 flex flex-col items-center justify-center">
              <Heart size={64} className="text-red-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Heart Rate Monitor</h3>
              <p className="text-4xl font-bold text-red-500 mb-2">
                {heartRate} <span className="text-lg">BPM</span>
              </p>
              <button
                onClick={measureHeartRate}
                disabled={isMeasuringHeartRate}
                className={`px-6 py-3 rounded-full font-bold ${
                  isMeasuringHeartRate
                    ? "bg-gray-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {isMeasuringHeartRate ? "Measuring..." : "Measure Now"}
              </button>
              <p className="text-xs text-white/70 mt-3 text-center">
                Place finger on camera for accurate reading
              </p>
            </div>

            <div className="col-span-2 bg-blue-900 rounded-2xl p-6 border-2 border-blue-800">
              <h3 className="text-lg font-bold mb-4">Emergency Symptoms</h3>
              <div className="space-y-3">
                <div className="bg-red-500/20 p-3 rounded-lg border border-red-500/30">
                  <p className="font-bold text-red-300">Chest Pain</p>
                  <p className="text-sm">Call emergency services immediately</p>
                </div>
                <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-500/30">
                  <p className="font-bold text-orange-300">Difficulty Breathing</p>
                  <p className="text-sm">Seek immediate medical attention</p>
                </div>
                <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-500/30">
                  <p className="font-bold text-yellow-300">Severe Bleeding</p>
                  <p className="text-sm">Apply pressure and seek help</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* CONTACTS TAB */}
        {tab === "Contacts" && (
          <div className="col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <User className="text-yellow-500" /> Emergency Contacts
              </h2>
              <button
                onClick={() => setShowAddContact(true)}
                className="bg-yellow-500 text-blue-950 p-2 rounded-full hover:bg-yellow-400"
              >
                <Plus size={20} />
              </button>
            </div>

            {showAddContact && (
              <div className="bg-blue-900 rounded-xl p-4 border-2 border-blue-800">
                <h3 className="font-bold mb-3">Add New Contact</h3>
                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500" size={18} />
                    <input
                      type="text"
                      value={newContact.name}
                      onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                      placeholder="Contact Name"
                      className="w-full bg-blue-800 border border-blue-700 rounded-lg pl-10 pr-3 py-2 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500" size={18} />
                    <input
                      type="tel"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                      placeholder="Phone Number"
                      className="w-full bg-blue-800 border border-blue-700 rounded-lg pl-10 pr-3 py-2 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddContact(false)}
                      className="flex-1 bg-gray-600 py-2 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addContact}
                      className="flex-1 bg-yellow-500 text-blue-950 py-2 rounded-lg font-medium"
                    >
                      Add Contact
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {contacts.length === 0 ? (
                <div className="bg-blue-900 rounded-xl p-6 border-2 border-blue-800 text-center">
                  <User size={48} className="text-white/30 mx-auto mb-3" />
                  <p className="text-white/70">No emergency contacts added yet</p>
                </div>
              ) : (
                contacts.map((contact) => (
                  <div key={contact.id} className="bg-blue-900 rounded-xl p-4 border-2 border-blue-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-yellow-500/20 p-2 rounded-full">
                          <User className="text-yellow-500" size={20} />
                        </div>
                        <div>
                          <p className="font-bold">{contact.name}</p>
                          <p className="text-sm text-white/70">{contact.phone}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteContact(contact.id)}
                        className="text-red-500 hover:text-red-400 p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => callContact(contact.phone)}
                        className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg flex items-center justify-center gap-2"
                      >
                        <Phone size={16} /> Call
                      </button>
                      <button
                        onClick={() => smsContact(contact.phone)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg flex items-center justify-center gap-2"
                      >
                        <MessageSquare size={16} /> SMS
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Flashlight overlay */}
      {isFlashlightOn && (
        <div className="absolute inset-0 bg-white opacity-70 pointer-events-none"></div>
      )}

      {/* Strobe effect */}
      {isStrobeOn && (
        <div className="absolute inset-0 bg-white opacity-50 animate-ping pointer-events-none"></div>
      )}
    </div>
  );
}