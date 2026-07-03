import { useEffect, useState } from 'react'
import './App.css'

const API_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api/v1/user-details/'
).replace(/\/?$/, '/')

const ACTIVE_TAB = 'active'
const DELETED_TAB = 'deleted'
const DEFAULT_PAGE_SIZE = 5
const PAGE_SIZE_OPTIONS = [5, 10, 20]

const emptyForm = {
  name: '',
  age: '',
  gender: '',
}

function createListState() {
  return {
    users: [],
    count: 0,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages: 1,
    isLoading: true,
  }
}

function getListUrl(tab, page, pageSize) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  })

  if (tab === DELETED_TAB) {
    params.set('deleted', 'true')
  }

  return `${API_URL}?${params.toString()}`
}

function App() {
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [activeTab, setActiveTab] = useState(ACTIVE_TAB)
  const [lists, setLists] = useState({
    [ACTIVE_TAB]: createListState(),
    [DELETED_TAB]: createListState(),
  })
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [restoringId, setRestoringId] = useState(null)
  const [error, setError] = useState('')

  const currentList = lists[activeTab]
  const activeCount = lists[ACTIVE_TAB].count
  const deletedCount = lists[DELETED_TAB].count
  const visiblePages = getVisiblePages(currentList.page, currentList.totalPages)
  const saveButtonLabel = isSaving
    ? editingId
      ? 'Updating...'
      : 'Creating...'
    : editingId
      ? 'Update'
      : 'Create'

  async function loadUsers(tab, page, pageSize) {
    const requestedPage = Math.max(1, Number(page) || 1)
    const requestedPageSize = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE)
    const url = getListUrl(tab, requestedPage, requestedPageSize)

    setLists((currentLists) => ({
      ...currentLists,
      [tab]: {
        ...currentLists[tab],
        isLoading: true,
      },
    }))
    setError('')

    try {
      const response = await fetch(url)

      if (response.status === 404 && requestedPage > 1) {
        await loadUsers(tab, requestedPage - 1, requestedPageSize)
        return
      }

      if (!response.ok) {
        throw new Error('Could not load user details.')
      }

      const data = await response.json()
      const totalPages = Math.max(1, Math.ceil(data.count / requestedPageSize))

      setLists((currentLists) => ({
        ...currentLists,
        [tab]: {
          users: data.results,
          count: data.count,
          page: requestedPage,
          pageSize: requestedPageSize,
          totalPages,
          isLoading: false,
        },
      }))
    } catch (err) {
      setError(err.message)
      setLists((currentLists) => ({
        ...currentLists,
        [tab]: {
          ...currentLists[tab],
          isLoading: false,
        },
      }))
    }
  }

  useEffect(() => {
    loadUsers(ACTIVE_TAB, 1, DEFAULT_PAGE_SIZE)
    loadUsers(DELETED_TAB, 1, DEFAULT_PAGE_SIZE)
  }, [])

  function updateField(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function startEdit(user) {
    setActiveTab(ACTIVE_TAB)
    setEditingId(user.id)
    setForm({
      name: user.name,
      age: String(user.age),
      gender: user.gender,
    })
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
  }

  function selectTab(tab) {
    setActiveTab(tab)
    resetForm()
  }

  function changePageSize(event) {
    loadUsers(activeTab, 1, Number(event.target.value))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setError('')

    const url = editingId ? `${API_URL}${editingId}/` : API_URL
    const method = editingId ? 'PUT' : 'POST'
    const payload = buildUserPayload(form)

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(formatApiError(data))
      }

      resetForm()
      await loadUsers(
        ACTIVE_TAB,
        lists[ACTIVE_TAB].page,
        lists[ACTIVE_TAB].pageSize,
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteUser(userId) {
    setError('')
    setDeletingId(userId)

    try {
      const response = await fetch(`${API_URL}${userId}/`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Could not soft delete user detail.')
      }

      await loadUsers(
        ACTIVE_TAB,
        lists[ACTIVE_TAB].page,
        lists[ACTIVE_TAB].pageSize,
      )
      await loadUsers(DELETED_TAB, 1, lists[DELETED_TAB].pageSize)
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  async function restoreUser(userId) {
    setError('')
    setRestoringId(userId)

    try {
      const response = await fetch(`${API_URL}${userId}/undelete/`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Could not restore user detail.')
      }

      await loadUsers(DELETED_TAB, lists[DELETED_TAB].page, lists[DELETED_TAB].pageSize)
      await loadUsers(ACTIVE_TAB, 1, lists[ACTIVE_TAB].pageSize)
    } catch (err) {
      setError(err.message)
    } finally {
      setRestoringId(null)
    }
  }

  return (
    <main className="app-shell">
      <div className="topbar" aria-label="Application header">
        <span className="brand">User Details</span>
        <span>React</span>
        <span>DRF API</span>
      </div>

      <header className="page-header">
        <div>
          <p className="eyebrow">Records</p>
          <h1>User Details</h1>
        </div>
        <div className="summary">
          <span>{currentList.count}</span>
          <small>{activeTab === ACTIVE_TAB ? 'Active' : 'Deleted'} records</small>
        </div>
      </header>

      {error ? <p className="alert">{error}</p> : null}

      <nav className="tabs" aria-label="Record status tabs">
        <button
          type="button"
          className={activeTab === ACTIVE_TAB ? 'tab active' : 'tab'}
          onClick={() => selectTab(ACTIVE_TAB)}
        >
          Active Records
          <span>{activeCount}</span>
        </button>
        <button
          type="button"
          className={activeTab === DELETED_TAB ? 'tab active' : 'tab'}
          onClick={() => selectTab(DELETED_TAB)}
        >
          Deleted Records
          <span>{deletedCount}</span>
        </button>
      </nav>

      <section
        className={
          activeTab === ACTIVE_TAB ? 'workspace' : 'workspace deleted-workspace'
        }
        aria-label="User details workspace"
      >
        {activeTab === ACTIVE_TAB ? (
          <form className="editor" onSubmit={handleSubmit}>
            <div className="section-heading">
              <h2>{editingId ? 'Edit User' : 'Add User'}</h2>
            </div>

            <label>
              Name
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={updateField}
                placeholder="Alex Morgan"
              />
            </label>

            <label>
              Age
              <input
                name="age"
                type="number"
                value={form.age}
                onChange={updateField}
                placeholder="25"
              />
            </label>

            <label>
              Gender
              <select
                name="gender"
                value={form.gender}
                onChange={updateField}
              >
                <option value="">Select gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </label>

            <div className="actions">
              <button
                className={isSaving ? 'primary button-loading' : 'primary'}
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? <span className="button-spinner"></span> : null}
                {saveButtonLabel}
              </button>
              {editingId ? (
                <button type="button" onClick={resetForm} disabled={isSaving}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        ) : null}

        <section className="records" aria-label="Saved user details">
          <div className="section-heading list-heading">
            <h2>
              {activeTab === ACTIVE_TAB ? 'Active Records' : 'Deleted Records'}
            </h2>
            <button
              type="button"
              disabled={currentList.isLoading}
              onClick={() =>
                loadUsers(activeTab, currentList.page, currentList.pageSize)
              }
            >
              Refresh
            </button>
          </div>

          {currentList.isLoading ? (
            <TableSkeleton
              rows={currentList.pageSize}
              showActions={true}
            />
          ) : currentList.users.length === 0 ? (
            <p className="muted">
              {activeTab === ACTIVE_TAB
                ? 'No active user details yet.'
                : 'No deleted user details yet.'}
            </p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentList.users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.age}</td>
                      <td>{user.gender}</td>
                      {activeTab === ACTIVE_TAB ? (
                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              disabled={deletingId === user.id}
                              onClick={() => startEdit(user)}
                            >
                              Edit
                            </button>
                            <button
                              className={
                                deletingId === user.id
                                  ? 'danger button-loading'
                                  : 'danger'
                              }
                              type="button"
                              disabled={deletingId === user.id}
                              onClick={() => deleteUser(user.id)}
                            >
                              {deletingId === user.id ? (
                                <span className="button-spinner"></span>
                              ) : null}
                              {deletingId === user.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      ) : (
                        <td>
                          <div className="row-actions">
                            <button
                              className={
                                restoringId === user.id
                                  ? 'restore button-loading'
                                  : 'restore'
                              }
                              type="button"
                              disabled={restoringId === user.id}
                              onClick={() => restoreUser(user.id)}
                            >
                              {restoringId === user.id ? (
                                <span className="button-spinner"></span>
                              ) : null}
                              {restoringId === user.id ? 'Restoring...' : 'Restore'}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <footer className="pagination">
            <label className="page-size">
              Rows per page
              <select
                value={currentList.pageSize}
                onChange={changePageSize}
                disabled={currentList.isLoading}
              >
                {PAGE_SIZE_OPTIONS.map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </label>

            <div className="page-controls">
              <button
                type="button"
                disabled={currentList.isLoading || currentList.page <= 1}
                onClick={() =>
                  loadUsers(activeTab, currentList.page - 1, currentList.pageSize)
                }
              >
                Previous
              </button>

              <div className="page-numbers" aria-label="Page numbers">
                {visiblePages.map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={page === currentList.page ? 'page active' : 'page'}
                    disabled={currentList.isLoading}
                    onClick={() => loadUsers(activeTab, page, currentList.pageSize)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={
                  currentList.isLoading || currentList.page >= currentList.totalPages
                }
                onClick={() =>
                  loadUsers(activeTab, currentList.page + 1, currentList.pageSize)
                }
              >
                Next
              </button>
            </div>
          </footer>
        </section>
      </section>
    </main>
  )
}

function TableSkeleton({ rows, showActions }) {
  const skeletonRows = Array.from({ length: Math.max(1, rows) })

  return (
    <div
      className="table-wrap skeleton-table"
      aria-busy="true"
      aria-label="Loading user details"
    >
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            {showActions ? <th>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {skeletonRows.map((_, index) => (
            <tr key={index}>
              <td>
                <span className="skeleton-line wide"></span>
              </td>
              <td>
                <span className="skeleton-line short"></span>
              </td>
              <td>
                <span className="skeleton-line medium"></span>
              </td>
              {showActions ? (
                <td>
                  <div className="row-actions">
                    <span className="skeleton-button"></span>
                    <span className="skeleton-button"></span>
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function buildUserPayload(form) {
  const payload = {}
  const name = form.name.trim()
  const gender = form.gender.trim()

  if (name) {
    payload.name = name
  }

  if (form.age !== '') {
    payload.age = Number(form.age)
  }

  if (gender) {
    payload.gender = gender
  }

  return payload
}

function getVisiblePages(currentPage, totalPages) {
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
  const end = Math.min(totalPages, start + 4)
  const pages = []

  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }

  return pages
}

function formatApiError(data) {
  if (!data || typeof data !== 'object') {
    return 'The request failed.'
  }

  return Object.entries(data)
    .map(([field, messages]) => {
      const text = Array.isArray(messages) ? messages.join(' ') : messages
      return `${field}: ${text}`
    })
    .join(' ')
}

export default App
