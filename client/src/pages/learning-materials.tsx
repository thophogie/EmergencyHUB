import * as React from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  FileText,
  BookOpen,
  ChevronRight,
  Download,
  Eye,
  Heart,
  Activity,
  Car,
  Plane,
  Virus,
  Droplets,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect } from "react";

type Document = {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  modifiedTime: string;
  webViewLink: string;
};

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Emergency Response Manual.pdf",
    mimeType: "application/pdf",
    size: "2.4 MB",
    modifiedTime: "2023-10-15",
    webViewLink: "#",
  },
  {
    id: "2",
    name: "First Aid Procedures.docx",
    mimeType: "application/vnd.google-apps.document",
    size: "1.8 MB",
    modifiedTime: "2023-11-02",
    webViewLink: "#",
  },
  {
    id: "3",
    name: "Disaster Preparedness Guide.pptx",
    mimeType: "application/vnd.google-apps.presentation",
    size: "5.2 MB",
    modifiedTime: "2023-09-28",
    webViewLink: "#",
  },
  {
    id: "4",
    name: "Evacuation Plans.pdf",
    mimeType: "application/pdf",
    size: "3.1 MB",
    modifiedTime: "2023-12-10",
    webViewLink: "#",
  },
];

const EMERGENCY_GUIDES = [
  {
    id: "first-aid",
    title: "First Aid Guide",
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    description: "Immediate action steps for medical emergencies",
    sections: [
      {
        title: "Stroke Recognition: Think F.A.S.T.",
        content: "Act quickly. Time lost is brain lost.\n• F - Face: Ask the person to smile. Does one side of the face droop?\n• A - Arms: Ask the person to raise both arms. Does one arm drift downward?\n• S - Speech: Ask the person to repeat a simple phrase. Is their speech slurred or strange?\n• T - Time: If you see any of these signs, call emergency services immediately. Note the time symptoms started."
      },
      {
        title: "Heart Attack",
        content: "Signs: Chest pain or discomfort (pressure, squeezing, fullness), pain in one or both arms, back, neck, jaw, or stomach, shortness of breath, cold sweat, nausea, lightheadedness.\n\nAction:\n1. Call emergency services immediately.\n2. Help the person sit down, rest, and stay calm.\n3. Loosen tight clothing.\n4. If they are not allergic, give them an aspirin to chew (unless advised otherwise by a doctor).\n5. Be prepared to perform CPR if they become unresponsive."
      },
      {
        title: "Seizure",
        content: "Do:\n• Gently guide the person to the floor.\n• Place something soft under their head.\n• Turn them onto their side to help with breathing (recovery position).\n• Clear the area of hard or sharp objects.\n• Time the seizure.\n\nDo NOT:\n• Do not hold them down.\n• Do not put anything in their mouth.\n• Do not offer water or food until they are fully alert.\n\nCall for emergency help if: The seizure lasts more than 5 minutes, a second seizure follows, the person is pregnant or injured, or they do not wake up after the seizure."
      },
      {
        title: "Animal Bite",
        content: "Action:\n1. For a minor wound, wash thoroughly with soap and running water for at least 5 minutes.\n2. Apply an antibiotic cream and cover with a clean bandage.\n3. Seek medical attention immediately to assess the risk of rabies and tetanus.\n4. If possible, safely identify the animal for authorities."
      }
    ]
  },
  {
    id: "medical-conditions",
    title: "Medical Condition Guide",
    icon: Activity,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "Managing common illnesses and conditions",
    sections: [
      {
        title: "Choking (Conscious Adult/Child)",
        content: "Ask \"Are you choking?\"\nIf they can't breathe, cough, or speak, perform the Heimlich Maneuver:\n1. Stand behind the person. Wrap your arms around their waist.\n2. Make a fist with one hand. Place it just above the navel.\n3. Grasp your fist with your other hand. Perform quick, upward thrusts.\n4. Continue until the object is dislodged or the person becomes unresponsive (then start CPR)."
      },
      {
        title: "Influenza (Flu)",
        content: "Symptoms: Sudden fever, cough, sore throat, muscle aches, fatigue.\n\nCare: Rest, drink plenty of fluids, use over-the-counter meds for fever/aches. See a doctor for antiviral drugs if caught early, especially for high-risk groups."
      },
      {
        title: "Pneumonia",
        content: "Symptoms: Cough (often with phlegm), fever, chills, difficulty breathing, chest pain.\n\nAction: See a doctor. Bacterial pneumonia requires antibiotics. Rest and hydration are crucial."
      },
      {
        title: "Typhoid Fever & Cholera",
        content: "These are serious bacterial infections often spread through contaminated food/water.\n\nSymptoms: Severe diarrhea, vomiting, fever (typhoid), dehydration.\n\nAction: Seek immediate medical care. Prevention is key: drink safe water, eat well-cooked food, practice good hand hygiene. Vaccines are available for typhoid."
      },
      {
        title: "Dengue Fever",
        content: "Symptoms: High fever, severe headache, pain behind the eyes, muscle and joint pain, rash.\n\nWarning Signs: Severe abdominal pain, persistent vomiting, bleeding gums. Go to a hospital immediately if these appear.\n\nCare: Rest, hydrate, use acetaminophen for pain/fever. Avoid NSAIDs (like Ibuprofen or Aspirin) as they can increase bleeding risk."
      },
      {
        title: "Malaria",
        content: "Symptoms: High fever, chills, sweats, headache, body aches (often cyclical).\n\nAction: This is a medical emergency. Seek diagnosis and treatment immediately. Prevention involves anti-malarial medication and avoiding mosquito bites."
      },
      {
        title: "Leptospirosis",
        content: "Spread through water or soil contaminated by infected animal urine.\n\nSymptoms: High fever, severe headache, muscle aches, red eyes, jaundice (yellow skin/eyes).\n\nAction: See a doctor immediately. Antibiotics are effective. Avoid wading in floodwater or potentially contaminated fresh water."
      }
    ]
  },
  {
    id: "cpr",
    title: "CPR Guide",
    icon: Activity,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    description: "Life-saving cardiopulmonary resuscitation",
    sections: [
      {
        title: "DRS ABCD - A Simple Memory Aid",
        content: "D - Danger: Ensure the area is safe for you and the victim.\nR - Response: Check for a response. Tap and shout, \"Are you okay?\"\nS - Send for help: Call emergency services. If someone is with you, send them to call.\nA - Airway: Tilt the head back and lift the chin to open the airway.\nB - Breathing: Look, listen, and feel for normal breathing for no more than 10 seconds.\nC - CPR: If not breathing or only gasping, start CPR.\n• Place the heel of one hand on the center of the chest. Place your other hand on top.\n• Push hard and fast (at least 2 inches deep) at a rate of 100-120 pushes per minute.\n• Let the chest recoil completely between pushes.\n• Optional for trained rescuers: After 30 compressions, give 2 rescue breaths.\nD - Defibrillator: If an AED (Automated External Defibrillator) is available, turn it on and follow the voice prompts."
      }
    ]
  },
  {
    id: "road-accident",
    title: "Road Accident Guide",
    icon: Car,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    description: "Steps to take during road accidents",
    sections: [
      {
        title: "Road Accident Response",
        content: "1. Secure the Scene:\n• Stop your car in a safe place, turn on hazard lights.\n• Set up warning triangles or flares to alert other drivers.\n\n2. Call for Help: Dial emergency services immediately. Report the location and number of injured.\n\n3. Assess the Injured (Do NOT move them unless in immediate danger):\n• Check for responsiveness and breathing.\n• If they are breathing, keep them still and calm. Do not remove helmets.\n• Control severe bleeding by applying direct pressure with a clean cloth.\n• If they are not breathing, begin CPR.\n\n4. Stay until help arrives."
      }
    ]
  },
  {
    id: "travel-health",
    title: "Travel Health Guide",
    icon: Plane,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    description: "Essential health tips for travelers",
    sections: [
      {
        title: "Essential Travel Health Guide",
        content: "Before You Go:\n• Research: Know the health risks at your destination.\n• Vaccinations: See a travel doctor 4-6 weeks before travel for recommended vaccines (e.g., Typhoid, Hepatitis A, Yellow Fever).\n• Pack a Kit: Include prescription meds, pain/fever reliever, anti-diarrheal, antihistamine, antibiotic cream, bandages, hand sanitizer, and insect repellent (with DEET).\n\nDuring Your Trip:\n• Food & Water: \"Boil it, cook it, peel it, or forget it.\" Drink only bottled or purified water. Avoid ice.\n• Bugs: Use insect repellent, wear long sleeves/pants, and sleep under a mosquito net in high-risk areas.\n• Safety: Wear a seatbelt, be aware of your surroundings, and have travel insurance."
      }
    ]
  }
];

export default function LearningMaterials() {
  const [, setLocation] = useLocation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    // Simulate API call to Google Drive
    const fetchDocuments = async () => {
      setLoading(true);
      // In a real implementation, you would use:
      // const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=YOUR_API_KEY`);
      // const data = await response.json();

      // Using mock data for demonstration
      setTimeout(() => {
        setDocuments(mockDocuments);
        setLoading(false);
      }, 1000);
    };

    fetchDocuments();
  }, []);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("document")) return "📝";
    if (mimeType.includes("presentation")) return "📊";
    if (mimeType.includes("spreadsheet")) return "📈";
    return "📁";
  };

  const formatMimeType = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "PDF Document";
    if (mimeType.includes("document")) return "Google Doc";
    if (mimeType.includes("presentation")) return "Presentation";
    if (mimeType.includes("spreadsheet")) return "Spreadsheet";
    return "Document";
  };

  const toggleSection = (sectionTitle) => {
    setExpandedSection(expandedSection === sectionTitle ? null : sectionTitle);
  };

  if (selectedGuide) {
    const guide = EMERGENCY_GUIDES.find(g => g.id === selectedGuide);
    return (
      <div className="min-h-screen bg-blue-950 flex flex-col max-w-md mx-auto shadow-2xl relative">
        <header className="bg-blue-950 text-white p-4 sticky top-0 z-20 shadow-md flex items-center gap-3 border-b-2 border-yellow-500">
          <button
            onClick={() => setSelectedGuide(null)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="font-display font-bold text-xl tracking-wide uppercase">
              {guide.title}
            </h1>
            <p className="text-sm text-white/70">{guide.description}</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
          {guide.sections.map((section, index) => (
            <div key={index} className="bg-blue-900 rounded-xl border border-blue-800 overflow-hidden">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-blue-800/50 transition-colors"
              >
                <h3 className="font-bold text-white">{section.title}</h3>
                <ChevronRight 
                  size={20} 
                  className={`text-yellow-500 transition-transform ${expandedSection === section.title ? 'rotate-90' : ''}`} 
                />
              </button>

              {expandedSection === section.title && (
                <div className="p-4 pt-0 border-t border-blue-800">
                  <div className="text-white/90 whitespace-pre-line text-sm leading-relaxed">
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mt-6">
            <AlertTriangle className="text-yellow-500 mb-2" size={24} />
            <p className="text-white text-sm">
              <strong>Disclaimer:</strong> This guide is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-950 flex flex-col max-w-md mx-auto shadow-2xl relative">
      <header className="bg-blue-950 text-white p-4 sticky top-0 z-20 shadow-md flex items-center gap-3 border-b-2 border-yellow-500">
        <button
          onClick={() => setLocation("/")}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-display font-bold text-xl tracking-wide uppercase">
          Learning Materials
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">
        {/* Documents Section */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-bold text-yellow-500 text-lg">
              Documents & Resources
            </h2>
            <button className="text-xs font-bold text-yellow-500/70">
              View All
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-blue-900 p-4 rounded-xl border border-blue-800 flex items-center gap-3 animate-pulse"
                >
                  <div className="bg-blue-800 rounded-lg w-12 h-12"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-blue-800 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-blue-800 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-blue-900 p-4 rounded-xl border border-blue-800 flex items-center gap-3 cursor-pointer hover:bg-blue-800 transition-colors group"
                  onClick={() => window.open(doc.webViewLink, "_blank")}
                >
                  <div className="bg-yellow-500/20 text-2xl p-3 rounded-lg flex items-center justify-center">
                    {getFileIcon(doc.mimeType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">
                      {doc.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs text-white/70 bg-blue-800 px-2 py-1 rounded">
                        {formatMimeType(doc.mimeType)}
                      </span>
                      <span className="text-xs text-white/70 bg-blue-800 px-2 py-1 rounded">
                        {doc.size}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-2 text-white/70 hover:text-yellow-500 hover:bg-blue-700 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle download logic here
                      }}
                    >
                      <Download size={16} />
                    </button>
                    <button
                      className="p-2 text-white/70 hover:text-yellow-500 hover:bg-blue-700 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(doc.webViewLink, "_blank");
                      }}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-white/30 group-hover:hidden"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-bold text-yellow-500 text-lg mb-3 px-1">
            Emergency Guides
          </h2>
          <div className="space-y-3">
            {EMERGENCY_GUIDES.map((guide) => {
              const IconComponent = guide.icon;
              return (
                <div
                  key={guide.id}
                  className="bg-blue-900 p-4 rounded-xl border border-blue-800 flex items-center gap-3 cursor-pointer hover:bg-blue-800 transition-colors"
                  onClick={() => setSelectedGuide(guide.id)}
                >
                  <div className={`${guide.bgColor} p-3 rounded-lg`}>
                    <IconComponent size={20} className={guide.color} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-sm">{guide.title}</h3>
                    <p className="text-xs text-white/70 mt-1">{guide.description}</p>
                  </div>
                  <ChevronRight size={16} className="text-white/30" />
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}