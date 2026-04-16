import React, { useEffect, useState } from 'react'
import { C } from '../../utils/constants'
import { useOrgStore } from '../../data/stores'
import api from '../../utils/api'
import { SH, Btn, Inp, Sel, Modal, ConfirmModal, Badge, TH, TD } from '../../components/ui'

const PAGE_SIZE = 15

const USER_TYPE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'practice', label: 'Practice' },
  { value: 'employer', label: 'Employer' },
]

const normalizeUser = (row = {}) => ({
  id: row.id,
  username: row.username ?? '',
  email: row.email ?? '',
  user_type: row.user_type ?? row.userType ?? 'practice',
  practice_id: row.practice_id ?? row.practiceId ?? null,
  employer_id: row.employer_id ?? row.employerId ?? null,
  is_active: row.is_active !== false && row.isActive !== false,
  created_at: row.created_at ?? row.createdAt ?? '',
  updated_at: row.updated_at ?? row.updatedAt ?? '',
})

export default function UsersView() {
  const org = useOrgStore()
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    total_pages: 1,
  })
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [modal, setModal] = useState(null)
  const [confirmUserId, setConfirmUserId] = useState('')
  const [deletingUserId, setDeletingUserId] = useState('')
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    user_type: 'practice',
    practice_id: '',
    employer_id: '',
  })
  const [editForm, setEditForm] = useState({ username: '', email: '' })
  const [formError, setFormError] = useState('')

  const formatApiError = (e, fallback) => {
    if (Array.isArray(e?.data?.errors) && e.data.errors.length > 0) {
      return e.data.errors.map((msg) => String(msg)).join(' - ')
    }
    return e?.message || fallback
  }

  const loadPage = async (page = 1) => {
    setLoading(true)
    setApiError('')
    try {
      const response = await api.users.list({ page, limit: PAGE_SIZE })
      const raw = Array.isArray(response?.data) ? response.data : []
      let nextItems = raw.map(normalizeUser)
      const meta = response?.meta || {}
      let nextPage = Number(meta.page || page)
      const totalPages = Math.max(1, Number(meta.total_pages || 1))
      const total = Number(meta.total || nextItems.length)

      if (nextItems.length === 0 && nextPage > 1 && total > 0) {
        const retryPage = nextPage - 1
        const retryRes = await api.users.list({ page: retryPage, limit: PAGE_SIZE })
        const retryRaw = Array.isArray(retryRes?.data) ? retryRes.data : []
        nextItems = retryRaw.map(normalizeUser)
        const retryMeta = retryRes?.meta || {}
        nextPage = Number(retryMeta.page || retryPage)
        setPagination({
          page: nextPage,
          limit: Number(retryMeta.page_size || PAGE_SIZE),
          total: Number(retryMeta.total || nextItems.length),
          total_pages: Math.max(1, Number(retryMeta.total_pages || 1)),
        })
        setItems(nextItems)
        return
      }

      setPagination({
        page: nextPage,
        limit: Number(meta.page_size || PAGE_SIZE),
        total,
        total_pages: totalPages,
      })
      setItems(nextItems)
    } catch (e) {
      setApiError(formatApiError(e, 'Failed to load users.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    org.ensureSummaryLoaded()
    loadPage(1)
  }, [org.ensureSummaryLoaded])

  const openCreate = () => {
    setFormError('')
    setCreateForm({
      username: '',
      email: '',
      password: '',
      password_confirmation: '',
      user_type: 'practice',
      practice_id: '',
      employer_id: '',
    })
    setModal({ mode: 'create' })
  }

  const openEdit = (user) => {
    setFormError('')
    setEditForm({
      username: user?.username || '',
      email: user?.email || '',
    })
    setModal({ mode: 'edit', user })
  }

  const saveCreate = async () => {
    setFormError('')
    if (createForm.password !== createForm.password_confirmation) {
      setFormError('Password confirmation must match password.')
      return
    }
    if (createForm.user_type === 'practice' && !createForm.practice_id) {
      setFormError('Select a practice for this user.')
      return
    }
    if (createForm.user_type === 'employer' && !createForm.employer_id) {
      setFormError('Select an employer for this user.')
      return
    }

    const payload = {
      username: createForm.username.trim(),
      email: createForm.email.trim(),
      password: createForm.password,
      password_confirmation: createForm.password_confirmation,
      user_type: createForm.user_type,
    }
    if (createForm.user_type === 'practice') {
      payload.practice_id = createForm.practice_id
    }
    if (createForm.user_type === 'employer') {
      payload.employer_id = createForm.employer_id
    }

    try {
      await api.users.create(payload)
      setModal(null)
      await loadPage(1)
    } catch (e) {
      setFormError(formatApiError(e, 'Failed to create user.'))
    }
  }

  const saveEdit = async () => {
    setFormError('')
    if (!modal?.user?.id) return
    try {
      await api.users.update(modal.user.id, {
        username: editForm.username.trim(),
        email: editForm.email.trim(),
      })
      setModal(null)
      await loadPage(pagination.page)
    } catch (e) {
      setFormError(formatApiError(e, 'Failed to update user.'))
    }
  }

  const confirmDeleteUser = async () => {
    if (!confirmUserId) return
    setApiError('')
    try {
      setDeletingUserId(confirmUserId)
      await api.users.delete(confirmUserId)
      await loadPage(pagination.page)
    } catch (e) {
      setApiError(formatApiError(e, 'Failed to delete user.'))
    } finally {
      setDeletingUserId('')
      setConfirmUserId('')
    }
  }

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }
  const typeLabel = (t) => USER_TYPE_OPTIONS.find((o) => o.value === t)?.label || t

  const practicesList = Array.isArray(org.practices) ? org.practices : []
  const employersList = Array.isArray(org.employers) ? org.employers : []

  const createOrgSatisfied =
    createForm.user_type === 'admin'
    || (createForm.user_type === 'practice' && Boolean(createForm.practice_id))
    || (createForm.user_type === 'employer' && Boolean(createForm.employer_id))

  return (
    <div>
      <SH
        title="Users"
        sub={`${pagination.total} accounts · admin permissions required`}
        action={<Btn onClick={openCreate}>+ Add User</Btn>}
      />
      {(apiError || org.error) && (
        <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'9px 12px', fontSize:12, color:'#B03A3A', marginBottom:12 }}>
          {apiError || org.error}
        </div>
      )}

      <div style={card}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background:C.cream }}>
              {[
                ['Username'],
                ['Email'],
                ['Type'],
                ['Status'],
                ['Created'],
                ['Actions', true],
              ].map(([h, r], i) => (
                <th key={i} style={{ ...TH, textAlign: r ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ ...TD(false), color: C.textMid, fontSize: 12 }}>Loading users…</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...TD(false), color: C.textMid, fontSize: 12 }}>No users found.</td>
              </tr>
            ) : (
              items.map((u, i) => (
                <tr key={u.id} style={{ background: i % 2 === 1 ? C.bgPage : C.white }}>
                  <td style={{ ...TD(false), fontWeight: 600 }}>{u.username}</td>
                  <td style={TD(false)}>{u.email}</td>
                  <td style={TD(false)}>{typeLabel(u.user_type)}</td>
                  <td style={TD(false)}>
                    {u.is_active ? (
                      <Badge status="active" />
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.textMid }}>Inactive</span>
                    )}
                  </td>
                  <td style={{ ...TD(false), fontSize: 11, color: C.textMid }}>
                    {u.created_at ? new Date(u.created_at).toLocaleString() : '—'}
                  </td>
                  <td style={TD(true)}>
                    <Btn variant="ghost" small onClick={() => openEdit(u)}>Edit</Btn>
                    <Btn variant="ghost" small onClick={() => setConfirmUserId(u.id)}>Delete</Btn>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={{ padding: '12px 14px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

      {modal?.mode === 'create' && (
        <Modal title="Add User" onClose={() => { setModal(null); setFormError('') }}>
          {formError && (
            <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'9px 12px', fontSize:12, color:'#B03A3A', marginBottom:12 }}>
              {formError}
            </div>
          )}
          <Inp
            label="Username"
            value={createForm.username}
            onChange={(e) => setCreateForm((f) => ({ ...f, username: e.target.value }))}
            placeholder="johndoe"
          />
          <Inp
            label="Email"
            type="email"
            value={createForm.email}
            onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="john@example.com"
          />
          <Sel
            label="User type"
            value={createForm.user_type}
            onChange={(e) => {
              const user_type = e.target.value
              setCreateForm((f) => ({
                ...f,
                user_type,
                practice_id: user_type === 'practice' ? f.practice_id : '',
                employer_id: user_type === 'employer' ? f.employer_id : '',
              }))
            }}
            options={USER_TYPE_OPTIONS}
          />
          {createForm.user_type === 'practice' && (
            <Sel
              label="Practice"
              value={createForm.practice_id}
              onChange={(e) => setCreateForm((f) => ({ ...f, practice_id: e.target.value }))}
              options={[
                { value: '', label: 'Select practice…' },
                ...practicesList.map((p) => ({ value: p.id, label: p.name || p.id })),
              ]}
            />
          )}
          {createForm.user_type === 'employer' && (
            <Sel
              label="Employer"
              value={createForm.employer_id}
              onChange={(e) => setCreateForm((f) => ({ ...f, employer_id: e.target.value }))}
              options={[
                { value: '', label: 'Select employer…' },
                ...employersList.map((em) => ({ value: em.id, label: em.name || em.id })),
              ]}
            />
          )}
          <Inp
            label="Password"
            type="password"
            value={createForm.password}
            onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
          />
          <Inp
            label="Confirm password"
            type="password"
            value={createForm.password_confirmation}
            onChange={(e) => setCreateForm((f) => ({ ...f, password_confirmation: e.target.value }))}
          />
          <Btn
            onClick={saveCreate}
            disabled={
              !createForm.username.trim()
              || !createForm.email.trim()
              || !createForm.password
              || !createForm.password_confirmation
              || !createOrgSatisfied
            }
          >
            Create User
          </Btn>
        </Modal>
      )}

      {modal?.mode === 'edit' && modal.user && (
        <Modal title="Edit User" onClose={() => { setModal(null); setFormError('') }}>
          {formError && (
            <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'9px 12px', fontSize:12, color:'#B03A3A', marginBottom:12 }}>
              {formError}
            </div>
          )}
          <Inp
            label="Username"
            value={editForm.username}
            onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
          />
          <Inp
            label="Email"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
          />
          <div style={{ fontSize: 11, color: C.textMid, marginBottom: 12 }}>
            Type: {typeLabel(modal.user.user_type)} · Password changes are not available in this form.
          </div>
          <Btn onClick={saveEdit} disabled={!editForm.username.trim() || !editForm.email.trim()}>
            Save Changes
          </Btn>
        </Modal>
      )}

      <ConfirmModal
        open={Boolean(confirmUserId)}
        title="Delete User"
        message="Delete this user? This cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setConfirmUserId('')}
        onConfirm={confirmDeleteUser}
        busy={deletingUserId === confirmUserId}
      />
    </div>
  )
}
