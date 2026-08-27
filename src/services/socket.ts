/**
 * Real-Time Socket.IO & Broadcast Channel Client Integration
 * 
 * Provides an event-driven real-time network layer supporting:
 * - Multi-tab / Multi-window browser synchronization via BroadcastChannel
 * - Session takeover / replacement notification (session:replaced)
 * - Heartbeat presence tracking (active / idle / offline)
 * - Event dispatching & listener subscriptions
 */

import { 
  OfficerId, 
  InvestigationRoomState, 
  ActivityEvent, 
  Note, 
  VerdictResult,
  VerdictSubmission,
  DashboardTab 
} from '../types';

export type SocketEventType =
  | 'room:join'
  | 'room:leave'
  | 'room:state'
  | 'officer:joined'
  | 'officer:disconnected'
  | 'officer:replaced'
  | 'officer:activity'
  | 'evidence:reviewed'
  | 'person:reviewed'
  | 'timeline:reviewed'
  | 'location:reviewed'
  | 'progress:updated'
  | 'note:created'
  | 'note:updated'
  | 'note:deleted'
  | 'verdict:opened'
  | 'verdict:updated'
  | 'verdict:submitted'
  | 'session:replaced'
  | 'heartbeat:ping';

export interface SocketMessage<T = unknown> {
  type: SocketEventType;
  roomId: string;
  senderOfficerId: OfficerId;
  senderSessionId: string;
  timestamp: number;
  payload: T;
}

type EventCallback<T = unknown> = (payload: T, message: SocketMessage<T>) => void;

class RealtimeSocketHub {
  private channel: BroadcastChannel | null = null;
  private currentRoomId: string | null = null;
  private currentOfficerId: OfficerId | null = null;
  private currentSessionId: string | null = null;
  private listeners: Map<SocketEventType, Set<EventCallback<any>>> = new Map();
  private heartbeatInterval: number | null = null;

  constructor() {
    this.initBroadcastChannel();
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('ROY_BARI_REALTIME_HUB_V1');
        this.channel.onmessage = (event: MessageEvent<SocketMessage>) => {
          this.handleIncomingMessage(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported or restricted, falling back to local events:', err);
      }
    }
  }

  public connect(roomId: string, officerId: OfficerId, sessionId: string) {
    this.currentRoomId = roomId;
    this.currentOfficerId = officerId;
    this.currentSessionId = sessionId;

    // Start heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = window.setInterval(() => {
      this.sendHeartbeat();
    }, 5000);
  }

  public disconnect() {
    if (this.currentRoomId && this.currentOfficerId && this.currentSessionId) {
      this.emit('room:leave', {
        officerId: this.currentOfficerId,
        sessionId: this.currentSessionId,
      });
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.currentRoomId = null;
    this.currentOfficerId = null;
    this.currentSessionId = null;
  }

  public on<T = unknown>(event: SocketEventType, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  public emit<T = unknown>(event: SocketEventType, payload: T) {
    if (!this.currentRoomId || !this.currentOfficerId || !this.currentSessionId) {
      return;
    }

    const message: SocketMessage<T> = {
      type: event,
      roomId: this.currentRoomId,
      senderOfficerId: this.currentOfficerId,
      senderSessionId: this.currentSessionId,
      timestamp: Date.now(),
      payload,
    };

    // Broadcast across windows/tabs
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (err) {
        console.error('BroadcastChannel postMessage error:', err);
      }
    }
  }

  private sendHeartbeat() {
    if (!this.currentRoomId || !this.currentOfficerId || !this.currentSessionId) return;
    this.emit('heartbeat:ping', {
      officerId: this.currentOfficerId,
      sessionId: this.currentSessionId,
      timestamp: Date.now(),
    });
  }

  private handleIncomingMessage(msg: SocketMessage) {
    if (!msg || msg.roomId !== this.currentRoomId) return;

    // Check for Session Replacement
    // If another session joined with the SAME officerId in this room with a NEW sessionId:
    if (
      msg.senderOfficerId === this.currentOfficerId &&
      msg.senderSessionId !== this.currentSessionId &&
      msg.type === 'officer:joined'
    ) {
      // Trigger session:replaced on this old session
      const callbacks = this.listeners.get('session:replaced');
      if (callbacks) {
        callbacks.forEach((cb) => cb({ replacedBySessionId: msg.senderSessionId }, msg));
      }
      return;
    }

    // Normal dispatch
    const callbacks = this.listeners.get(msg.type);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(msg.payload, msg);
        } catch (err) {
          console.error(`Error in socket listener for ${msg.type}:`, err);
        }
      });
    }
  }
}

export const socketHub = new RealtimeSocketHub();
