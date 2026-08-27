import React, { useState } from 'react';
import { 
  Clock, 
  AlertCircle, 
  MapPin, 
  FolderArchive, 
  Users, 
  Sparkles, 
  Zap, 
  Flame, 
  Car, 
  PhoneCall,
  ChevronRight
} from 'lucide-react';
import { TIMELINE_EVENTS, EVIDENCE_ITEMS, SUSPECTS } from '../data/caseData';
import { TimelineEvent } from '../types';
import { playSound } from '../utils/sound';

interface TimelineSectionProps {
  onOpenEvidence: (evidenceCode: string) => void;
  onOpenPerson: (personId: string) => void;
  onRecordTimelineViewed: (timelineId: string) => void;
  viewedTimelineIds: string[];
  viewedEvidenceIds: string[];
  soundEnabled: boolean;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({
  onOpenEvidence,
  onOpenPerson,
  onRecordTimelineViewed,
  viewedTimelineIds,
  viewedEvidenceIds,
  soundEnabled,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const handleSelectEvent = (event: TimelineEvent) => {
    playSound('click', soundEnabled);
    setSelectedEvent(event);
    onRecordTimelineViewed(event.id);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MOVEMENT':
        return <Car className="w-4 h-4 text-blue-400" />;
      case 'INFRASTRUCTURE':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'INCIDENT':
        return <Flame className="w-4 h-4 text-red-400" />;
      case 'RESPONSE':
        return <PhoneCall className="w-4 h-4 text-emerald-400" />;
      default:
        return <Clock className="w-4 h-4 text-neutral-400" />;
    }
  };

  // Check if both Ritam GPS (E001 or t-0350) and Fire Start (E002 or t-0358) have been reviewed
  const hasReviewedGPS = viewedEvidenceIds.includes('E001') || viewedTimelineIds.includes('t-0350');
  const hasReviewedFire = viewedEvidenceIds.includes('E002') || viewedTimelineIds.includes('t-0358');
  const showDiscrepancyBanner = hasReviewedGPS && hasReviewedFire;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-neutral-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            CRITICAL INCIDENT TIMELINE
          </h2>
          <p className="text-xs font-mono text-neutral-400">
            NIGHT OF 13-14 MAY 2026 // CHRONOLOGICAL SEQUENCE
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>8 VERIFIED TELEMETRIC MILESTONES</span>
        </div>
      </div>

      {/* Discrepancy Alert Banner */}
      {showDiscrepancyBanner && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/50 flex items-start gap-3 shadow-lg shadow-amber-950/20">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">
              NEW CASE INCONSISTENCY IDENTIFIED
            </span>
            <p className="text-xs font-mono text-neutral-200 leading-relaxed">
              &ldquo;Ritam&apos;s mobile device left Roy Bari Estate at 03:50 AM, approximately eight minutes before the estimated 03:58 AM start of the fire.&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Timeline Layout: Left Visual Track, Right Event Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Chronological Nodes */}
        <div className="lg:col-span-7 space-y-3">
          {TIMELINE_EVENTS.map((evt, idx) => {
            const isSelected = selectedEvent?.id === evt.id;
            const isViewed = viewedTimelineIds.includes(evt.id);

            return (
              <div
                key={evt.id}
                onClick={() => handleSelectEvent(evt)}
                className={`group relative rounded-xl border p-4 transition-all duration-150 cursor-pointer flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-neutral-800/90 border-amber-400/80 shadow-lg shadow-amber-950/30'
                    : isViewed
                    ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                    : 'bg-neutral-900/90 border-amber-500/30 hover:border-amber-400/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Time Badge */}
                  <div className="w-20 sm:w-24 text-center shrink-0">
                    <span className="font-mono text-sm sm:text-base font-bold text-amber-400 block">
                      {evt.time}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block">
                      {evt.category}
                    </span>
                  </div>

                  {/* Divider Icon */}
                  <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 shrink-0">
                    {getCategoryIcon(evt.category)}
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h3 className="text-sm font-bold font-serif text-neutral-100 group-hover:text-amber-300 transition">
                      {evt.title}
                    </h3>
                    <p className="text-xs font-mono text-neutral-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-neutral-500" />
                      {evt.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {evt.isCriticalDiscrepancy && (
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-mono bg-red-950/60 text-red-400 border border-red-500/30">
                      CRITICAL
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Event Deep Dive Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 backdrop-blur-md">
            {selectedEvent ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="font-mono text-base font-bold text-amber-400">
                      {selectedEvent.dateTimeStr}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300">
                    {selectedEvent.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold font-serif text-neutral-100 mb-2">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-xs font-mono text-neutral-400 flex items-center gap-1 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                    {selectedEvent.location}
                  </p>
                  <p className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 text-neutral-300 text-xs font-mono leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>

                {/* Associated Evidence */}
                {selectedEvent.associatedEvidenceIds.length > 0 && (
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2 flex items-center gap-2">
                      <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
                      CORROBORATING EVIDENCE
                    </h4>
                    <div className="space-y-1.5">
                      {selectedEvent.associatedEvidenceIds.map((code) => {
                        const ev = EVIDENCE_ITEMS.find((e) => e.code === code || e.id === code);
                        return (
                          <button
                            key={code}
                            onClick={() => {
                              playSound('click', soundEnabled);
                              onOpenEvidence(code);
                            }}
                            className="w-full p-2.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-left text-xs font-mono text-neutral-200 flex items-center justify-between group transition cursor-pointer"
                          >
                            <span className="truncate">
                              <strong className="text-amber-400 mr-2">{code}</strong>
                              {ev?.title}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400 shrink-0 ml-2" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Associated Suspects */}
                {selectedEvent.associatedPeopleIds.length > 0 && (
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      INDIVIDUALS PRESENT / INVOLVED
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.associatedPeopleIds.map((pId) => {
                        const person = SUSPECTS.find((s) => s.id === pId);
                        if (!person) return null;
                        return (
                          <button
                            key={pId}
                            onClick={() => {
                              playSound('click', soundEnabled);
                              onOpenPerson(pId);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-300 flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <span className={`w-2 h-2 rounded-full ${person.avatarStyle.badgeColor}`} />
                            <span>{person.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-neutral-500 space-y-2">
                <Clock className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
                <p className="font-mono text-xs uppercase tracking-wider">Select a timeline milestone</p>
                <p className="text-[11px] font-sans">Click on any event on the left to inspect telemetric details and cross-references.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
