import * as React from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Waves,
  Wind,
  Flame,
  Mountain,
  CloudLightning,
  Calendar,
  Clock,
  Sun,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

export default function DisasterPlan() {
  const [, setLocation] = useLocation();

  const disasters = [
    {
      id: "storm-surge",
      title: "Storm Surge & Tsunami",
      icon: Waves,
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      before: [
        "Know your zone: Is your home, work, or school in a designated evacuation zone?",
        "Plan multiple evacuation routes inland and to higher ground.",
        "Learn the natural warning signs: for a tsunami, a strong, long earthquake, a sudden rise or fall in the ocean, a loud 'roaring' sound.",
        "Heed official warnings immediately. Do not wait.",
        "Prepare your Go-Bag and have it ready.",
      ],
      during: [
        "IMMEDIATELY move inland and to high ground. Do not stay to watch.",
        "Go as far inland and as high up as possible. Even a few stories in a sturdy concrete building can make a difference.",
        "If you are in a boat and time allows, move out to deep water (tsunami waves are less destructive in deep ocean).",
        "Do not return to the evacuation zone until authorities declare it safe.",
      ],
      after: [
        "Stay away from the coast. Dangerous waves can continue for hours.",
        "Stay away from damaged buildings, bridges, and infrastructure.",
        "Be cautious of floodwaters, which may be contaminated or hide debris.",
        "Listen to official sources for information about safe return and water safety.",
      ],
    },
    {
      id: "landslide",
      title: "Landslide",
      icon: Mountain,
      color: "amber",
      gradient: "from-amber-500 to-orange-500",
      before: [
        "Learn if your area is prone to landslides.",
        "Watch for signs like new cracks in foundations, soil moving away from foundations, tilting trees or fences.",
        "Consult a professional for land-use guidance (e.g., building retaining walls).",
        "Plan an evacuation route to a safer area, not in the path of potential flow.",
      ],
      during: [
        "If you are in a building, get to the highest level.",
        "If you are outside and near the path of a landslide, run to the nearest high ground or shelter. Do not try to outrun it.",
        "If escape is not possible, curl into a tight ball and protect your head.",
      ],
      after: [
        "Stay away from the slide area. There may be a risk of additional slides.",
        "Check for injured or trapped people near the slide, but do not enter the direct area. Call for professional help.",
        "Be aware of potential flooding, as landslides can block waterways.",
        "Report broken utility lines to the authorities.",
      ],
    },
    {
      id: "thunderstorm",
      title: "Thunderstorm",
      icon: CloudLightning,
      color: "gray",
      gradient: "from-gray-500 to-slate-600",
      before: [
        "Secure or bring inside outdoor objects that could be blown away.",
        "Unplug sensitive electronic appliances to protect from power surges.",
        "Listen to weather forecasts for Severe Thunderstorm Warnings.",
      ],
      during: [
        "When Thunder Roars, Go Indoors! There is no safe place outside.",
        "Avoid corded phones, plumbing, and electrical appliances as lightning can travel through wiring and pipes.",
        "Stay away from windows and doors.",
        "If you are in a vehicle, it is a safe alternative. Avoid touching the metal frame.",
        "If you are caught outside with no shelter, avoid isolated trees, hilltops, and open fields. Crouch low in a ravine or valley.",
      ],
      after: [
        "Stay indoors for at least 30 minutes after the last clap of thunder.",
        "Watch for downed power lines and report them immediately.",
        "Check for property damage.",
      ],
    },
    {
      id: "typhoon",
      title: "Typhoon / Hurricane",
      icon: Wind,
      color: "blue",
      gradient: "from-blue-600 to-indigo-700",
      before: [
        "Know your home's vulnerability to wind and flooding.",
        "Install storm shutters or pre-cut plywood for windows.",
        "Secure or bring indoors all outdoor furniture, decorations, trash cans, etc.",
        "Trim trees and shrubs to make them more wind-resistant.",
        "Fill your vehicle's gas tank and withdraw some cash.",
      ],
      during: [
        "Stay indoors, away from windows and skylights.",
        "Take refuge in a small interior room, closet, or hallway on the lowest level that is not prone to flooding.",
        "Lie on the floor under a sturdy table or other object.",
        "Do not go outside during the 'eye' of the storm; the worst winds will resume shortly from the opposite direction.",
      ],
      after: [
        "Listen to official reports to ensure the storm has passed.",
        "Watch for fallen objects, downed power lines, and damaged structures.",
        "Do not walk or drive through floodwaters.",
        "Use flashlights, not candles, due to the risk of gas leaks.",
        "Check on your neighbors, especially the elderly or those with disabilities.",
      ],
    },
    {
      id: "flood",
      title: "Flood",
      icon: Waves,
      color: "cyan",
      gradient: "from-cyan-500 to-teal-500",
      before: [
        "Know if you are in a floodplain.",
        "Consider purchasing flood insurance.",
        "Elevate critical utilities (furnace, water heater, electrical panel).",
        "Have a plan to move to higher floors if needed.",
      ],
      during: [
        "Turn Around, Don't Drown! Do not walk, swim, or drive through floodwaters. Six inches of moving water can knock you down; one foot can sweep a vehicle away.",
        "Evacuate if told to do so.",
        "If trapped in a building, go to its highest level. Do not enter a closed attic.",
        "If trapped in a vehicle, stay inside. If water is rising inside the vehicle, seek refuge on the roof.",
      ],
      after: [
        "Return home only when authorities say it is safe.",
        "Avoid standing water, which may be electrically charged or contaminated.",
        "Wear heavy gloves and boots during cleanup.",
        "Photograph damage for insurance claims.",
        "Be aware that floodwater can weaken roads and structures.",
      ],
    },
    {
      id: "earthquake",
      title: "Earthquake",
      icon: Mountain,
      color: "stone",
      gradient: "from-stone-500 to-gray-600",
      before: [
        "'Drop, Cover, and Hold On' is the single most important preparedness action.",
        "Secure heavy furniture, appliances, and water heaters to walls.",
        "Know how to turn off your gas (if you smell a leak) and water.",
        "Store heavy and breakable objects on low shelves.",
      ],
      during: [
        "DROP onto your hands and knees.",
        "COVER your head and neck under a sturdy table or desk. If no shelter is nearby, get down near an interior wall and cover your head and neck with your arms.",
        "HOLD ON to your shelter until the shaking stops.",
        "If in bed, stay there and cover your head with a pillow.",
        "Do not run outside. The danger is from falling debris and glass.",
      ],
      after: [
        "Expect aftershocks. Drop, Cover, and Hold On when they occur.",
        "Check yourself and others for injuries.",
        "If you are in a damaged building, get out and move to an open space.",
        "If you smell gas, evacuate immediately and report it.",
        "Avoid using phones except for life-threatening emergencies.",
      ],
    },
    {
      id: "fire",
      title: "Fire (Wildfire / Structure)",
      icon: Flame,
      color: "red",
      gradient: "from-red-500 to-orange-500",
      before: [
        "Create a 'defensible space' by clearing flammable vegetation around your home.",
        "Have an evacuation plan for your family and pets.",
        "Keep gutters clean and remove debris from your roof.",
        "Install and test smoke alarms.",
        "Have fire extinguishers and know how to use them.",
        "Plan and practice a family escape route with two ways out of every room.",
      ],
      during: [
        "Evacuate immediately if told to do so.",
        "If trapped, call 911. Stay in a building or vehicle with windows closed. It is safer than being outside.",
        "If outside, seek shelter in a low-lying area or body of water. Cover yourself with wet clothing or a blanket.",
        "GET OUT, STAY OUT. Do not stop for belongings.",
        "Feel closed doors with the back of your hand before opening. If it's warm, use your second way out.",
        "Stay low to the floor where the air is less toxic.",
        "Call the fire department from outside.",
      ],
      after: [
        "Do not re-enter until firefighters say it is safe.",
        "Be aware of hot embers, smoldering debris, and structural damage.",
        "Wear a mask to avoid breathing ash.",
        "Watch for flare-ups.",
      ],
    },
    {
      id: "heat",
      title: "Extreme Heat",
      icon: Sun,
      color: "orange",
      gradient: "from-orange-400 to-amber-500",
      before: [
        "Ensure you have a way to stay cool (air conditioning, public cooling centers).",
        "Cover windows with drapes or shades to block direct sun.",
        "Have a plan for those at high risk (infants, elderly, people with chronic illnesses).",
      ],
      during: [
        "Stay indoors in air conditioning as much as possible.",
        "Drink plenty of water, even if you don't feel thirsty. Avoid alcohol and caffeine.",
        "Wear lightweight, light-colored, loose-fitting clothing.",
        "Take cool showers or baths.",
        "Never leave children or pets in a closed vehicle.",
        "Limit strenuous outdoor activity to the coolest parts of the day (early morning/evening).",
      ],
      after: [
        "Continue to hydrate.",
        "Check on neighbors, family, and friends who may be vulnerable.",
        "Be aware of signs of heat illness (dizziness, nausea, headache, confusion) and seek medical help if necessary.",
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        border:
          "data-[state=open]:border-blue-500 data-[state=open]:ring-blue-500/20",
      },
      amber: {
        bg: "bg-amber-100",
        text: "text-amber-600",
        border:
          "data-[state=open]:border-amber-500 data-[state=open]:ring-amber-500/20",
      },
      gray: {
        bg: "bg-gray-100",
        text: "text-gray-600",
        border:
          "data-[state=open]:border-gray-500 data-[state=open]:ring-gray-500/20",
      },
      cyan: {
        bg: "bg-cyan-100",
        text: "text-cyan-600",
        border:
          "data-[state=open]:border-cyan-500 data-[state=open]:ring-cyan-500/20",
      },
      stone: {
        bg: "bg-stone-100",
        text: "text-stone-600",
        border:
          "data-[state=open]:border-stone-500 data-[state=open]:ring-stone-500/20",
      },
      red: {
        bg: "bg-red-100",
        text: "text-red-600",
        border:
          "data-[state=open]:border-red-500 data-[state=open]:ring-red-500/20",
      },
      orange: {
        bg: "bg-orange-100",
        text: "text-orange-600",
        border:
          "data-[state=open]:border-orange-500 data-[state=open]:ring-orange-500/20",
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col max-w-md mx-auto shadow-2xl relative">
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 sticky top-0 z-20 shadow-lg flex items-center gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setLocation("/")}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </motion.button>
        <motion.h1
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-display font-bold text-xl tracking-wide uppercase"
        >
          Disaster Plan
        </motion.h1>
      </motion.header>

      <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 text-amber-800 text-sm mb-4 shadow-md"
        >
          <strong className="font-bold">Be Prepared!</strong> Knowing what to do
          before, during, and after a disaster can save lives.
        </motion.div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {disasters.map((disaster, index) => {
            const colorClasses = getColorClasses(disaster.color);
            const IconComponent = disaster.icon;

            return (
              <motion.div
                key={disaster.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index + 0.4, duration: 0.5 }}
              >
                <AccordionItem
                  value={disaster.id}
                  className={`bg-white border border-slate-200 rounded-2xl px-4 shadow-md hover:shadow-lg transition-shadow ${colorClasses.border}`}
                >
                  <AccordionTrigger className="hover:no-underline py-4 group">
                    <div className="flex items-center gap-3 w-full">
                      <div
                        className={`bg-gradient-to-r ${disaster.gradient} p-3 rounded-xl text-white shadow-md`}
                      >
                        <IconComponent size={24} />
                      </div>
                      <span className="font-bold text-slate-800 text-lg group-hover:text-slate-900 transition-colors">
                        {disaster.title}
                      </span>
                      <div className="ml-auto">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                          <svg
                            className="text-slate-500 group-data-[state=open]:rotate-180 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 space-y-4 pb-4">
                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100"
                      >
                        <div className="mt-1 p-2 bg-green-100 rounded-lg">
                          <Calendar className="text-green-600" size={20} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-bold text-green-700 flex items-center gap-2">
                            Before
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                            {disaster.before.map((item, index) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index + 0.3 }}
                                className="pl-1"
                              >
                                {item}
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100"
                      >
                        <div className="mt-1 p-2 bg-amber-100 rounded-lg">
                          <Clock className="text-amber-600" size={20} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-bold text-amber-700 flex items-center gap-2">
                            During
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                            {disaster.during.map((item, index) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index + 0.4 }}
                                className="pl-1"
                              >
                                {item}
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100"
                      >
                        <div className="mt-1 p-2 bg-blue-100 rounded-lg">
                          <Sun className="text-blue-600" size={20} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-bold text-blue-700 flex items-center gap-2">
                            After
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                            {disaster.after.map((item, index) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index + 0.5 }}
                                className="pl-1"
                              >
                                {item}
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            );
          })}
        </Accordion>
      </main>
    </div>
  );
}
