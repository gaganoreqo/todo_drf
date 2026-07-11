import { useEffect, useRef, useState } from 'react'
import './App.css'
import DrfLearnPanel from './DrfLearnPanel.jsx'
import PythonLearnPanel from './PythonLearnPanel.jsx'

const USER_API_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api/v1/user-details/'
).replace(/\/?$/, '/')
const API_ROOT = USER_API_URL.replace(/user-details\/$/, '')
const COMPANY_API_URL = `${API_ROOT}company-details/`
const USER_DROPDOWN_API_URL = `${API_ROOT}user-dropdown/`
const DASHBOARD_SUMMARY_API_URL = `${API_ROOT}dashboard-summary/`
const LOGIN_API_URL = `${API_ROOT}auth/login/`
const SIGNUP_API_URL = `${API_ROOT}auth/signup/`
const ACCOUNTS_API_URL = `${API_ROOT}accounts/`
const AUTH_TOKEN_STORAGE_KEY = 'todo_drf_access_token'
const AUTH_ACCOUNT_STORAGE_KEY = 'todo_drf_account'

const HOME_TAB = 'home'
const USER_TAB = 'user'
const COMPANY_TAB = 'company'
const ADMIN_TAB = 'admin'
const DRF_LEARN_TAB = 'drf-learn'
const PYTHON_LEARN_TAB = 'python-learn'
const ACTIVE_STATUS = 'active'
const DELETED_STATUS = 'deleted'
const DEFAULT_PAGE_SIZE = 5
const FILTER_DEBOUNCE_MS = 400
const PAGE_SIZE_OPTIONS = [5, 10, 20]

const emptyDashboardSummary = {
  activeUsers: 0,
  companyRecords: 0,
  deletedUsers: 0,
  accountCount: 0,
  availableUsers: 0,
}

const emptyUserForm = {
  name: '',
  age: '',
  gender: '',
}

const emptyCompanyForm = {
  userDetailId: '',
  userName: '',
  companyName: '',
  role: '',
  location: '',
}

const emptyAuthForm = {
  fullName: '',
  email: '',
  password: '',
}

const emptyUserFilters = {
  search: '',
  name: '',
  age: '',
  gender: '',
  company: '',
  ordering: 'id',
}

const emptyCompanyFilters = {
  search: '',
  userName: '',
  companyName: '',
  role: '',
  location: '',
  ordering: 'id',
}

function createListState() {
  return {
    rows: [],
    count: 0,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages: 1,
    isLoading: false,
    hasLoaded: false,
  }
}

function createDashboardState() {
  return {
    data: emptyDashboardSummary,
    isLoading: false,
    hasLoaded: false,
  }
}

function createAccountState() {
  return {
    rows: [],
    isLoading: false,
    hasLoaded: false,
  }
}

function buildUserUrl(status, page, pageSize, filters) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  })

  if (status === DELETED_STATUS) {
    params.set('deleted', 'true')
  }

  appendParam(params, 'search', filters.search)
  appendParam(params, 'name', filters.name)
  appendParam(params, 'age', filters.age)
  appendParam(params, 'gender', filters.gender)
  appendParam(params, 'company', filters.company)
  appendParam(params, 'ordering', filters.ordering)

  return `${USER_API_URL}?${params.toString()}`
}

function buildCompanyUrl(page, pageSize, filters) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  })

  appendParam(params, 'search', filters.search)
  appendParam(params, 'user_name', filters.userName)
  appendParam(params, 'company_name', filters.companyName)
  appendParam(params, 'role', filters.role)
  appendParam(params, 'location', filters.location)
  appendParam(params, 'ordering', filters.ordering)

  return `${COMPANY_API_URL}?${params.toString()}`
}

function App() {
  const [session, setSession] = useState(loadStoredSession)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState(emptyAuthForm)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [mainTab, setMainTab] = useState(HOME_TAB)
  const [userStatus, setUserStatus] = useState(ACTIVE_STATUS)
  const [userForm, setUserForm] = useState(emptyUserForm)
  const [companyForm, setCompanyForm] = useState(emptyCompanyForm)
  const [userFilters, setUserFilters] = useState(emptyUserFilters)
  const [companyFilters, setCompanyFilters] = useState(emptyCompanyFilters)
  const [dropdownSearch, setDropdownSearch] = useState('')
  const [editingUserId, setEditingUserId] = useState(null)
  const [editingCompanyId, setEditingCompanyId] = useState(null)
  const [users, setUsers] = useState({
    [ACTIVE_STATUS]: createListState(),
    [DELETED_STATUS]: createListState(),
  })
  const [companies, setCompanies] = useState(createListState())
  const [dashboardSummary, setDashboardSummary] = useState(createDashboardState())
  const [accounts, setAccounts] = useState(createAccountState())
  const [dropdownUsers, setDropdownUsers] = useState([])
  const [isDropdownLoading, setIsDropdownLoading] = useState(false)
  const [hasDropdownLoaded, setHasDropdownLoaded] = useState(false)
  const [isUserSaving, setIsUserSaving] = useState(false)
  const [isCompanySaving, setIsCompanySaving] = useState(false)
  const [savingAccountId, setSavingAccountId] = useState(null)
  const [deletingUserId, setDeletingUserId] = useState(null)
  const [restoringUserId, setRestoringUserId] = useState(null)
  const [deletingCompanyId, setDeletingCompanyId] = useState(null)
  const [error, setError] = useState('')
  const userFilterTimerRef = useRef(null)
  const companyFilterTimerRef = useRef(null)

  const isAdmin = session?.account?.role === 'admin'
  const isLearnTab = mainTab === DRF_LEARN_TAB || mainTab === PYTHON_LEARN_TAB
  const currentUsers = users[userStatus]
  const paginationRows = mainTab === COMPANY_TAB ? companies : currentUsers
  const visiblePages = getVisiblePages(
    paginationRows.page,
    paginationRows.totalPages,
  )
  const filteredDropdownUsers = filterDropdownUsers(
    dropdownUsers,
    dropdownSearch,
    companyForm.userDetailId,
  )
  const pageTitle = getPageTitle(mainTab, userStatus)
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
  const accountCountLabel = getAccountCountLabel(accounts, dashboardSummary)

  useEffect(() => {
    if (!session?.access) {
      return
    }

    if (
      mainTab === HOME_TAB &&
      !dashboardSummary.hasLoaded &&
      !dashboardSummary.isLoading
    ) {
      loadDashboardSummary()
      return
    }

    if (mainTab === USER_TAB && !currentUsers.hasLoaded && !currentUsers.isLoading) {
      loadUsers(userStatus, currentUsers.page, currentUsers.pageSize, userFilters)
      return
    }

    if (mainTab === COMPANY_TAB && !companies.hasLoaded && !companies.isLoading) {
      loadCompanies(companies.page, companies.pageSize, companyFilters)
      return
    }

    if (
      mainTab === ADMIN_TAB &&
      isAdmin &&
      !accounts.hasLoaded &&
      !accounts.isLoading
    ) {
      loadAccounts()
    }
  }, [
    accounts.hasLoaded,
    accounts.isLoading,
    companies.hasLoaded,
    companies.isLoading,
    companies.page,
    companies.pageSize,
    companyFilters,
    currentUsers.hasLoaded,
    currentUsers.isLoading,
    currentUsers.page,
    currentUsers.pageSize,
    dashboardSummary.hasLoaded,
    dashboardSummary.isLoading,
    isAdmin,
    mainTab,
    session?.access,
    userFilters,
    userStatus,
  ])

  useEffect(() => {
    return () => {
      window.clearTimeout(userFilterTimerRef.current)
      window.clearTimeout(companyFilterTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (mainTab === ADMIN_TAB && !isAdmin) {
      setMainTab(HOME_TAB)
    }
  }, [isAdmin, mainTab])

  useEffect(() => {
    if (!error) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setError('')
    }, 4500)

    return () => window.clearTimeout(timer)
  }, [error])

  async function apiFetch(url, options = {}) {
    if (!session?.access) {
      throw new Error('Please log in again.')
    }

    const headers = new Headers(options.headers || {})
    headers.set('Authorization', `Bearer ${session.access}`)

    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      handleLogout('Session expired. Please log in again.')
      throw new Error('Session expired. Please log in again.')
    }

    return response
  }

  function updateAuthField(event) {
    const { name, value } = event.target
    setAuthForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function switchAuthMode(mode) {
    setAuthMode(mode)
    setAuthError('')
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setIsAuthLoading(true)
    setAuthError('')
    setError('')

    const isSignup = authMode === 'signup'
    const payload = isSignup
      ? {
          email: authForm.email.trim(),
          full_name: authForm.fullName.trim(),
          password: authForm.password,
        }
      : {
          email: authForm.email.trim(),
          password: authForm.password,
        }

    try {
      const response = await fetch(isSignup ? SIGNUP_API_URL : LOGIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(formatApiError(await response.json()))
      }

      const data = await response.json()
      const nextSession = {
        access: data.access,
        account: data.account,
      }

      saveStoredSession(nextSession)
      setSession(nextSession)
      setAuthForm(emptyAuthForm)
      setMainTab(HOME_TAB)
    } catch (err) {
      setAuthError(err.message)
    } finally {
      setIsAuthLoading(false)
    }
  }

  function handleLogout(message = '') {
    clearStoredSession()
    setSession(null)
    setMainTab(HOME_TAB)
    setUserStatus(ACTIVE_STATUS)
    setUserForm(emptyUserForm)
    setCompanyForm(emptyCompanyForm)
    setEditingUserId(null)
    setEditingCompanyId(null)
    setUsers({
      [ACTIVE_STATUS]: createListState(),
      [DELETED_STATUS]: createListState(),
    })
    setCompanies(createListState())
    setDashboardSummary(createDashboardState())
    setAccounts(createAccountState())
    setDropdownUsers([])
    setHasDropdownLoaded(false)
    setAuthError(message)
    setError('')
  }

  async function loadUsers(status, page, pageSize, filters = userFilters) {
    const requestedPage = Math.max(1, Number(page) || 1)
    const requestedPageSize = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE)
    const url = buildUserUrl(
      status,
      requestedPage,
      requestedPageSize,
      filters,
    )

    setUsers((current) => ({
      ...current,
      [status]: {
        ...current[status],
        isLoading: true,
      },
    }))
    setError('')

    try {
      const response = await apiFetch(url)

      if (response.status === 404 && requestedPage > 1) {
        await loadUsers(status, requestedPage - 1, requestedPageSize, filters)
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
          hasLoaded: true,
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

  async function loadCompanies(page, pageSize, filters = companyFilters) {
    const requestedPage = Math.max(1, Number(page) || 1)
    const requestedPageSize = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE)
    const url = buildCompanyUrl(requestedPage, requestedPageSize, filters)

    setCompanies((current) => ({
      ...current,
      isLoading: true,
    }))
    setError('')

    try {
      const response = await apiFetch(url)

      if (response.status === 404 && requestedPage > 1) {
        await loadCompanies(requestedPage - 1, requestedPageSize, filters)
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
        hasLoaded: true,
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
      const response = await apiFetch(USER_DROPDOWN_API_URL)

      if (!response.ok) {
        throw new Error('Could not load users for dropdown.')
      }

      const data = await response.json()
      setDropdownUsers(data)
      setHasDropdownLoaded(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsDropdownLoading(false)
    }
  }

  async function loadDashboardSummary() {
    setDashboardSummary((current) => ({
      ...current,
      isLoading: true,
    }))
    setError('')

    try {
      const response = await apiFetch(DASHBOARD_SUMMARY_API_URL)

      if (!response.ok) {
        throw new Error('Could not load dashboard summary.')
      }

      const data = await response.json()
      setDashboardSummary({
        data: normalizeDashboardSummary(data),
        isLoading: false,
        hasLoaded: true,
      })
    } catch (err) {
      setError(err.message)
      setDashboardSummary((current) => ({
        ...current,
        isLoading: false,
      }))
    }
  }

  async function loadAccounts() {
    setAccounts((current) => ({
      ...current,
      isLoading: true,
    }))
    setError('')

    try {
      const response = await apiFetch(ACCOUNTS_API_URL)

      if (!response.ok) {
        throw new Error('Could not load accounts.')
      }

      const data = await response.json()
      setAccounts({
        rows: data,
        isLoading: false,
        hasLoaded: true,
      })
    } catch (err) {
      setError(err.message)
      setAccounts((current) => ({
        ...current,
        isLoading: false,
      }))
    }
  }

  function loadDropdownUsersOnDemand() {
    if (!hasDropdownLoaded && !isDropdownLoading) {
      loadDropdownUsers()
    }
  }

  function selectMainTab(tab) {
    setMainTab(tab)
    setError('')
  }

  async function refreshCurrentView() {
    if (mainTab === HOME_TAB) {
      await loadDashboardSummary()
      return
    }

    if (mainTab === USER_TAB) {
      await loadUsers(
        userStatus,
        currentUsers.page,
        currentUsers.pageSize,
        userFilters,
      )
      return
    }

    if (mainTab === COMPANY_TAB) {
      await loadCompanies(companies.page, companies.pageSize, companyFilters)

      if (hasDropdownLoaded) {
        await loadDropdownUsers()
      }

      return
    }

    if (mainTab === ADMIN_TAB && isAdmin) {
      await loadAccounts()
    }
  }

  function selectUserStatus(status) {
    window.clearTimeout(userFilterTimerRef.current)
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

  function updateUserFilter(event) {
    const { name, value } = event.target
    const nextFilters = {
      ...userFilters,
      [name]: value,
    }

    setUserFilters(nextFilters)
    window.clearTimeout(userFilterTimerRef.current)
    userFilterTimerRef.current = window.setTimeout(() => {
      loadUsers(userStatus, 1, currentUsers.pageSize, nextFilters)
    }, FILTER_DEBOUNCE_MS)
  }

  function resetUserFilters() {
    window.clearTimeout(userFilterTimerRef.current)
    setUserFilters(emptyUserFilters)
    loadUsers(userStatus, 1, currentUsers.pageSize, emptyUserFilters)
  }

  function updateCompanyFilter(event) {
    const { name, value } = event.target
    const nextFilters = {
      ...companyFilters,
      [name]: value,
    }

    setCompanyFilters(nextFilters)
    window.clearTimeout(companyFilterTimerRef.current)
    companyFilterTimerRef.current = window.setTimeout(() => {
      loadCompanies(1, companies.pageSize, nextFilters)
    }, FILTER_DEBOUNCE_MS)
  }

  function resetCompanyFilters() {
    window.clearTimeout(companyFilterTimerRef.current)
    setCompanyFilters(emptyCompanyFilters)
    loadCompanies(1, companies.pageSize, emptyCompanyFilters)
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
      userName: company.user_name,
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
      const response = await apiFetch(url, {
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
      await loadUsers(
        ACTIVE_STATUS,
        users[ACTIVE_STATUS].page,
        users[ACTIVE_STATUS].pageSize,
        userFilters,
      )

      if (hasDropdownLoaded) {
        await loadDropdownUsers()
      }

      if (dashboardSummary.hasLoaded) {
        await loadDashboardSummary()
      }
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
      const response = await apiFetch(url, {
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
      await loadCompanies(companies.page, companies.pageSize, companyFilters)

      if (users[ACTIVE_STATUS].hasLoaded) {
        await loadUsers(
          ACTIVE_STATUS,
          users[ACTIVE_STATUS].page,
          users[ACTIVE_STATUS].pageSize,
          userFilters,
        )
      }

      if (hasDropdownLoaded) {
        await loadDropdownUsers()
      }

      if (dashboardSummary.hasLoaded) {
        await loadDashboardSummary()
      }
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
      const response = await apiFetch(`${USER_API_URL}${userId}/`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(formatApiError(await response.json()))
      }

      await loadUsers(
        ACTIVE_STATUS,
        users[ACTIVE_STATUS].page,
        users[ACTIVE_STATUS].pageSize,
        userFilters,
      )

      if (users[DELETED_STATUS].hasLoaded) {
        await loadUsers(
          DELETED_STATUS,
          1,
          users[DELETED_STATUS].pageSize,
          userFilters,
        )
      }

      if (hasDropdownLoaded) {
        await loadDropdownUsers()
      }

      if (dashboardSummary.hasLoaded) {
        await loadDashboardSummary()
      }
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
      const response = await apiFetch(`${USER_API_URL}${userId}/undelete/`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Could not restore user.')
      }

      await loadUsers(
        DELETED_STATUS,
        users[DELETED_STATUS].page,
        users[DELETED_STATUS].pageSize,
        userFilters,
      )

      if (users[ACTIVE_STATUS].hasLoaded) {
        await loadUsers(
          ACTIVE_STATUS,
          1,
          users[ACTIVE_STATUS].pageSize,
          userFilters,
        )
      }

      if (hasDropdownLoaded) {
        await loadDropdownUsers()
      }

      if (dashboardSummary.hasLoaded) {
        await loadDashboardSummary()
      }
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
      const response = await apiFetch(`${COMPANY_API_URL}${companyId}/`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Could not delete company details.')
      }

      resetCompanyForm()
      await loadCompanies(companies.page, companies.pageSize, companyFilters)

      if (users[ACTIVE_STATUS].hasLoaded) {
        await loadUsers(
          ACTIVE_STATUS,
          users[ACTIVE_STATUS].page,
          users[ACTIVE_STATUS].pageSize,
          userFilters,
        )
      }

      if (hasDropdownLoaded) {
        await loadDropdownUsers()
      }

      if (dashboardSummary.hasLoaded) {
        await loadDashboardSummary()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingCompanyId(null)
    }
  }

  async function updateAccount(accountId, payload) {
    setError('')
    setSavingAccountId(accountId)

    try {
      const response = await apiFetch(`${ACCOUNTS_API_URL}${accountId}/`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(formatApiError(await response.json()))
      }

      const updatedAccount = await response.json()
      setAccounts((current) => ({
        ...current,
        rows: current.rows.map((account) =>
          account.id === updatedAccount.id ? updatedAccount : account,
        ),
        hasLoaded: true,
      }))

      if (session?.account?.id === updatedAccount.id) {
        const nextSession = {
          ...session,
          account: updatedAccount,
        }
        saveStoredSession(nextSession)
        setSession(nextSession)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingAccountId(null)
    }
  }

  async function changeAccountRole(account, role) {
    if (account.role === role) {
      return
    }

    await updateAccount(account.id, { role })
  }

  async function toggleAccountStatus(account) {
    setError('')
    setSavingAccountId(account.id)

    try {
      if (account.is_active) {
        const response = await apiFetch(`${ACCOUNTS_API_URL}${account.id}/`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error(formatApiError(await response.json()))
        }

        setAccounts((current) => ({
          ...current,
          rows: current.rows.map((row) =>
            row.id === account.id ? { ...row, is_active: false } : row,
          ),
        }))
        return
      }

      await updateAccount(account.id, { is_active: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingAccountId(null)
    }
  }

  function changePageSize(event) {
    const pageSize = Number(event.target.value)

    if (mainTab === USER_TAB) {
      window.clearTimeout(userFilterTimerRef.current)
      loadUsers(userStatus, 1, pageSize, userFilters)
      return
    }

    if (mainTab !== COMPANY_TAB) {
      return
    }

    window.clearTimeout(companyFilterTimerRef.current)
    loadCompanies(1, pageSize, companyFilters)
  }

  function goToPage(page) {
    if (mainTab === USER_TAB) {
      window.clearTimeout(userFilterTimerRef.current)
      loadUsers(userStatus, page, currentUsers.pageSize, userFilters)
      return
    }

    if (mainTab !== COMPANY_TAB) {
      return
    }

    window.clearTimeout(companyFilterTimerRef.current)
    loadCompanies(page, companies.pageSize, companyFilters)
  }

  if (!session?.access) {
    return (
      <>
        <Toast message={authError || error} onClose={() => {
          setAuthError('')
          setError('')
        }} />
        <AuthPage
          mode={authMode}
          form={authForm}
          isLoading={isAuthLoading}
          onSubmit={handleAuthSubmit}
          onChange={updateAuthField}
          onModeChange={switchAuthMode}
        />
      </>
    )
  }

  return (
    <div className="erp-shell">
      <Toast message={error} onClose={() => setError('')} />

      <aside className="sidebar" aria-label="Main navigation">
        <div className="sidebar-brand">
          <span className="brand-mark">UD</span>
          <div>
            <strong>UserDesk ERP</strong>
            <small>Admin Console</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={mainTab === HOME_TAB ? 'nav-item active' : 'nav-item'}
            onClick={() => selectMainTab(HOME_TAB)}
          >
            <span>
              <span className="nav-icon">D</span>
              Dashboard
            </span>
          </button>
          <button
            type="button"
            className={mainTab === USER_TAB ? 'nav-item active' : 'nav-item'}
            onClick={() => selectMainTab(USER_TAB)}
          >
            <span>
              <span className="nav-icon">U</span>
              Users
            </span>
            <strong>
              {getNavCount(users[ACTIVE_STATUS], dashboardSummary.data.activeUsers)}
            </strong>
          </button>
          <button
            type="button"
            className={mainTab === COMPANY_TAB ? 'nav-item active' : 'nav-item'}
            onClick={() => selectMainTab(COMPANY_TAB)}
          >
            <span>
              <span className="nav-icon">C</span>
              Companies
            </span>
            <strong>
              {getNavCount(companies, dashboardSummary.data.companyRecords)}
            </strong>
          </button>
          <button
            type="button"
            className={mainTab === DRF_LEARN_TAB ? 'nav-item active' : 'nav-item'}
            onClick={() => selectMainTab(DRF_LEARN_TAB)}
          >
            <span>
              <span className="nav-icon">L</span>
              DRF Learn
            </span>
          </button>
          <button
            type="button"
            className={
              mainTab === PYTHON_LEARN_TAB ? 'nav-item active' : 'nav-item'
            }
            onClick={() => selectMainTab(PYTHON_LEARN_TAB)}
          >
            <span>
              <span className="nav-icon">P</span>
              Python Learn
            </span>
          </button>
          {isAdmin ? (
            <button
              type="button"
              className={mainTab === ADMIN_TAB ? 'nav-item active' : 'nav-item'}
              onClick={() => selectMainTab(ADMIN_TAB)}
            >
              <span>
                <span className="nav-icon">A</span>
                Accounts
              </span>
              <strong>{accountCountLabel}</strong>
            </button>
          ) : null}
        </nav>

        <div className="sidebar-status">
          <span>{session.account.role}</span>
          <strong>{session.account.full_name}</strong>
          <small>{session.account.email}</small>
        </div>
      </aside>

      <section className="erp-main">
        <header className="navbar">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>{pageTitle}</h1>
          </div>
          <div className="navbar-actions">
            <span className="status-pill">SQLite</span>
            <span className="status-pill">React Vite</span>
            {isAdmin ? (
              <span className="status-pill">Accounts {accountCountLabel}</span>
            ) : null}
            <span className="status-pill">{API_ROOT.replace(/\/$/, '')}</span>
            {isLearnTab ? null : (
              <button type="button" onClick={refreshCurrentView}>
                Refresh View
              </button>
            )}
            <button type="button" onClick={() => handleLogout()}>
              Logout
            </button>
          </div>
        </header>

        <main className="content-area">
          {mainTab === HOME_TAB ? (
            <DashboardPanel
              summary={dashboardSummary.data}
              isLoading={dashboardSummary.isLoading}
              hasLoaded={dashboardSummary.hasLoaded}
              onOpenUsers={() => selectMainTab(USER_TAB)}
              onOpenDeletedUsers={() => {
                setUserStatus(DELETED_STATUS)
                selectMainTab(USER_TAB)
              }}
              onOpenCompanies={() => selectMainTab(COMPANY_TAB)}
              onRefresh={refreshCurrentView}
            />
          ) : mainTab === USER_TAB ? (
            <UserPanel
              userForm={userForm}
              editingUserId={editingUserId}
              isUserSaving={isUserSaving}
              userButtonLabel={userButtonLabel}
              userStatus={userStatus}
              userFilters={userFilters}
              currentUsers={currentUsers}
              deletingUserId={deletingUserId}
              restoringUserId={restoringUserId}
              visiblePages={visiblePages}
              onSubmit={handleUserSubmit}
              onChange={updateUserField}
              onFilterChange={updateUserFilter}
              onResetFilters={resetUserFilters}
              onCancel={resetUserForm}
              onSelectStatus={selectUserStatus}
              onEdit={startUserEdit}
              onDelete={deleteUser}
              onRestore={restoreUser}
              onRefresh={() =>
                loadUsers(
                  userStatus,
                  currentUsers.page,
                  currentUsers.pageSize,
                  userFilters,
                )
              }
              onPageSizeChange={changePageSize}
              onPageChange={goToPage}
            />
          ) : mainTab === COMPANY_TAB ? (
            <CompanyPanel
              companyForm={companyForm}
              editingCompanyId={editingCompanyId}
              isCompanySaving={isCompanySaving}
              companyButtonLabel={companyButtonLabel}
              dropdownUsers={filteredDropdownUsers}
              allDropdownUsers={dropdownUsers}
              dropdownSearch={dropdownSearch}
              isDropdownLoading={isDropdownLoading}
              hasDropdownLoaded={hasDropdownLoaded}
              companyFilters={companyFilters}
              companies={companies}
              deletingCompanyId={deletingCompanyId}
              visiblePages={visiblePages}
              onSubmit={handleCompanySubmit}
              onChange={updateCompanyField}
              onDropdownSearchChange={(event) => setDropdownSearch(event.target.value)}
              onLoadDropdownUsers={loadDropdownUsersOnDemand}
              onFilterChange={updateCompanyFilter}
              onResetFilters={resetCompanyFilters}
              onCancel={resetCompanyForm}
              onEdit={startCompanyEdit}
              onDelete={deleteCompany}
              onRefresh={() =>
                loadCompanies(companies.page, companies.pageSize, companyFilters)
              }
              onPageSizeChange={changePageSize}
              onPageChange={goToPage}
            />
          ) : mainTab === DRF_LEARN_TAB ? (
            <DrfLearnPanel />
          ) : mainTab === PYTHON_LEARN_TAB ? (
            <PythonLearnPanel />
          ) : (
            <AccountAdminPanel
              accounts={accounts}
              currentAccount={session.account}
              savingAccountId={savingAccountId}
              onRefresh={loadAccounts}
              onRoleChange={changeAccountRole}
              onStatusChange={toggleAccountStatus}
            />
          )}
        </main>
      </section>
    </div>
  )
}

function AuthPage({
  mode,
  form,
  isLoading,
  onSubmit,
  onChange,
  onModeChange,
}) {
  const isSignup = mode === 'signup'

  return (
    <main className="auth-shell">
      <section className="auth-panel" aria-label="Account access">
        <div className="auth-brand">
          <span className="brand-mark">UD</span>
          <div>
            <strong>UserDesk ERP</strong>
            <small>DRF JWT Console</small>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-tabs" aria-label="Auth mode">
            <button
              type="button"
              className={mode === 'login' ? 'subtab active' : 'subtab'}
              onClick={() => onModeChange('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={isSignup ? 'subtab active' : 'subtab'}
              onClick={() => onModeChange('signup')}
            >
              Signup
            </button>
          </div>

          <form className="auth-form" onSubmit={onSubmit}>
            <div>
              <p className="eyebrow">Account</p>
              <h1>{isSignup ? 'Create Account' : 'Login'}</h1>
            </div>

            {isSignup ? (
              <label>
                Full Name
                <input
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={onChange}
                  placeholder="Alex Morgan"
                />
              </label>
            ) : null}

            <label>
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="alex@example.com"
                autoComplete="email"
              />
            </label>

            <label>
              Password
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder="Password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
              />
            </label>

            <button
              className={isLoading ? 'primary button-loading' : 'primary'}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <span className="button-spinner"></span> : null}
              {isLoading
                ? isSignup
                  ? 'Creating...'
                  : 'Logging in...'
                : isSignup
                  ? 'Create Account'
                  : 'Login'}
            </button>
          </form>
        </div>
      </section>
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

function DashboardPanel({
  summary,
  isLoading,
  hasLoaded,
  onOpenUsers,
  onOpenDeletedUsers,
  onOpenCompanies,
  onRefresh,
}) {
  const insights = getDashboardInsights(summary)
  const summaryBars = getDashboardBars(summary)

  return (
    <section className="dashboard" aria-label="Dashboard">
      <section className="dashboard-showcase" aria-label="UserDesk overview">
        <div className="showcase-copy">
          <p className="eyebrow">UserDesk</p>
          <h2>Everything in order. Beautifully simple.</h2>
          <p>
            Manage people, companies, access, and learning from one focused
            workspace.
          </p>
          <div className="showcase-actions">
            <button type="button" className="primary" onClick={onOpenUsers}>
              Manage users
            </button>
            <button type="button" onClick={onOpenCompanies}>
              View companies
            </button>
          </div>
        </div>

        <div className="showcase-device" aria-hidden="true">
          <div className="device-window">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="device-metric large"></div>
          <div className="device-row"></div>
          <div className="device-row short"></div>
          <div className="device-grid">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </section>

      <div className="metric-grid">
        <MetricCard
          label="Active Users"
          value={summary.activeUsers}
          loading={isLoading}
          hasLoaded={hasLoaded}
          tone="blue"
        />
        <MetricCard
          label="Company Records"
          value={summary.companyRecords}
          loading={isLoading}
          hasLoaded={hasLoaded}
          tone="green"
        />
        <MetricCard
          label="Deleted Users"
          value={summary.deletedUsers}
          loading={isLoading}
          hasLoaded={hasLoaded}
          tone="red"
        />
        <MetricCard
          label="Accounts"
          value={summary.accountCount}
          loading={isLoading}
          hasLoaded={hasLoaded}
          tone="purple"
        />
        <MetricCard
          label="Available Users"
          value={summary.availableUsers}
          loading={isLoading}
          hasLoaded={hasLoaded}
          tone="gray"
        />
      </div>

      <section className="quick-actions" aria-label="Quick actions">
        <div>
          <p className="eyebrow">Summary</p>
          <h2>Operational Snapshot</h2>
        </div>
        <div className="actions">
          <button type="button" className="primary" onClick={onOpenUsers}>
            Add User
          </button>
          <button type="button" onClick={onOpenCompanies}>
            Add Company
          </button>
          <button type="button" onClick={onOpenDeletedUsers}>
            Deleted Users
          </button>
          <button type="button" onClick={onRefresh} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh Summary'}
          </button>
        </div>
      </section>

      <div className="chart-grid">
        <section className="records dashboard-chart" aria-label="Company coverage">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Coverage</p>
              <h2>Company Assignment</h2>
            </div>
            <button type="button" onClick={onOpenCompanies}>
              Manage
            </button>
          </div>

          <RadialChart
            label="Assigned"
            percent={insights.companyCoverage.percent}
            detail={insights.companyCoverage.detail}
            loading={isLoading}
            hasLoaded={hasLoaded}
          />
        </section>

        <section className="records dashboard-chart" aria-label="User status">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Status</p>
              <h2>User Lifecycle</h2>
            </div>
            <button type="button" onClick={onOpenDeletedUsers}>
              Review
            </button>
          </div>

          <div className="insight-stack">
            {insights.status.map((insight) => (
              <ProgressInsight
                key={insight.label}
                insight={insight}
                loading={isLoading}
                hasLoaded={hasLoaded}
              />
            ))}
          </div>
        </section>
      </div>

      <section className="records dashboard-chart" aria-label="Summary distribution">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Distribution</p>
            <h2>Summary Breakdown</h2>
          </div>
        </div>

        <div className="summary-bars">
          {summaryBars.map((bar) => (
            <SummaryBar
              key={bar.label}
              bar={bar}
              loading={isLoading}
              hasLoaded={hasLoaded}
            />
          ))}
        </div>
      </section>
    </section>
  )
}

function MetricCard({ label, value, loading, hasLoaded, tone }) {
  return (
    <article className={`metric-card ${tone}`}>
      <span>{label}</span>
      {loading ? (
        <span className="metric-skeleton"></span>
      ) : (
        <strong>{hasLoaded ? value : '-'}</strong>
      )}
    </article>
  )
}

function RadialChart({ label, percent, detail, loading, hasLoaded }) {
  const chartStyle = {
    '--chart-value': `${hasLoaded ? percent : 0}%`,
  }

  return (
    <div className="radial-chart-wrap">
      <div className="radial-chart" style={chartStyle}>
        {loading ? (
          <span className="metric-skeleton radial-skeleton"></span>
        ) : (
          <strong>{hasLoaded ? `${percent}%` : '-'}</strong>
        )}
      </div>
      <div>
        <span>{label}</span>
        <p>{hasLoaded ? detail : 'Summary not loaded yet.'}</p>
      </div>
    </div>
  )
}

function ProgressInsight({ insight, loading, hasLoaded }) {
  const progressStyle = {
    '--progress-value': `${hasLoaded ? insight.percent : 0}%`,
  }

  return (
    <article className="progress-insight">
      <div className="progress-row">
        <span>{insight.label}</span>
        {loading ? (
          <span className="skeleton-line compact"></span>
        ) : (
          <strong>{hasLoaded ? `${insight.percent}%` : '-'}</strong>
        )}
      </div>
      <div className="progress-track" style={progressStyle}>
        <span></span>
      </div>
      <p>{hasLoaded ? insight.detail : 'Summary not loaded yet.'}</p>
    </article>
  )
}

function SummaryBar({ bar, loading, hasLoaded }) {
  const barStyle = {
    '--bar-value': `${hasLoaded ? bar.percent : 0}%`,
  }

  return (
    <article className={`summary-bar ${bar.tone}`} style={barStyle}>
      <div>
        <span>{bar.label}</span>
        {loading ? (
          <span className="skeleton-line compact"></span>
        ) : (
          <strong>{hasLoaded ? bar.value : '-'}</strong>
        )}
      </div>
      <div className="bar-track">
        <span></span>
      </div>
    </article>
  )
}

function UserPanel({
  userForm,
  editingUserId,
  isUserSaving,
  userButtonLabel,
  userStatus,
  userFilters,
  currentUsers,
  deletingUserId,
  restoringUserId,
  visiblePages,
  onSubmit,
  onChange,
  onFilterChange,
  onResetFilters,
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

        <UserListFilters
          filters={userFilters}
          onChange={onFilterChange}
          onReset={onResetFilters}
        />

        {!currentUsers.hasLoaded && !currentUsers.isLoading ? (
          <p className="muted">Loading starts when this view opens.</p>
        ) : currentUsers.isLoading ? (
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
  allDropdownUsers,
  dropdownSearch,
  isDropdownLoading,
  hasDropdownLoaded,
  companyFilters,
  companies,
  deletingCompanyId,
  visiblePages,
  onSubmit,
  onChange,
  onDropdownSearchChange,
  onLoadDropdownUsers,
  onFilterChange,
  onResetFilters,
  onCancel,
  onEdit,
  onDelete,
  onRefresh,
  onPageSizeChange,
  onPageChange,
}) {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const isUserDropdownDisabled =
    isDropdownLoading || isCompanySaving || Boolean(editingCompanyId)
  const selectedUser = allDropdownUsers.find(
    (user) => String(user.id) === companyForm.userDetailId,
  )

  function toggleUserDropdown() {
    const shouldOpen = !isUserDropdownOpen

    if (shouldOpen) {
      onLoadDropdownUsers()
    }

    setIsUserDropdownOpen(shouldOpen)
  }

  function selectDropdownUser(user) {
    if (user.has_company && String(user.id) !== companyForm.userDetailId) {
      return
    }

    onChange({
      target: {
        name: 'userDetailId',
        value: String(user.id),
      },
    })
    setIsUserDropdownOpen(false)
  }

  return (
    <section className="workspace" aria-label="Company workspace">
      <form className="editor" onSubmit={onSubmit}>
        <div className="section-heading">
          <h2>{editingCompanyId ? 'Edit Company' : 'Add Company'}</h2>
        </div>

        <div className="field-group">
          <span className="field-label">User</span>
          <div className="searchable-select">
            <button
              type="button"
              className="searchable-select-trigger"
              disabled={isUserDropdownDisabled}
              aria-expanded={isUserDropdownOpen}
              onClick={toggleUserDropdown}
            >
              <span>
                {isDropdownLoading
                  ? 'Loading users...'
                  : selectedUser?.name || companyForm.userName || 'Select user'}
              </span>
              <span className="select-caret">v</span>
            </button>

            {isUserDropdownOpen ? (
              <div className="searchable-select-menu">
                <input
                  type="search"
                  value={dropdownSearch}
                  onChange={onDropdownSearchChange}
                  placeholder="Search user"
                  autoFocus
                />

                <div className="searchable-select-options">
                  {isDropdownLoading || !hasDropdownLoaded ? (
                    <span className="dropdown-empty">Loading users...</span>
                  ) : dropdownUsers.length === 0 ? (
                    <span className="dropdown-empty">No users found.</span>
                  ) : (
                    dropdownUsers.map((user) => {
                      const isSelected = String(user.id) === companyForm.userDetailId
                      const isDisabled = user.has_company && !isSelected

                      return (
                        <button
                          key={user.id}
                          type="button"
                          className={
                            isSelected
                              ? 'searchable-option selected'
                              : 'searchable-option'
                          }
                          disabled={isDisabled}
                          onClick={() => selectDropdownUser(user)}
                        >
                          <span>{user.name}</span>
                          {user.has_company ? <small>Has company</small> : null}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

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

        <CompanyListFilters
          filters={companyFilters}
          onChange={onFilterChange}
          onReset={onResetFilters}
        />

        {!companies.hasLoaded && !companies.isLoading ? (
          <p className="muted">Loading starts when this view opens.</p>
        ) : companies.isLoading ? (
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

function AccountAdminPanel({
  accounts,
  currentAccount,
  savingAccountId,
  onRefresh,
  onRoleChange,
  onStatusChange,
}) {
  return (
    <section className="records admin-panel" aria-label="Account administration">
      <div className="section-heading list-heading">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Accounts</h2>
        </div>
        <button type="button" disabled={accounts.isLoading} onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {!accounts.hasLoaded && !accounts.isLoading ? (
        <p className="muted">Loading starts when this view opens.</p>
      ) : accounts.isLoading ? (
        <AccountTableSkeleton rows={5} />
      ) : accounts.rows.length === 0 ? (
        <p className="muted">No accounts found.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.rows.map((account) => {
                const isCurrentAccount = account.id === currentAccount.id
                const isSaving = savingAccountId === account.id

                return (
                  <tr key={account.id}>
                    <td>{account.full_name}</td>
                    <td>{account.email}</td>
                    <td>
                      <select
                        className="role-select"
                        value={account.role}
                        disabled={isSaving || isCurrentAccount}
                        onChange={(event) =>
                          onRoleChange(account, event.target.value)
                        }
                      >
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                      </select>
                    </td>
                    <td>
                      <span
                        className={
                          account.is_active
                            ? 'account-status active'
                            : 'account-status inactive'
                        }
                      >
                        {account.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{formatDate(account.created_at)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className={
                            isSaving
                              ? `button-loading ${
                                  account.is_active ? 'danger' : 'restore'
                                }`
                              : account.is_active
                                ? 'danger'
                                : 'restore'
                          }
                          disabled={isSaving || isCurrentAccount}
                          onClick={() => onStatusChange(account)}
                        >
                          {isSaving ? <span className="button-spinner"></span> : null}
                          {account.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function UserListFilters({ filters, onChange, onReset }) {
  return (
    <div className="filter-panel" aria-label="User filters">
      <label>
        Global Search
        <input
          name="search"
          type="search"
          value={filters.search}
          onChange={onChange}
          placeholder="Name, gender, company, role"
        />
      </label>

      <label>
        Name
        <input
          name="name"
          type="search"
          value={filters.name}
          onChange={onChange}
          placeholder="Filter name"
        />
      </label>

      <label>
        Age
        <input
          name="age"
          type="number"
          value={filters.age}
          onChange={onChange}
          placeholder="Exact age"
        />
      </label>

      <label>
        Gender
        <select
          name="gender"
          value={filters.gender}
          onChange={onChange}
        >
          <option value="">All genders</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Non-binary">Non-binary</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
      </label>

      <label>
        Company
        <input
          name="company"
          type="search"
          value={filters.company}
          onChange={onChange}
          placeholder="Filter company"
        />
      </label>

      <label>
        Ordering
        <select
          name="ordering"
          value={filters.ordering}
          onChange={onChange}
        >
          <option value="id">Oldest first</option>
          <option value="-id">Newest first</option>
          <option value="name">Name A-Z</option>
          <option value="-name">Name Z-A</option>
          <option value="age">Age low-high</option>
          <option value="-age">Age high-low</option>
          <option value="gender">Gender A-Z</option>
          <option value="-gender">Gender Z-A</option>
          <option value="company_details__company_name">Company A-Z</option>
          <option value="-company_details__company_name">Company Z-A</option>
        </select>
      </label>

      <button type="button" onClick={onReset}>
        Clear Filters
      </button>
    </div>
  )
}

function CompanyListFilters({ filters, onChange, onReset }) {
  return (
    <div className="filter-panel" aria-label="Company filters">
      <label>
        Global Search
        <input
          name="search"
          type="search"
          value={filters.search}
          onChange={onChange}
          placeholder="User, company, role, location"
        />
      </label>

      <label>
        User Name
        <input
          name="userName"
          type="search"
          value={filters.userName}
          onChange={onChange}
          placeholder="Filter user"
        />
      </label>

      <label>
        Company
        <input
          name="companyName"
          type="search"
          value={filters.companyName}
          onChange={onChange}
          placeholder="Filter company"
        />
      </label>

      <label>
        Role
        <input
          name="role"
          type="search"
          value={filters.role}
          onChange={onChange}
          placeholder="Filter role"
        />
      </label>

      <label>
        Location
        <input
          name="location"
          type="search"
          value={filters.location}
          onChange={onChange}
          placeholder="Filter location"
        />
      </label>

      <label>
        Ordering
        <select
          name="ordering"
          value={filters.ordering}
          onChange={onChange}
        >
          <option value="id">Oldest first</option>
          <option value="-id">Newest first</option>
          <option value="user_detail__name">User A-Z</option>
          <option value="-user_detail__name">User Z-A</option>
          <option value="company_name">Company A-Z</option>
          <option value="-company_name">Company Z-A</option>
          <option value="role">Role A-Z</option>
          <option value="-role">Role Z-A</option>
          <option value="location">Location A-Z</option>
          <option value="-location">Location Z-A</option>
        </select>
      </label>

      <button type="button" onClick={onReset}>
        Clear Filters
      </button>
    </div>
  )
}

function Pagination({ listState, visiblePages, onPageSizeChange, onPageChange }) {
  const isDisabled = listState.isLoading || !listState.hasLoaded

  return (
    <footer className="pagination">
      <label className="page-size">
        Rows per page
        <select
          value={listState.pageSize}
          onChange={onPageSizeChange}
          disabled={isDisabled}
        >
          {PAGE_SIZE_OPTIONS.map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </select>
      </label>

      <span className="page-summary">{getPageRangeText(listState)}</span>

      <div className="page-controls">
        <button
          type="button"
          disabled={isDisabled || listState.page <= 1}
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
              disabled={isDisabled}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={isDisabled || listState.page >= listState.totalPages}
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

function AccountTableSkeleton({ rows }) {
  const skeletonRows = Array.from({ length: Math.max(1, rows) })

  return (
    <SkeletonTable
      headers={['Name', 'Email', 'Role', 'Status', 'Created', 'Actions']}
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

function loadStoredSession() {
  if (typeof window === 'undefined') {
    return null
  }

  const access = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  const rawAccount = window.localStorage.getItem(AUTH_ACCOUNT_STORAGE_KEY)

  if (!access || !rawAccount) {
    return null
  }

  try {
    return {
      access,
      account: JSON.parse(rawAccount),
    }
  } catch {
    clearStoredSession()
    return null
  }
}

function saveStoredSession(session) {
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, session.access)
  window.localStorage.setItem(
    AUTH_ACCOUNT_STORAGE_KEY,
    JSON.stringify(session.account),
  )
}

function clearStoredSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(AUTH_ACCOUNT_STORAGE_KEY)
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

function appendParam(params, key, value) {
  const trimmedValue = String(value || '').trim()

  if (trimmedValue) {
    params.set(key, trimmedValue)
  }
}

function filterDropdownUsers(users, search, selectedUserId) {
  const keyword = search.trim().toLowerCase()

  if (!keyword) {
    return users
  }

  return users.filter((user) => {
    const isSelected = String(user.id) === selectedUserId
    const matchesName = user.name.toLowerCase().includes(keyword)

    return isSelected || matchesName
  })
}

function normalizeDashboardSummary(data) {
  return {
    activeUsers: readNumber(data, [
      'activeUsers',
      'active_users',
      'active_user_count',
      'totalActiveUsers',
      'total_active_users',
    ]),
    companyRecords: readNumber(data, [
      'companyRecords',
      'company_records',
      'company_count',
      'companies',
      'totalCompanies',
      'total_companies',
    ]),
    deletedUsers: readNumber(data, [
      'deletedUsers',
      'deleted_users',
      'deleted_user_count',
      'totalDeletedUsers',
      'total_deleted_users',
    ]),
    accountCount: readNumber(data, [
      'accountCount',
      'account_count',
      'accounts',
      'totalAccounts',
      'total_accounts',
    ]),
    availableUsers: readNumber(data, [
      'availableUsers',
      'available_users',
      'available_user_count',
      'users_without_company',
      'unassigned_users',
    ]),
  }
}

function getDashboardInsights(summary) {
  const activeUsers = summary.activeUsers
  const deletedUsers = summary.deletedUsers
  const totalUsers = activeUsers + deletedUsers
  const assignedUsers = Math.max(0, activeUsers - summary.availableUsers)

  return {
    companyCoverage: {
      percent: getPercent(summary.companyRecords, activeUsers),
      detail: `${summary.companyRecords} company records for ${activeUsers} active users`,
    },
    status: [
      {
        label: 'Active share',
        percent: getPercent(activeUsers, totalUsers),
        detail: `${activeUsers} active of ${totalUsers} total users`,
      },
      {
        label: 'Archived share',
        percent: getPercent(deletedUsers, totalUsers),
        detail: `${deletedUsers} deleted user records`,
      },
      {
        label: 'Assigned users',
        percent: getPercent(assignedUsers, activeUsers),
        detail: `${assignedUsers} active users already have companies`,
      },
    ],
  }
}

function getDashboardBars(summary) {
  const bars = [
    {
      label: 'Active Users',
      value: summary.activeUsers,
      tone: 'blue',
    },
    {
      label: 'Company Records',
      value: summary.companyRecords,
      tone: 'green',
    },
    {
      label: 'Deleted Users',
      value: summary.deletedUsers,
      tone: 'red',
    },
    {
      label: 'Accounts',
      value: summary.accountCount,
      tone: 'purple',
    },
    {
      label: 'Available Users',
      value: summary.availableUsers,
      tone: 'gray',
    },
  ]
  const maxValue = Math.max(...bars.map((bar) => bar.value), 1)

  return bars.map((bar) => ({
    ...bar,
    percent: Math.round((bar.value / maxValue) * 100),
  }))
}

function readNumber(data, keys) {
  for (const key of keys) {
    const value = data?.[key]
    const numberValue = Number(value)

    if (Number.isFinite(numberValue)) {
      return numberValue
    }
  }

  return 0
}

function getPercent(value, total) {
  if (!total) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round((value / total) * 100)))
}

function getPageTitle(mainTab, userStatus) {
  if (mainTab === HOME_TAB) {
    return 'Dashboard'
  }

  if (mainTab === USER_TAB) {
    return userStatus === ACTIVE_STATUS ? 'User Management' : 'Deleted Users'
  }

  if (mainTab === ADMIN_TAB) {
    return 'Account Administration'
  }

  if (mainTab === DRF_LEARN_TAB) {
    return 'DRF Learning Center'
  }

  if (mainTab === PYTHON_LEARN_TAB) {
    return 'Python Learning Center'
  }

  return 'Company Management'
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getPageRangeText(listState) {
  if (!listState.hasLoaded) {
    return 'Records not loaded'
  }

  if (listState.isLoading) {
    return 'Loading records'
  }

  if (listState.count === 0) {
    return 'No records'
  }

  const start = (listState.page - 1) * listState.pageSize + 1
  const end = Math.min(listState.count, listState.page * listState.pageSize)

  return `Showing ${start}-${end} of ${listState.count}`
}

function getNavCount(listState, fallbackCount = null) {
  if (listState.hasLoaded) {
    return listState.count
  }

  return fallbackCount === null ? '-' : fallbackCount
}

function getAccountCountLabel(accounts, dashboardSummary) {
  if (accounts.hasLoaded) {
    return accounts.rows.length
  }

  if (dashboardSummary.hasLoaded) {
    return dashboardSummary.data.accountCount
  }

  return '-'
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
