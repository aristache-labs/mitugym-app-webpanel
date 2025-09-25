"use server";

// Re-export all actions from their respective modules
// This maintains backward compatibility while organizing code better

// Action utilities and types
export type { ActionResult, BookingWithRelations } from "./lib/action-utils";

// Member actions
export { 
  createMemberAction, 
  updateMemberAction 
} from "./members/actions";

// Plan actions
export { 
  createPlanAction, 
  updatePlanAction, 
  deletePlanAction 
} from "./plans/actions";

// Service actions
export { 
  createServiceAction, 
  updateServiceAction, 
  deleteServiceAction,
  createServiceBookingAction,
  updateServiceBookingAction,
  deleteServiceBookingAction,
  cancelServiceBookingAction
} from "./services/actions";

// Purchased service actions
export {
  approvePurchasedServiceAction,
  cancelPurchasedServiceAction,
  deletePurchasedServiceAction,
  createPurchasedServiceAction
} from "./services/purchased-services-actions";

// Session booking actions
export {
  confirmSessionBookingAction,
  completeSessionBookingAction,
  cancelSessionBookingAction
} from "./services/session-booking-actions";

// System actions (auth, schedule, news, checkins, audit logs)
export {
  signOutAction,
  saveScheduleAction,
  createNewsAction,
  updateNewsAction,
  deleteNewsAction,
  manualCheckoutAction,
  clearAuditLogsAction
} from "./system/actions";
