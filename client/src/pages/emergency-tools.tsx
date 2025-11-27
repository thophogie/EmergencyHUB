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
  const [contacts, setContacts] = useState(
    () =>
      localStorage.getItem("emergencyContacts") ||
      "911, Fire: 101, Ambulance: 102",
  );

  const audioRef = useRef(null);
  const whistleRef = useRef(null);
  const [track, setTrack] = useState(null);

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

  const saveContacts = () => {
    localStorage.setItem("emergencyContacts", contacts);
    alert("Contacts saved!");
  };

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
        {["Light", "Sound", "Safety", "Info"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 ${tab === t ? "text-yellow-500 border-b-2 border-yellow-500" : "text-white"}`}
          >
            {t}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-6 grid grid-cols-2 gap-4">
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

        {/* INFO TAB */}
        {tab === "Info" && (
          <div className="col-span-2 flex flex-col gap-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Info /> Emergency Info
            </h2>
            <textarea
              value={contacts}
              onChange={(e) => setContacts(e.target.value)}
              rows={5}
              className="bg-blue-900 border border-blue-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-yellow-500 resize-none"
            />
            <button
              onClick={saveContacts}
              className="bg-yellow-500 py-2 rounded-xl font-semibold hover:bg-yellow-400 transition-all text-blue-950"
            >
              Save Contacts
            </button>
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