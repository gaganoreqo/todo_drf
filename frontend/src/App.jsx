import { useEffect, useState } from 'react'
import './App.css'

const USER_API_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api/v1/user-details/'
).replace(/\/?$/, '/')
const API_ROOT = USER_API_URL.replace(/user-details\/$/, '')
const COMPANY_API_URL = `${API_ROOT}company-details/`
const USER_DROPDOWN_API_URL = `${API_ROOT}user-dropdown/`

const USER_TAB = 'user'
const COMPANY_TAB = 'company'
const ACTIVE_STATUS = 'active'
const DELETED_STATUS = 'deleted'
const DEFAULT_PAGE_SIZE = 5
const PAGE_SIZE_OPTIONS = [5, 10, 20]

const emptyUserForm = {
  name: '',
  age: '',
  gender: '',
}

const emptyCompanyForm = {
  userDetailId: '',
  companyName: '',
  role: '',
  location: '',
}

function createListState() {
  return {
    rows: [],
    count: 0,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages: 1,
    isLoading: true,
  }
}

function buildUserUrl(status, page, pageSize) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  })

  if (status === DELETED_STATUS) {
    params.set('deleted', 'true')
  }

  return `${USER_API_URL}?${params.toString()}`
}

function buildCompanyUrl(page, pageSize) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  })

  return `${COMPANY_API_URL}?${params.toString()}`
}

function App() {
  const [mainTab, setMainTab] = useState(USER_TAB)
  const [userStatus, setUserStatus] = useState(ACTIVE_STATUS)
  const [userForm, setUserForm] = useState(emptyUserForm)
  const [companyForm, setCompanyForm] = useState(emptyCompanyForm)
  const [editingUserId, setEditingUserId] = useState(null)
  const [editingCompanyId, setEditingCompanyId] = useState(null)
  const [users, setUsers] = useState({
    [ACTIVE_STATUS]: createListState(),
    [DELETED_STATUS]: createListState(),
  })
  const [companies, setCompanies] = useState(createListState())
  const [dropdownUsers, setDropdownUsers] = useState([])
  const [isDropdownLoading, setIsDropdownLoading] = useState(true)
  const [isUserSaving, setIsUserSaving] = useState(false)
  const [isCompanySaving, setIsCompanySaving] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState(null)
  const [restoringUserId, setRestoringUserId] = useState(null)
  const [deletingCompanyId, setDeletingCompanyId] = useState(null)
  const [error, setError] = useState('')

  const currentUsers = users[userStatus]
  const currentRows = mainTab === USER_TAB ? currentUsers : companies
  const visiblePages = getVisiblePages(currentRows.page, currentRows.totalPages)
  const userButtonLabel = isUserSaving
    ? editingUserId
      ? 'Updating...'
      : 'Creating...'
    : editingUserId
      ? 'Update User'
      : 'Create User'
  const companyButtonLabel = isCompanySaving
    ? editingCompanyId
      ? 'Updating...'
      : 'Creating...'
    : editingCompanyId
      ? 'Update Company'
      : 'Create Company'

  useEffect(() => {
    loadUsers(ACTIVE_STATUS, 1, DEFAULT_PAGE_SIZE)
    loadUsers(DELETED_STATUS, 1, DEFAULT_PAGE_SIZE)
    loadCompanies(1, DEFAULT_PAGE_SIZE)
    loadDropdownUsers()
  }, [])

  useEffect(() => {
    if (!error) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setError('')
    }, 4500)

    return () => window.clearTimeout(timer)
  }, [error])

  async function loadUsers(status, page, pageSize) {
    const requestedPage = Math.max(1, Number(page) || 1)
    const requestedPageSize = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE)
    const url = buildUserUrl(status, requestedPage, requestedPageSize)

    setUsers((current) => ({
      ...current,
      [status]: {
        ...current[status],
        isLoading: true,
      },
    }))
    setError('')

    try {
      const response = await fetch(url)

      if (response.status === 404 && requestedPage > 1) {
        await loadUsers(status, requestedPage - 1, requestedPageSize)
        return
      }

      if (!response.ok) {
        throw new Error('Could not load users.')
      }

      const data = await response.json()
      setUsers((current) => ({
        ...current,
        [status]: {
          rows: data.results,
          count: data.count,
          page: requestedPage,
          pageSize: requestedPageSize,
          totalPages: Math.max(1, Math.ceil(data.count / requestedPageSize)),
          isLoading: false,
        },
      }))
    } catch (err) {
      setError(err.message)
      setUsers((current) => ({
        ...current,
        [status]: {
          ...current[status],
          isLoading: false,
        },
      }))
    }
  }

  async function loadCompanies(page, pageSize) {
    const requestedPage = Math.max(1, Number(page) || 1)
    const requestedPageSize = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE)
    const url = buildCompanyUrl(requestedPage, requestedPageSize)

    setCompanies((current) => ({
      ...current,
      isLoading: true,
    }))
    setError('')

    try {
      const response = await fetch(url)

      if (response.status === 404 && requestedPage > 1) {
        await loadCompanies(requestedPage - 1, requestedPageSize)
        return
      }

      if (!response.ok) {
        throw new Error('Could not load companies.')
      }

      const data = await response.json()
      setCompanies({
        rows: data.results,
        count: data.count,
        page: requestedPage,
        pageSize: requestedPageSize,
        totalPages: Math.max(1, Math.ceil(data.count / requestedPageSize)),
        isLoading: false,
      })
    } catch (err) {
      setError(err.message)
      setCompanies((current) => ({
        ...current,
        isLoading: false,
      }))
    }
  }

  async function loadDropdownUsers() {
    setIsDropdownLoading(true)

    try {
      const response = await fetch(USER_DROPDOWN_API_URL)

      if (!response.ok) {
        throw new Error('Could not load users for dropdown.')
      }

      const data = await response.json()
      setDropdownUsers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsDropdownLoading(false)
    }
  }

  function selectMainTab(tab) {
    setMainTab(tab)
    setError('')
  }

  function selectUserStatus(status) {
    setUserStatus(status)
    resetUserForm()
  }

  function updateUserField(event) {
    const { name, value } = event.target
    setUserForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function updateCompanyField(event) {
    const { name, value } = event.target
    setCompanyForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function startUserEdit(user) {
    setMainTab(USER_TAB)
    setUserStatus(ACTIVE_STATUS)
    setEditingUserId(user.id)
    setUserForm({
      name: user.name,
      age: String(user.age),
      gender: user.gender,
    })
  }

  function startCompanyEdit(company) {
    setMainTab(COMPANY_TAB)
    setEditingCompanyId(company.id)
    setCompanyForm({
      userDetailId: String(company.user_detail),
      companyName: company.company_name,
      role: company.role,
      location: company.location,
    })
  }

  function resetUserForm() {
    setEditingUserId(null)
    setUserForm(emptyUserForm)
  }

  function resetCompanyForm() {
    setEditingCompanyId(null)
    setCompanyForm(emptyCompanyForm)
  }

  async function handleUserSubmit(event) {
    event.preventDefault()
    setIsUserSaving(true)
    setError('')

    const url = editingUserId ? `${USER_API_URL}${editingUserId}/` : USER_API_URL
    const method = editingUserId ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildUserPayload(userForm)),
      })

      if (!response.ok) {
        throw new Error(formatApiError(await response.json()))
      }

      resetUserForm()
      await loadUsers(ACTIVE_STATUS, users[ACTIVE_STATUS].page, users[ACTIVE_STATUS].pageSize)
      await loadDropdownUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsUserSaving(false)
    }
  }

  async function handleCompanySubmit(event) {
    event.preventDefault()
    setIsCompanySaving(true)
    setError('')

    const url = editingCompanyId
      ? `${COMPANY_API_URL}${editingCompanyId}/`
      : COMPANY_API_URL
    const method = editingCompanyId ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildCompanyPayload(companyForm)),
      })

      if (!response.ok) {
        throw new Error(formatApiError(await response.json()))
      }

      resetCompanyForm()
      await loadCompanies(companies.page, companies.pageSize)
      await loadUsers(ACTIVE_STATUS, users[ACTIVE_STATUS].page, users[ACTIVE_STATUS].pageSize)
      await loadDropdownUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsCompanySaving(false)
    }
  }

  async function deleteUser(userId) {
    setError('')
    setDeletingUserId(userId)

    try {
      const response = await fetch(`${USER_API_URL}${userId}/`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(formatApiError(await response.json()))
      }

      await loadUsers(ACTIVE_STATUS, users[ACTIVE_STATUS].page, users[ACTIVE_STATUS].pageSize)
      await loadUsers(DELETED_STATUS, 1, users[DELETED_STATUS].pageSize)
      await loadDropdownUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingUserId(null)
    }
  }

  async function restoreUser(userId) {
    setError('')
    setRestoringUserId(userId)

    try {
      const response = await fetch(`${USER_API_URL}${userId}/undelete/`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Could not restore user.')
      }

      await loadUsers(DELETED_STATUS, users[DELETED_STATUS].page, users[DELETED_STATUS].pageSize)
      await loadUsers(ACTIVE_STATUS, 1, users[ACTIVE_STATUS].pageSize)
      await loadDropdownUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setRestoringUserId(null)
    }
  }

  async function deleteCompany(companyId) {
    setError('')
    setDeletingCompanyId(companyId)

    try {
      const response = await fetch(`${COMPANY_API_URL}${companyId}/`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Could not delete company details.')
      }

      resetCompanyForm()
      await loadCompanies(companies.page, companies.pageSize)
      await loadUsers(ACTIVE_STATUS, users[ACTIVE_STATUS].page, users[ACTIVE_STATUS].pageSize)
      await loadDropdownUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingCompanyId(null)
    }
  }

  function changePageSize(event) {
    const pageSize = Number(event.target.value)

    if (mainTab === USER_TAB) {
      loadUsers(userStatus, 1, pageSize)
      return
    }

    loadCompanies(1, pageSize)
  }

  function goToPage(page) {
    if (mainTab === USER_TAB) {
      loadUsers(userStatus, page, currentUsers.pageSize)
      return
    }

    loadCompanies(page, companies.pageSize)
  }

  return (
    <main className="app-shell">
      <div className="topbar" aria-label="Application header">
        <span className="brand">User Company Details</span>
        <span>React</span>
        <span>DRF API</span>
      </div>

      <header className="page-header">
        <div>
          <p className="eyebrow">Records</p>
          <h1>{mainTab === USER_TAB ? 'Users' : 'Company Details'}</h1>
        </div>
        <div className="summary">
          <span>{currentRows.count}</span>
          <small>{mainTab === USER_TAB ? 'User records' : 'Company records'}</small>
        </div>
      </header>

      <Toast message={error} onClose={() => setError('')} />

      <nav className="tabs" aria-label="Main tabs">
        <button
          type="button"
          className={mainTab === USER_TAB ? 'tab active' : 'tab'}
          onClick={() => selectMainTab(USER_TAB)}
        >
          User
          <span>{users[ACTIVE_STATUS].count}</span>
        </button>
        <button
          type="button"
          className={mainTab === COMPANY_TAB ? 'tab active' : 'tab'}
          onClick={() => selectMainTab(COMPANY_TAB)}
        >
          Company
          <span>{companies.count}</span>
        </button>
      </nav>

      {mainTab === USER_TAB ? (
        <UserPanel
          userForm={userForm}
          editingUserId={editingUserId}
          isUserSaving={isUserSaving}
          userButtonLabel={userButtonLabel}
          userStatus={userStatus}
          currentUsers={currentUsers}
          deletingUserId={deletingUserId}
          restoringUserId={restoringUserId}
          visiblePages={visiblePages}
          onSubmit={handleUserSubmit}
          onChange={updateUserField}
          onCancel={resetUserForm}
          onSelectStatus={selectUserStatus}
          onEdit={startUserEdit}
          onDelete={deleteUser}
          onRestore={restoreUser}
          onRefresh={() =>
            loadUsers(userStatus, currentUsers.page, currentUsers.pageSize)
          }
          onPageSizeChange={changePageSize}
          onPageChange={goToPage}
        />
      ) : (
        <CompanyPanel
          companyForm={companyForm}
          editingCompanyId={editingCompanyId}
          isCompanySaving={isCompanySaving}
          companyButtonLabel={companyButtonLabel}
          dropdownUsers={dropdownUsers}
          isDropdownLoading={isDropdownLoading}
          companies={companies}
          deletingCompanyId={deletingCompanyId}
          visiblePages={visiblePages}
          onSubmit={handleCompanySubmit}
          onChange={updateCompanyField}
          onCancel={resetCompanyForm}
          onEdit={startCompanyEdit}
          onDelete={deleteCompany}
          onRefresh={() => loadCompanies(companies.page, companies.pageSize)}
          onPageSizeChange={changePageSize}
          onPageChange={goToPage}
        />
      )}
    </main>
  )
}

function Toast({ message, onClose }) {
  if (!message) {
    return null
  }

  return (
    <div className="toast-region" role="status" aria-live="polite">
      <div className="toast">
        <div>
          <strong>Error</strong>
          <span>{message}</span>
        </div>
        <button type="button" className="toast-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

function UserPanel({
  userForm,
  editingUserId,
  isUserSaving,
  userButtonLabel,
  userStatus,
  currentUsers,
  deletingUserId,
  restoringUserId,
  visiblePages,
  onSubmit,
  onChange,
  onCancel,
  onSelectStatus,
  onEdit,
  onDelete,
  onRestore,
  onRefresh,
  onPageSizeChange,
  onPageChange,
}) {
  return (
    <section className="workspace" aria-label="User workspace">
      <form className="editor" onSubmit={onSubmit}>
        <div className="section-heading">
          <h2>{editingUserId ? 'Edit User' : 'Add User'}</h2>
        </div>

        <label>
          Name
          <input
            name="name"
            type="text"
            value={userForm.name}
            onChange={onChange}
            placeholder="Alex Morgan"
          />
        </label>

        <label>
          Age
          <input
            name="age"
            type="number"
            value={userForm.age}
            onChange={onChange}
            placeholder="25"
          />
        </label>

        <label>
          Gender
          <select name="gender" value={userForm.gender} onChange={onChange}>
            <option value="">Select gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </label>

        <div className="actions">
          <button
            className={isUserSaving ? 'primary button-loading' : 'primary'}
            type="submit"
            disabled={isUserSaving}
          >
            {isUserSaving ? <span className="button-spinner"></span> : null}
            {userButtonLabel}
          </button>
          {editingUserId ? (
            <button type="button" onClick={onCancel} disabled={isUserSaving}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <section className="records" aria-label="User records">
        <div className="section-heading list-heading">
          <h2>{userStatus === ACTIVE_STATUS ? 'Active Users' : 'Deleted Users'}</h2>
          <button type="button" disabled={currentUsers.isLoading} onClick={onRefresh}>
            Refresh
          </button>
        </div>

        <div className="subtabs" aria-label="User status">
          <button
            type="button"
            className={userStatus === ACTIVE_STATUS ? 'subtab active' : 'subtab'}
            onClick={() => onSelectStatus(ACTIVE_STATUS)}
          >
            Active
          </button>
          <button
            type="button"
            className={userStatus === DELETED_STATUS ? 'subtab active' : 'subtab'}
            onClick={() => onSelectStatus(DELETED_STATUS)}
          >
            Deleted
          </button>
        </div>

        {currentUsers.isLoading ? (
          <UserTableSkeleton rows={currentUsers.pageSize} />
        ) : currentUsers.rows.length === 0 ? (
          <p className="muted">No users found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.rows.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.age}</td>
                    <td>{user.gender}</td>
                    <td>{user.company_detail?.company_name || '-'}</td>
                    <td>{user.company_detail?.role || '-'}</td>
                    <td>{user.company_detail?.location || '-'}</td>
                    <td>
                      {userStatus === ACTIVE_STATUS ? (
                        <div className="row-actions">
                          <button type="button" onClick={() => onEdit(user)}>
                            Edit
                          </button>
                          <button
                            className={
                              deletingUserId === user.id
                                ? 'danger button-loading'
                                : 'danger'
                            }
                            type="button"
                            disabled={deletingUserId === user.id}
                            onClick={() => onDelete(user.id)}
                          >
                            {deletingUserId === user.id ? (
                              <span className="button-spinner"></span>
                            ) : null}
                            {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      ) : (
                        <div className="row-actions">
                          <button
                            className={
                              restoringUserId === user.id
                                ? 'restore button-loading'
                                : 'restore'
                            }
                            type="button"
                            disabled={restoringUserId === user.id}
                            onClick={() => onRestore(user.id)}
                          >
                            {restoringUserId === user.id ? (
                              <span className="button-spinner"></span>
                            ) : null}
                            {restoringUserId === user.id
                              ? 'Restoring...'
                              : 'Restore'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          listState={currentUsers}
          visiblePages={visiblePages}
          onPageSizeChange={onPageSizeChange}
          onPageChange={onPageChange}
        />
      </section>
    </section>
  )
}

function CompanyPanel({
  companyForm,
  editingCompanyId,
  isCompanySaving,
  companyButtonLabel,
  dropdownUsers,
  isDropdownLoading,
  companies,
  deletingCompanyId,
  visiblePages,
  onSubmit,
  onChange,
  onCancel,
  onEdit,
  onDelete,
  onRefresh,
  onPageSizeChange,
  onPageChange,
}) {
  return (
    <section className="workspace" aria-label="Company workspace">
      <form className="editor" onSubmit={onSubmit}>
        <div className="section-heading">
          <h2>{editingCompanyId ? 'Edit Company' : 'Add Company'}</h2>
        </div>

        <label>
          User
          <select
            name="userDetailId"
            value={companyForm.userDetailId}
            onChange={onChange}
            disabled={isDropdownLoading || isCompanySaving || Boolean(editingCompanyId)}
          >
            <option value="">
              {isDropdownLoading ? 'Loading users...' : 'Select user'}
            </option>
            {dropdownUsers.map((user) => (
              <option
                key={user.id}
                value={user.id}
                disabled={
                  user.has_company && String(user.id) !== companyForm.userDetailId
                }
              >
                {user.name}
                {user.has_company ? ' - has company' : ''}
              </option>
            ))}
          </select>
        </label>

        <label>
          Company Name
          <input
            name="companyName"
            type="text"
            value={companyForm.companyName}
            onChange={onChange}
            placeholder="Apple"
          />
        </label>

        <label>
          Role
          <input
            name="role"
            type="text"
            value={companyForm.role}
            onChange={onChange}
            placeholder="Software Engineer"
          />
        </label>

        <label>
          Location
          <input
            name="location"
            type="text"
            value={companyForm.location}
            onChange={onChange}
            placeholder="Cupertino"
          />
        </label>

        <div className="actions">
          <button
            className={isCompanySaving ? 'primary button-loading' : 'primary'}
            type="submit"
            disabled={isCompanySaving}
          >
            {isCompanySaving ? <span className="button-spinner"></span> : null}
            {companyButtonLabel}
          </button>
          {editingCompanyId ? (
            <button type="button" onClick={onCancel} disabled={isCompanySaving}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <section className="records" aria-label="Company records">
        <div className="section-heading list-heading">
          <h2>Company Details</h2>
          <button type="button" disabled={companies.isLoading} onClick={onRefresh}>
            Refresh
          </button>
        </div>

        {companies.isLoading ? (
          <CompanyTableSkeleton rows={companies.pageSize} />
        ) : companies.rows.length === 0 ? (
          <p className="muted">No company details found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.rows.map((company) => (
                  <tr key={company.id}>
                    <td>{company.user_name}</td>
                    <td>{company.company_name}</td>
                    <td>{company.role}</td>
                    <td>{company.location}</td>
                    <td>
                      <div className="row-actions">
                        <button type="button" onClick={() => onEdit(company)}>
                          Edit
                        </button>
                        <button
                          className={
                            deletingCompanyId === company.id
                              ? 'danger button-loading'
                              : 'danger'
                          }
                          type="button"
                          disabled={deletingCompanyId === company.id}
                          onClick={() => onDelete(company.id)}
                        >
                          {deletingCompanyId === company.id ? (
                            <span className="button-spinner"></span>
                          ) : null}
                          {deletingCompanyId === company.id
                            ? 'Deleting...'
                            : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          listState={companies}
          visiblePages={visiblePages}
          onPageSizeChange={onPageSizeChange}
          onPageChange={onPageChange}
        />
      </section>
    </section>
  )
}

function Pagination({ listState, visiblePages, onPageSizeChange, onPageChange }) {
  return (
    <footer className="pagination">
      <label className="page-size">
        Rows per page
        <select
          value={listState.pageSize}
          onChange={onPageSizeChange}
          disabled={listState.isLoading}
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
          disabled={listState.isLoading || listState.page <= 1}
          onClick={() => onPageChange(listState.page - 1)}
        >
          Previous
        </button>

        <div className="page-numbers" aria-label="Page numbers">
          {visiblePages.map((page) => (
            <button
              key={page}
              type="button"
              className={page === listState.page ? 'page active' : 'page'}
              disabled={listState.isLoading}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={listState.isLoading || listState.page >= listState.totalPages}
          onClick={() => onPageChange(listState.page + 1)}
        >
          Next
        </button>
      </div>
    </footer>
  )
}

function UserTableSkeleton({ rows }) {
  const skeletonRows = Array.from({ length: Math.max(1, rows) })

  return (
    <SkeletonTable
      headers={['Name', 'Age', 'Gender', 'Company', 'Role', 'Location', 'Actions']}
      rows={skeletonRows}
    />
  )
}

function CompanyTableSkeleton({ rows }) {
  const skeletonRows = Array.from({ length: Math.max(1, rows) })

  return (
    <SkeletonTable
      headers={['User', 'Company', 'Role', 'Location', 'Actions']}
      rows={skeletonRows}
    />
  )
}

function SkeletonTable({ headers, rows }) {
  return (
    <div
      className="table-wrap skeleton-table"
      aria-busy="true"
      aria-label="Loading records"
    >
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((_, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td key={header}>
                  {header === 'Actions' ? (
                    <div className="row-actions">
                      <span className="skeleton-button"></span>
                      <span className="skeleton-button"></span>
                    </div>
                  ) : (
                    <span className="skeleton-line medium"></span>
                  )}
                </td>
              ))}
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

function buildCompanyPayload(form) {
  const payload = {}
  const companyName = form.companyName.trim()
  const role = form.role.trim()
  const location = form.location.trim()

  if (form.userDetailId) {
    payload.user_detail = Number(form.userDetailId)
  }

  if (companyName) {
    payload.company_name = companyName
  }

  if (role) {
    payload.role = role
  }

  if (location) {
    payload.location = location
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

  return flattenApiErrors(data).join(' ')
}

function flattenApiErrors(data, prefix = '') {
  return Object.entries(data).flatMap(([field, messages]) => {
    const label = prefix ? `${prefix}.${field}` : field

    if (Array.isArray(messages)) {
      return `${label}: ${messages.join(' ')}`
    }

    if (messages && typeof messages === 'object') {
      return flattenApiErrors(messages, label)
    }

    return `${label}: ${messages}`
  })
}

export default App
