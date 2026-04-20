import React from 'react'
import { AuthStoreProvider, useAuthStore } from './authStore'
import { UiShellStoreProvider, useUiShellStore, SESSION_LOCK } from './uiShellStore'
import { OrgStoreProvider, useOrgStore } from './orgStore'
import { CareStoreProvider, useCareStore } from './careStore'
import { FinanceStoreProvider, useFinanceStore } from './financeStore'
import { PublicAssessmentStoreProvider, usePublicAssessmentStore } from './publicAssessmentStore'

export function OpsStoresProvider({ children }) {
  return (
    <AuthStoreProvider>
      <UiShellStoreProvider>
        <OrgStoreProvider>
          <CareStoreProvider>
            <FinanceStoreProvider>
              <PublicAssessmentStoreProvider>
                {children}
              </PublicAssessmentStoreProvider>
            </FinanceStoreProvider>
          </CareStoreProvider>
        </OrgStoreProvider>
      </UiShellStoreProvider>
    </AuthStoreProvider>
  )
}

export {
  useAuthStore,
  useUiShellStore,
  SESSION_LOCK,
  useOrgStore,
  useCareStore,
  useFinanceStore,
  usePublicAssessmentStore,
}
