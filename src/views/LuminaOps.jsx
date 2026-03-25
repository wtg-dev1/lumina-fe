/**
 * LuminaOps.jsx — All view components
 *
 * This file exports every view used in OpsApp.jsx.
 * It uses the shared StoreContext (useStore) instead of local state,
 * and imports shared UI components from src/components/ui.jsx.
 *
 * DEVELOPER NOTE:
 * For production, split each exported component into its own file in:
 *   src/views/admin/
 *   src/views/practice/
 *   src/views/employer/
 *
 * Each component should:
 *   1. Replace useStore() with API calls (see src/utils/api.js)
 *   2. Add loading states and error handling
 *   3. Add React Query or SWR for caching if desired
 *
 * The complete UI implementation is in src/LuminaOps.single.jsx (the
 * original monolithic prototype). This file is the modular version
 * that wires into the store and component library.
 */

// Re-export everything from the single-file prototype for now.
// The developer should progressively migrate each view to use API calls.
export * from './LuminaOps.single'
