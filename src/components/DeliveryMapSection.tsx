import React, { useCallback, useEffect, useState } from 'react';
import {
  AdvancedMarker,
  APIProvider,
  APILoadingStatus,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useApiLoadingStatus,
  useMap,
} from '@vis.gl/react-google-maps';
import { Clock, MapPin, Navigation, PackageCheck, Truck } from 'lucide-react';
import { Badge } from './ui/badge';

interface HubLocation {
  id: string;
  city: string;
  hubName: string;
  role: 'Flagship Lab' | 'Dispatch Hub';
  position: { lat: number; lng: number };
  etaLabel: string;
  courierPartner: string;
  coverageNote: string;
}

const INDIA_HUBS: HubLocation[] = [
  {
    id: 'hub-surat',
    city: 'Surat, Gujarat',
    hubName: 'Apna3DShop Flagship Print Lab',
    role: 'Flagship Lab',
    position: { lat: 21.1702, lng: 72.8311 },
    etaLabel: 'Same-day local pickup · 24h dispatch',
    courierPartner: 'Workshop Direct & BlueDart Air',
    coverageNote: 'Main 24-printer FDM & Resin production farm + QA desk.',
  },
  {
    id: 'hub-mumbai',
    city: 'Mumbai, Maharashtra',
    hubName: 'Mumbai West Express Hub',
    role: 'Dispatch Hub',
    position: { lat: 19.076, lng: 72.8777 },
    etaLabel: '1–2 business days',
    courierPartner: 'BlueDart Express Surface',
    coverageNote: 'Covers Mumbai, Thane, Navi Mumbai & Pune corridor.',
  },
  {
    id: 'hub-delhi',
    city: 'New Delhi / NCR',
    hubName: 'Delhi NCR North Sorting Hub',
    role: 'Dispatch Hub',
    position: { lat: 28.6139, lng: 77.209 },
    etaLabel: '2–3 business days',
    courierPartner: 'BlueDart Air Priority',
    coverageNote: 'Covers Delhi, Gurugram, Noida, Chandigarh & North PINs.',
  },
  {
    id: 'hub-bengaluru',
    city: 'Bengaluru, Karnataka',
    hubName: 'Bengaluru Maker Tech Hub',
    role: 'Dispatch Hub',
    position: { lat: 12.9716, lng: 77.5946 },
    etaLabel: '2–3 business days',
    courierPartner: 'Delhivery Air Express',
    coverageNote: 'Covers Bengaluru, Mysuru, Chennai & South PIN codes.',
  },
  {
    id: 'hub-hyderabad',
    city: 'Hyderabad, Telangana',
    hubName: 'Hyderabad Deccan Hub',
    role: 'Dispatch Hub',
    position: { lat: 17.385, lng: 78.4867 },
    etaLabel: '2–3 business days',
    courierPartner: 'Delhivery Express',
    coverageNote: 'Fast fulfillment across Telangana & Andhra Pradesh.',
  },
  {
    id: 'hub-kolkata',
    city: 'Kolkata, West Bengal',
    hubName: 'Kolkata East Corridor Hub',
    role: 'Dispatch Hub',
    position: { lat: 22.5726, lng: 88.3639 },
    etaLabel: '3–4 business days',
    courierPartner: 'BlueDart & India Post Speed',
    coverageNote: 'Covers Eastern India & North-East regional hubs.',
  },
];

type MarkerAnchor = React.ComponentProps<typeof InfoWindow>['anchor'];

function useHubMarkerRef() {
  const [marker, setMarker] = useState<MarkerAnchor>(null);
  const refCallback = useCallback((m: MarkerAnchor) => {
    setMarker(m);
  }, []);
  return [refCallback, marker] as const;
}

const HubMarker: React.FC<{
  hub: HubLocation;
  isSelected: boolean;
  onSelect: (hub: HubLocation) => void;
}> = ({ hub, isSelected, onSelect }) => {
  const [markerRef, marker] = useHubMarkerRef();
  const isLab = hub.role === 'Flagship Lab';

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={hub.position}
        onClick={() => onSelect(hub)}
        title={`${hub.hubName} (${hub.city})`}
      >
        <Pin
          background={isLab ? '#C8232C' : isSelected ? '#0B1727' : '#1F6E72'}
          borderColor="#FFFFFF"
          glyphColor="#FFFFFF"
          scale={isLab ? 1.18 : isSelected ? 1.12 : 0.95}
        />
      </AdvancedMarker>

      {isSelected && marker && (
        <InfoWindow anchor={marker} onCloseClick={() => onSelect(hub)}>
          <div className="p-1 max-w-[230px] text-[#111827]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1F6E72]">
              {hub.role}
            </p>
            <p className="font-heading text-sm font-bold leading-snug mt-0.5">
              {hub.hubName}
            </p>
            <p className="text-xs text-[#64748B] mt-0.5">{hub.city}</p>
            <p className="text-xs font-semibold text-[#0E7C5B] mt-1.5">
              ETA: {hub.etaLabel}
            </p>
            <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">
              {hub.coverageNote}
            </p>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

const MapPanController: React.FC<{ selectedHub: HubLocation }> = ({
  selectedHub,
}) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.panTo(selectedHub.position);
  }, [map, selectedHub]);
  return null;
};

const MapCanvasInner: React.FC<{
  selectedHub: HubLocation;
  onSelectHub: (hub: HubLocation) => void;
  quotaExceeded: boolean;
}> = ({ selectedHub, onSelectHub, quotaExceeded }) => {
  const status = useApiLoadingStatus();

  if (
    quotaExceeded ||
    status === APILoadingStatus.FAILED ||
    status === APILoadingStatus.AUTH_FAILURE
  ) {
    return (
      <div className="w-full h-[400px] sm:h-[440px] rounded-[14px] border border-[#E5E7EB] bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <MapPin className="w-9 h-9 text-[#1F6E72] mb-2.5" aria-hidden="true" />
        <p className="font-heading text-base font-bold text-[#111827]">
          Selected Hub: {selectedHub.hubName}
        </p>
        <p className="text-sm text-[#64748B] mt-1 max-w-md">
          {selectedHub.city} · {selectedHub.etaLabel} via{' '}
          {selectedHub.courierPartner}. Interactive Google Map is temporarily unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] sm:h-[440px] rounded-[14px] overflow-hidden border border-[#E5E7EB]">
      <GoogleMap
        defaultCenter={{ lat: 21.5, lng: 78.9 }}
        defaultZoom={4.8}
        mapId="DEMO_MAP_ID"
        gestureHandling="cooperative"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '100%' }}
      >
        <MapPanController selectedHub={selectedHub} />
        {INDIA_HUBS.map((hub) => (
          <HubMarker
            key={hub.id}
            hub={hub}
            isSelected={hub.id === selectedHub.id}
            onSelect={onSelectHub}
          />
        ))}
      </GoogleMap>
    </div>
  );
};

export const DeliveryMapSection: React.FC<{ quotaExceeded?: boolean }> = ({
  quotaExceeded = false,
}) => {
  const [selectedHub, setSelectedHub] = useState<HubLocation>(INDIA_HUBS[0]);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  return (
    <section
      id="delivery-map"
      aria-labelledby="delivery-map-heading"
      className="bg-[#F8FAFC] border-t border-[#E5E7EB]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F6E72] mb-1.5">
              <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Interactive Workshop &amp; Dispatch Network</span>
            </div>
            <h2
              id="delivery-map-heading"
              className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]"
            >
              Pan-India 3D Print Hubs &amp; Delivery Map
            </h2>
            <p className="mt-1 text-sm sm:text-base text-[#64748B]">
              Select any city hub pin on Google Maps to inspect courier dispatch SLA and transit estimates from our Gujarat workshop.
            </p>
          </div>

          <Badge variant="outline" className="bg-white border-[#E5E7EB] text-[#111827] self-start md:self-auto">
            <Truck className="w-3.5 h-3.5 text-[#1F6E72] mr-1" aria-hidden="true" />
            <span>28,000+ PIN Codes Covered</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Map Canvas */}
          <div className="lg:col-span-7 bg-white rounded-[16px] border border-[#E5E7EB] p-3">
            {apiKey && !quotaExceeded ? (
              <APIProvider
                apiKey={apiKey}
                region="IN"
                language="en"
              >
                <MapCanvasInner
                  selectedHub={selectedHub}
                  onSelectHub={setSelectedHub}
                  quotaExceeded={quotaExceeded}
                />
              </APIProvider>
            ) : (
              <div className="w-full h-[400px] sm:h-[440px] rounded-[14px] border border-[#E5E7EB] bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
                <MapPin className="w-9 h-9 text-[#1F6E72] mb-2.5" aria-hidden="true" />
                <p className="font-heading text-base font-bold text-[#111827]">
                  {selectedHub.hubName}
                </p>
                <p className="text-sm text-[#64748B] mt-1 max-w-md">
                  {selectedHub.city} · {selectedHub.etaLabel} ·{' '}
                  {selectedHub.courierPartner}
                </p>
              </div>
            )}
          </div>

          {/* Hub Selector & Transit Breakdown */}
          <div className="lg:col-span-5 space-y-3">
            <div className="rounded-[16px] bg-white border border-[#E5E7EB] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#EBF5F5] text-[#1F6E72] px-2.5 py-0.5 text-[11px] font-semibold">
                    {selectedHub.role}
                  </span>
                  <h3 className="font-heading text-lg font-bold text-[#111827] mt-2">
                    {selectedHub.hubName}
                  </h3>
                  <p className="text-sm text-[#64748B]">{selectedHub.city}</p>
                </div>
                <PackageCheck className="w-6 h-6 text-[#1F6E72] shrink-0" aria-hidden="true" />
              </div>

              <div className="mt-4 pt-4 border-t border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-[10px] bg-[#F8FAFC] p-3 border border-[#E5E7EB]">
                  <p className="text-[#64748B] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#1F6E72]" aria-hidden="true" />
                    <span>Estimated Transit</span>
                  </p>
                  <p className="font-semibold text-[#111827] mt-1">
                    {selectedHub.etaLabel}
                  </p>
                </div>
                <div className="rounded-[10px] bg-[#F8FAFC] p-3 border border-[#E5E7EB]">
                  <p className="text-[#64748B] flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#1F6E72]" aria-hidden="true" />
                    <span>Courier Partner</span>
                  </p>
                  <p className="font-semibold text-[#111827] mt-1">
                    {selectedHub.courierPartner}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-[#64748B] leading-relaxed">
                {selectedHub.coverageNote}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {INDIA_HUBS.map((hub) => {
                const active = hub.id === selectedHub.id;
                return (
                  <button
                    key={hub.id}
                    type="button"
                    onClick={() => setSelectedHub(hub)}
                    className={`text-left rounded-[12px] p-3 border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#EBF5F5] border-[#1F6E72] text-[#111827]'
                        : 'bg-white border-[#E5E7EB] hover:border-[#9BBEC0] text-[#111827]'
                    }`}
                  >
                    <p className="text-xs font-bold truncate">{hub.city}</p>
                    <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                      {hub.etaLabel}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
