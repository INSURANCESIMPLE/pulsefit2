import React, { useState } from 'react';
import { 
  Building2, RefreshCw, AlertCircle, CheckCircle2, Clock, 
  Sparkles, MapPin, Search, Users, ChevronRight, Navigation, Plus, LocateFixed
} from 'lucide-react';
import { GymFacility, GymEquipment, EquipmentCategory, UserProfile } from '../types';
import { formatDistance, convertDistance } from '../utils/unitUtils';

interface GymSyncViewProps {
  gyms: GymFacility[];
  activeGymId: string;
  userProfile?: UserProfile;
  onSelectGym: (gymId: string) => void;
  onAddGym?: (newGym: GymFacility) => void;
  onReqAiSwap: (exerciseName: string, category: string) => void;
  onReportEquipmentStatus: (gymId: string, equipmentId: string, newStatus: 'Available' | 'In Use' | 'High Demand') => void;
}

export const GymSyncView: React.FC<GymSyncViewProps> = ({
  gyms,
  activeGymId,
  userProfile,
  onSelectGym,
  onAddGym,
  onReqAiSwap,
  onReportEquipmentStatus
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Zipcode & Radius Gym Search State
  const [zipcodeQuery, setZipcodeQuery] = useState(userProfile?.zipcode || '90210');
  const [selectedRadius, setSelectedRadius] = useState<number>(10); // in user's unit (miles or km)
  const [isLocating, setIsLocating] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string | null>(null);

  const distanceUnit = userProfile?.distanceUnit || 'mi';
  const activeGym = gyms.find((g) => g.id === activeGymId) || gyms[0];

  const filteredEquipment = activeGym.equipment.filter((eq) => {
    const matchesCat = selectedCategory === 'All' || eq.category === selectedCategory;
    const matchesSearch = eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          eq.locationArea.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const availableCount = activeGym.equipment.filter((e) => e.busyStatus === 'Available').length;
  const busyCount = activeGym.equipment.length - availableCount;

  // Handle GPS location lookup
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setSearchStatus('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setSearchStatus('Detecting your GPS location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude.toFixed(2);
        const lng = pos.coords.longitude.toFixed(2);
        setSearchStatus(`GPS Located (${lat}°, ${lng}°). Searching gyms in ${selectedRadius} ${distanceUnit} radius...`);
        
        // Dynamically add a nearby location-discovered gym if requested
        if (onAddGym) {
          const gpsGymId = `gym-gps-${Date.now()}`;
          const newGym: GymFacility = {
            id: gpsGymId,
            name: `Anytime Fitness - Near You (${zipcodeQuery || 'GPS'})`,
            address: `${lat}° N, ${lng}° W (Your Location)`,
            distanceKm: 0.4,
            isFavorite: false,
            occupancyRatePercent: 35,
            equipment: [
              { id: 'eq-g1', name: 'Barbell Olympic Bench', category: 'Barbell', count: 3, busyStatus: 'Available', waitTimeMins: 0, locationArea: 'Free Weight Area' },
              { id: 'eq-g2', name: 'Power Squat Rack', category: 'Barbell', count: 2, busyStatus: 'Available', waitTimeMins: 0, locationArea: 'Power Cage' },
              { id: 'eq-g3', name: 'Dual Adjustable Cable Pulley', category: 'Cable', count: 2, busyStatus: 'Available', waitTimeMins: 0, locationArea: 'Cable Zone' },
              { id: 'eq-g4', name: 'Pro Incline Treadmill', category: 'Treadmill', count: 8, busyStatus: 'Available', waitTimeMins: 0, locationArea: 'Cardio Deck' }
            ]
          };
          onAddGym(newGym);
          onSelectGym(gpsGymId);
        }
      },
      (err) => {
        setIsLocating(false);
        setSearchStatus(`GPS lookup: using Zip Code ${zipcodeQuery}`);
      },
      { timeout: 8000 }
    );
  };

  // Search gyms by Zip Code Radius
  const handleZipcodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipcodeQuery.trim()) return;
    setSearchStatus(`Filtering facilities within ${selectedRadius} ${distanceUnit} of ${zipcodeQuery}...`);
    
    // Check if gym for zipcode already exists or generate one
    const existing = gyms.find(g => g.address.includes(zipcodeQuery));
    if (!existing && onAddGym) {
      const generatedGym: GymFacility = {
        id: `gym-zip-${zipcodeQuery}-${Date.now()}`,
        name: `Gold's Gym - ${zipcodeQuery} Metro`,
        address: `120 Fitness Way, Zip ${zipcodeQuery}`,
        distanceKm: distanceUnit === 'mi' ? 1.2 * 1.60934 : 1.2,
        isFavorite: false,
        occupancyRatePercent: 48,
        equipment: [
          { id: 'eq-z1', name: 'Power Squat Rack', category: 'Barbell', count: 4, busyStatus: 'Available', waitTimeMins: 0, locationArea: 'Barbell Alley' },
          { id: 'eq-z2', name: 'Barbell Olympic Bench Press', category: 'Barbell', count: 4, busyStatus: 'In Use', waitTimeMins: 3, locationArea: 'Bench Zone' },
          { id: 'eq-z3', name: 'Lat Pulldown Machine', category: 'Cable', count: 3, busyStatus: 'Available', waitTimeMins: 0, locationArea: 'Selectorized Machines' },
          { id: 'eq-z4', name: '45° Leg Press Machine', category: 'Machine', count: 2, busyStatus: 'Available', waitTimeMins: 0, locationArea: 'Leg Bay' },
          { id: 'eq-z5', name: 'Smart Exercise Bikes', category: 'Bicycle', count: 6, busyStatus: 'Available', waitTimeMins: 0, locationArea: 'Cardio Room' }
        ]
      };
      onAddGym(generatedGym);
      onSelectGym(generatedGym.id);
    }
  };

  return (
    <div className="space-y-5 pb-28">
      {/* Zipcode Radius & Location Finder Card */}
      <div className="bento-card space-y-3.5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-lime-400 font-bold uppercase tracking-wider">
            <LocateFixed className="w-4 h-4" />
            <span>Zip Code & GPS Gym Locator</span>
          </div>
          <span className="text-[10px] bg-slate-950 text-slate-400 font-mono px-2.5 py-0.5 rounded-full border border-slate-800">
            Unit: {distanceUnit.toUpperCase()}
          </span>
        </div>

        <form onSubmit={handleZipcodeSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          {/* Zip Code Input */}
          <div className="sm:col-span-5 relative">
            <input
              type="text"
              value={zipcodeQuery}
              onChange={(e) => setZipcodeQuery(e.target.value)}
              placeholder="Enter Zip Code (e.g., 90210)"
              className="w-full bg-slate-950 border border-slate-800 focus:border-lime-500 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-100 font-mono outline-none transition"
            />
            <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>

          {/* Radius Selector */}
          <div className="sm:col-span-4 flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-[10px] text-slate-400 font-bold mr-2 whitespace-nowrap">Radius:</span>
            <select
              value={selectedRadius}
              onChange={(e) => setSelectedRadius(Number(e.target.value))}
              className="bg-transparent text-slate-100 font-bold outline-none w-full text-xs"
            >
              <option value={5} className="bg-slate-900 text-slate-100">5 {distanceUnit}</option>
              <option value={10} className="bg-slate-900 text-slate-100">10 {distanceUnit}</option>
              <option value={25} className="bg-slate-900 text-slate-100">25 {distanceUnit}</option>
              <option value={50} className="bg-slate-900 text-slate-100">50 {distanceUnit}</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="sm:col-span-3 flex space-x-1">
            <button
              type="submit"
              className="flex-1 bg-lime-500 hover:bg-lime-400 text-slate-950 font-black text-xs rounded-xl px-3 py-2 transition shadow-md flex items-center justify-center space-x-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Find</span>
            </button>

            {/* GPS Detect Button */}
            <button
              type="button"
              onClick={handleDetectGps}
              disabled={isLocating}
              title="Detect Current GPS Location"
              className="p-2 bg-slate-950 hover:bg-slate-800 text-lime-400 border border-slate-800 rounded-xl transition flex items-center justify-center"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-lime-400' : ''}`} />
            </button>
          </div>
        </form>

        {searchStatus && (
          <div className="text-[11px] text-lime-400 font-mono bg-slate-950/80 px-3 py-1.5 rounded-lg border border-lime-500/20">
            {searchStatus}
          </div>
        )}
      </div>

      {/* Active Gym Selector Banner */}
      <div className="bento-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[10px] text-lime-400 font-bold uppercase tracking-widest">
            <Building2 className="w-4 h-4" />
            <span>Select Active Gym Facility</span>
          </div>
          <span className="text-[10px] bg-slate-950 text-slate-400 font-mono px-2.5 py-0.5 rounded-full border border-slate-800">
            {formatDistance(activeGym.distanceKm, distanceUnit)} away
          </span>
        </div>

        {/* Gym Dropdown / Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {gyms.map((gym) => (
            <button
              key={gym.id}
              onClick={() => onSelectGym(gym.id)}
              className={`p-3 rounded-2xl text-left border transition ${
                gym.id === activeGymId
                  ? 'bg-lime-500/10 border-lime-500/40 text-slate-100 shadow-md ring-1 ring-lime-500/30'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-xs truncate max-w-[130px] sm:max-w-[160px]">{gym.name}</div>
                <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                  {formatDistance(gym.distanceKm, distanceUnit)}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{gym.address}</div>
              <div className="flex items-center justify-between text-[10px] mt-2">
                <span className={gym.occupancyRatePercent > 70 ? 'text-rose-400 font-bold' : 'text-lime-400 font-bold'}>
                  {gym.occupancyRatePercent}% Crowded
                </span>
                <span className="text-slate-500">{gym.equipment.length} Machines</span>
              </div>
            </button>
          ))}
        </div>

        {/* Live Occupancy Status Bar */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-lime-400" />
            <span className="text-slate-300 font-bold">Live Gym Traffic:</span>
            <span className="font-extrabold text-slate-100">{activeGym.occupancyRatePercent}% Capacity</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-lime-400 font-bold">{availableCount} Free</span>
            <span className="text-rose-400 font-bold">{busyCount} Busy</span>
          </div>
        </div>
      </div>

      {/* Equipment Filters & Search */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-lime-500">Live Equipment Availability</span>
          <span className="text-xs text-slate-400 font-mono">{filteredEquipment.length} items</span>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-2 text-xs">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search equipment, e.g., Squat Rack, Cable, Bench..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent w-full text-slate-100 placeholder-slate-500 outline-none"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Barbell', 'Dumbbell', 'Machine', 'Cable', 'Treadmill', 'Bicycle'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-lime-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredEquipment.map((eq) => {
          let statusBadge = 'bg-lime-500/10 text-lime-400 border-lime-500/30';
          if (eq.busyStatus === 'In Use') statusBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
          if (eq.busyStatus === 'High Demand') statusBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/30';

          return (
            <div
              key={eq.id}
              className="bento-card space-y-3 shadow-md hover:border-lime-500/30 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{eq.locationArea}</div>
                  <h4 className="font-extrabold text-sm text-slate-100 mt-0.5">{eq.name}</h4>
                </div>

                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusBadge}`}>
                  {eq.busyStatus}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{eq.waitTimeMins > 0 ? `Est. Wait: ${eq.waitTimeMins} mins` : 'No Wait Time'}</span>
                </div>
                <span className="font-mono text-[11px]">{eq.count} Units in Gym</span>
              </div>

              {/* Status Reporter & AI Substitute Actions */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                {/* Crowdsourced status toggle */}
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] text-slate-500">Report:</span>
                  <button
                    onClick={() => onReportEquipmentStatus(activeGym.id, eq.id, 'Available')}
                    className="px-2 py-0.5 bg-lime-500/10 hover:bg-lime-500/20 text-lime-400 font-bold text-[10px] rounded-lg border border-lime-500/30"
                  >
                    Free
                  </button>
                  <button
                    onClick={() => onReportEquipmentStatus(activeGym.id, eq.id, 'In Use')}
                    className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-[10px] rounded-lg border border-amber-500/30"
                  >
                    Busy
                  </button>
                </div>

                {/* AI Swap Trigger */}
                {eq.busyStatus !== 'Available' && (
                  <button
                    onClick={() => onReqAiSwap(eq.name, eq.category)}
                    className="flex items-center space-x-1 text-[11px] text-amber-300 hover:text-amber-200 font-bold"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>AI Substitute</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

