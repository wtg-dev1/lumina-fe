import React, { useEffect, useState } from 'react'
import { C } from '../../utils/constants'
import { useOrgStore } from '../../data/stores'
import { SH, Btn, Inp, Sel, Modal, ConfirmModal } from '../../components/ui'

const PAGE_SIZE = 15

export default function PracticeCliniciansView({ practiceId }) {
  const org = useOrgStore()
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, total_pages: 1 })
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [modal, setModal] = useState(null) // { mode, clinician }
  const [confirmClinicianId, setConfirmClinicianId] = useState('')
  const [deletingClinicianId, setDeletingClinicianId] = useState('')
  const [form, setForm] = useState({ name: '', credential: '', specialty: '', active: 'true' })
  const [formError, setFormError] = useState('')

  const formatApiError = (e, fallback) => {
    if (Array.isArray(e?.data?.errors) && e.data.errors.length > 0) {
      return e.data.errors.map((msg) => String(msg)).join(' - ')
    }
    return e?.message || fallback
  }

  const loadPage = async (page = 1) => {
    if (!practiceId) return
    setLoading(true)
    setApiError('')
    try {
      const response = await org.load_clinicians_page({ practiceId, page, limit: PAGE_SIZE })
      setItems(response?.items || [])
      setPagination(response?.pagination || { page, limit: PAGE_SIZE, total: 0, total_pages: 1 })
    } catch (e) {
      setApiError(formatApiError(e, 'Failed to load clinicians.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    org.ensureSummaryLoaded()
    loadPage(1)
  }, [practiceId, org.ensureSummaryLoaded])

  const openCreate = () => {
    setFormError('')
    setForm({ name: '', credential: '', specialty: '', active: 'true' })
    setModal({ mode: 'create', clinician: null })
  }

  const openEdit = (clinician) => {
    setFormError('')
    setForm({
      name: clinician?.name || '',
      credential: clinician?.credential || '',
      specialty: clinician?.specialty || '',
      active: String(clinician?.active !== false),
    })
    setModal({ mode: 'edit', clinician })
  }

  const saveClinician = async () => {
    setFormError('')
    const payload = {
      practice_id: practiceId,
      name: form.name.trim(),
      credential: form.credential.trim(),
      specialty: form.specialty.trim(),
    }
    try {
      if (modal.mode === 'edit') {
        await org.updateClinician({
          ...payload,
          id: modal.clinician.id,
          active: form.active === 'true',
        })
      } else {
        await org.addClinician(payload)
      }
      setModal(null)
      await loadPage(pagination.page)
    } catch (e) {
      setFormError(formatApiError(e, `Failed to ${modal.mode === 'edit' ? 'update' : 'add'} clinician.`))
    }
  }

  const askDeleteClinician = (clinicianId) => {
    setConfirmClinicianId(clinicianId)
  }

  const confirmDeleteClinician = async () => {
    if (!confirmClinicianId) return
    setApiError('')
    try {
      setDeletingClinicianId(confirmClinicianId)
      await org.deleteClinician({ practice_id: practiceId, id: confirmClinicianId })
      const nextPage = Math.min(pagination.page, Math.max(1, pagination.total_pages))
      await loadPage(nextPage)
    } catch (e) {
      setApiError(formatApiError(e, 'Failed to delete clinician.'))
    } finally {
      setDeletingClinicianId('')
      setConfirmClinicianId('')
    }
  }

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }
  const practice = org.practices.find((p) => p.id === practiceId)

  return (
    <div>
      <SH
        title="My Clinicians"
        sub={practice ? `${practice.name} · ${pagination.total} total` : `${pagination.total} total`}
        action={<Btn onClick={openCreate}>+ Add Clinician</Btn>}
      />
      {(apiError || org.error) && (
        <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'9px 12px', fontSize:12, color:'#B03A3A', marginBottom:12 }}>
          {apiError || org.error}
        </div>
      )}

      <div style={{ ...card, padding: 16 }}>
        {loading ? (
          <div style={{ color: C.textMid, fontSize: 13 }}>Loading clinicians...</div>
        ) : items.length === 0 ? (
          <div style={{ color: C.textMid, fontSize: 13 }}>No clinicians found for this practice.</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {items.map((clinician) => (
              <div
                key={clinician.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                  background: C.cream,
                  border: `1px solid ${C.border}`,
                  borderRadius: 4,
                  padding: '8px 10px',
                }}
              >
                <div style={{ fontSize: 12, color: C.textDark }}>
                  <strong>{clinician.name}</strong>
                  {clinician.credential ? ` · ${clinician.credential}` : ''}
                  {clinician.specialty ? ` · ${clinician.specialty}` : ''}
                  {clinician.active === false ? ' · Inactive' : ''}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn variant="ghost" small onClick={() => openEdit(clinician)}>Edit</Btn>
                  <Btn variant="ghost" small onClick={() => askDeleteClinician(clinician.id)}>Delete</Btn>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: C.textMid }}>
            Page {pagination.page} of {pagination.total_pages}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn
              variant="ghost"
              small
              onClick={() => loadPage(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1 || loading}
            >
              Prev
            </Btn>
            <Btn
              variant="ghost"
              small
              onClick={() => loadPage(Math.min(pagination.total_pages, pagination.page + 1))}
              disabled={pagination.page >= pagination.total_pages || loading}
            >
              Next
            </Btn>
          </div>
        </div>
      </div>

      {modal && (
        <Modal title={modal.mode === 'edit' ? 'Edit Clinician' : 'Add Clinician'} onClose={() => { setModal(null); setFormError('') }}>
          {formError && (
            <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'9px 12px', fontSize:12, color:'#B03A3A', marginBottom:12 }}>
              {formError}
            </div>
          )}
          <Inp label="Clinician Name" value={form.name} onChange={e => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Dr. Jane Smith"/>
          <Inp label="Credential (optional)" value={form.credential} onChange={e => setForm((f) => ({ ...f, credential: e.target.value }))} placeholder="LCSW"/>
          <Inp label="Specialty (optional)" value={form.specialty} onChange={e => setForm((f) => ({ ...f, specialty: e.target.value }))} placeholder="Anxiety"/>
          {modal.mode === 'edit' && (
            <Sel
              label="Status"
              value={form.active}
              onChange={e => setForm((f) => ({ ...f, active: e.target.value }))}
              options={[
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
              ]}
            />
          )}
          <Btn onClick={saveClinician} disabled={!form.name.trim()}>
            {modal.mode === 'edit' ? 'Save Changes' : 'Add Clinician'}
          </Btn>
        </Modal>
      )}

      <ConfirmModal
        open={Boolean(confirmClinicianId)}
        title="Delete Clinician"
        message="Delete this clinician? This action cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setConfirmClinicianId('')}
        onConfirm={confirmDeleteClinician}
        busy={deletingClinicianId === confirmClinicianId}
      />
    </div>
  )
}
