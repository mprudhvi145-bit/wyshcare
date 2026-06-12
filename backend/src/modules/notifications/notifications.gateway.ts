/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/notifications/notifications.gateway.ts
 *
 * Product:
 * WyshCare Healthcare Operating System
 *
 * Brand:
 * WYSH
 *
 * Founder:
 * Vimarshak Prudhvi
 *
 * Purpose:
 * WebSocket gateway: handles real-time communication
 *
 * Responsibilities:
 * - Manage WebSocket connections and events
 * - Broadcast real-time updates to connected clients
 *
 * Used By:
 - Standalone (not imported by other source files)
 *
 * Calls:
 - socket.io
 - websockets
 *
 * Dependencies:
 - socket.io
 - websockets
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Real-time
 *
 * Last Reviewed:
2026-06-12
 *
 * ============================================================================
 * (c) Wysh Technologies
 * Built by Vimarshak Prudhvi
 * All Rights Reserved
 * ============================================================================
 */

import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/notifications', cors: { origin: '*' } })
export class NotificationsGateway {
  @WebSocketServer()
  server!: Server;

  emitUserNotification(userId: string, payload: Record<string, unknown>) {
    this.server.emit(`user:${userId}`, payload);
  }
}
