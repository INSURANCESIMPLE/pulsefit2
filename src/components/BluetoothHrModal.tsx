import React, { useState, useEffect } from 'react';
import { 
  X, HeartPulse, Bluetooth, Signal, RefreshCw, CheckCircle2, 
  WifiOff, Cpu, Zap, Activity, ShieldCheck, AlertCircle, Radio
} from 'lucide-react';
import { getHeartRateZone } from '../utils/heartRateUtils';

interface BluetoothDeviceOption {
  id: string;
  name: string;
  rssi: number;
  batteryPercent: number;
  type: 'Chest Strap' | 'Armband' | 'Smartwatch';
}

const MOCK_NEARBY_DEVICES: BluetoothDeviceOption[] = [
  { id: 'polar-h10', name: 'Polar H10 (A894)', rssi: -58, batteryPercent: 92, type: 'Chest Strap' },
  { id: 'garmin-hrm', name: 'Garmin HRM-Pro Plus', rssi: -64, batteryPercent: 88, type: 'Chest Strap' },
  { id: 'wahoo-tickr', name: 'Wahoo TICKR X', rssi: -72, batteryPercent: 75, type: 'Chest Strap' },
  { id: 'apple-watch', name: 'Apple Watch HR Broadcast', rssi: -45, batteryPercent: 68, type: 'Smartwatch' },
  { id: 'coospo-h8', name: 'Coospo H808S', rssi: -80, batteryPercent: 95, type: 'Armband' },
];

interface BluetoothHrModalProps {
  isHrConnected: boolean;
  currentHrBpm: number;
  deviceName?: string;
  onConnectDevice: (deviceName: string, bpm: number) => void;
  onDisconnectDevice: () => void;
  onUpdateBpm: (bpm: number) => void;
  onClose: () => void;
}

export const BluetoothHrModal: React.FC<BluetoothHrModalProps> = ({
  isHrConnected,
  currentHrBpm,
  deviceName = 'Polar H10 (A894)',
  onConnectDevice,
  onDisconnectDevice,
  onUpdateBpm,
  onClose
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [activeDeviceName, setActiveDeviceName] = useState<string>(deviceName);
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDeviceOption | null>(
    isHrConnected ? MOCK_NEARBY_DEVICES[0] : null
  );
  const [webBtSupported, setWebBtSupported] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveBpm, setLiveBpm] = useState(currentHrBpm);

  // Check if Web Bluetooth is natively supported in this browser environment
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
      setWebBtSupported(true);
    }
  }, []);

  // Organic simulated Heart Rate drift if connected
  useEffect(() => {
    if (!isHrConnected) return;

    const interval = setInterval(() => {
      setLiveBpm((prev) => {
        const delta = (Math.random() - 0.48) * 3;
        const newBpm = Math.min(185, Math.max(90, Math.round(prev + delta)));
        onUpdateBpm(newBpm);
        return newBpm;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isHrConnected, onUpdateBpm]);

  // Handle Real Web Bluetooth API scanning
  const handleRealWebBluetoothScan = async () => {
    setErrorMessage(null);
    setIsScanning(true);

    try {
      const nav = navigator as any;
      if (!nav || !nav.bluetooth) {
        throw new Error('Web Bluetooth API is not supported in this browser window.');
      }

      // Request Heart Rate GATT Service (UUID: 0x180D)
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service']
      });

      if (!device || !device.gatt) {
        throw new Error('Device found, but GATT server unavailable.');
      }

      setActiveDeviceName(device.name || 'Bluetooth Heart Rate Monitor');

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value: DataView = event.target.value;
        const flags = value.getUint8(0);
        const is16Bit = flags & 0x01;
        const bpm = is16Bit ? value.getUint16(1, true) : value.getUint8(1);
        setLiveBpm(bpm);
        onUpdateBpm(bpm);
      });

      onConnectDevice(device.name || 'Bluetooth Heart Rate Sensor', liveBpm);
      setIsScanning(false);
    } catch (err: any) {
      setIsScanning(false);
      // Fall back to virtual Bluetooth device pairing if Web Bluetooth fails or user cancels browser picker
      console.warn('Web Bluetooth scan fallback:', err.message);
      setErrorMessage(err.message || 'Bluetooth connection prompt closed or unavailable.');
    }
  };

  // Handle Virtual / Simulated Device Pairing
  const handleConnectSimulatedDevice = (dev: BluetoothDeviceOption) => {
    setSelectedDevice(dev);
    setActiveDeviceName(dev.name);
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      onConnectDevice(dev.name, 138);
      setLiveBpm(138);
    }, 1200);
  };

  const hrZone = getHeartRateZone(liveBpm);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl text-slate-100 space-y-5 relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/30">
              <Bluetooth className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100">Bluetooth HR Monitor</h2>
              <p className="text-xs text-slate-400">Connect heart rate chest strap, armband or smartwatch</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-950 hover:bg-slate-800 rounded-2xl border border-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active HR Banner */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isHrConnected 
            ? 'bg-slate-950/90 border-lime-500/40 shadow-lg shadow-lime-950/20' 
            : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-2xl ${
                isHrConnected 
                  ? 'bg-rose-500/20 text-rose-400 animate-pulse border border-rose-500/40' 
                  : 'bg-slate-800 text-slate-500'
              }`}>
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-200">
                    {isHrConnected ? activeDeviceName : 'No HR Sensor Connected'}
                  </span>
                  {isHrConnected && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-lime-400 bg-lime-500/10 px-2 py-0.5 rounded border border-lime-500/30">
                      GATT HR
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                  {isHrConnected ? (
                    <>
                      <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Paired via Web Bluetooth</span>
                      </span>
                      <span>•</span>
                      <span className={hrZone.textColor}>{hrZone.name} Zone</span>
                    </>
                  ) : (
                    <span>Tap scan below to pair nearby Bluetooth device</span>
                  )}
                </div>
              </div>
            </div>

            {/* Live BPM readout */}
            {isHrConnected && (
              <div className="text-right">
                <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">
                  {liveBpm} <span className="text-xs text-rose-400 font-sans">BPM</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Real-Time Sync
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scan Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-blue-400 font-mono flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5" />
              <span>Available Bluetooth Devices</span>
            </span>

            <button
              onClick={handleRealWebBluetoothScan}
              disabled={isScanning}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-blue-950/40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Pair Web Bluetooth'}</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Web Bluetooth Note: </span>
                <span>{errorMessage} You can also select from simulated devices below.</span>
              </div>
            </div>
          )}

          {/* Device list */}
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {MOCK_NEARBY_DEVICES.map((dev) => {
              const isThisConnected = isHrConnected && activeDeviceName === dev.name;

              return (
                <div
                  key={dev.id}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                    isThisConnected
                      ? 'bg-blue-500/10 border-blue-500/50 text-slate-100'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-900 text-blue-400 rounded-xl border border-slate-800">
                      <Bluetooth className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100">{dev.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                        <span>{dev.type}</span>
                        <span>•</span>
                        <span className="text-slate-500">Signal: {dev.rssi} dBm</span>
                        <span>•</span>
                        <span className="text-emerald-400">Bat: {dev.batteryPercent}%</span>
                      </div>
                    </div>
                  </div>

                  {isThisConnected ? (
                    <button
                      onClick={onDisconnectDevice}
                      className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/30 transition"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnectSimulatedDevice(dev)}
                      disabled={isScanning}
                      className="text-xs font-bold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-800 transition"
                    >
                      Connect
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info & manual disconnect */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <div className="text-slate-400 text-[11px] flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
            <span>Standard GATT Heart Rate Profile (0x180D)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 font-bold rounded-xl text-slate-200 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
