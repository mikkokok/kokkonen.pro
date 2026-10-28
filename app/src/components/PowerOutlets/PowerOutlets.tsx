import {PlugSocketIcon} from '@hugeicons/core-free-icons';
import {Shelly1PMDeviceName} from '../../lib/shelly1pm/types/shelly1PMDeviceName';
import Shelly1PMRelayCard from '../Shelly1PM/Shelly1PMRelayCard';

export default function PowerOutlets() {
  return (
    <div className="p-6 space-y-6 w-full max-w-7xl mx-auto dark">
      <h1 className="text-3xl font-bold tracking-tight">Power outlets</h1>
      <Shelly1PMRelayCard
        deviceName={Shelly1PMDeviceName.OutdoorPowerOutlet}
        title="Outdoor power outlet"
        icon={PlugSocketIcon}
        onIconClassName="text-green-400"
      />
    </div>
  );
}
