import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import {
  type Body_login_login_access_token as AccessToken,
  LoginService,
  type UserPublic,
  type UserRegister,
  UsersService,
} from "@/client"
import { handleError } from "@/utils"
import useCustomToast from "./useCustomToast"

const isLoggedIn = () => {
  return localStorage.getItem("access_token") !== null
}

const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showErrorToast } = useCustomToast()

  const { data: user } = useQuery<UserPublic | null, Error>({
    queryKey: ["currentUser"],
    queryFn: UsersService.readUserMe,
    enabled: isLoggedIn(),
  })

  // Get other accounts from localStorage safely
  const getOtherAccounts = () => {
    try {
      const stored = localStorage.getItem("other_accounts")
      if (!stored) return []
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      return []
    }
  }

  const signUpMutation = useMutation({
    mutationFn: (data: UserRegister) =>
      UsersService.registerUser({ requestBody: data }),
    onSuccess: () => {
      navigate({ to: "/login" })
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const login = async (data: AccessToken) => {
    // 1. Get the token
    const response = await LoginService.loginAccessToken({
      formData: data,
    })
    
    if (!response || !response.access_token) {
      throw new Error("No token received")
    }

    const token = response.access_token
    localStorage.setItem("access_token", token)

    // 2. Persist account to multi-login list immediately using form data
    // This ensures the account is "switchable" even before the next API call finishes
    const others = getOtherAccounts()
    const filtered = others.filter((a: any) => a.email !== data.username)
    const newList = [...filtered, { 
      email: data.username, 
      token, 
      full_name: data.username, // Fallback name
      role: "unknown" 
    }]
    localStorage.setItem("other_accounts", JSON.stringify(newList))

    // 3. Try to enrich the stored account with full user info in the background
    UsersService.readUserMe().then(userInfo => {
      const currentOthers = getOtherAccounts()
      const updatedList = currentOthers.map((acc: any) => 
        acc.email === userInfo.email 
          ? { ...acc, full_name: userInfo.full_name || userInfo.email, role: userInfo.role }
          : acc
      )
      localStorage.setItem("other_accounts", JSON.stringify(updatedList))
    }).catch(e => {
      console.warn("Could not enrich account info", e)
    })

    return response
  }

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.clear()
      navigate({ to: "/" })
    },
    onError: handleError.bind(showErrorToast),
  })

  const logout = () => {
    const currentToken = localStorage.getItem("access_token")
    const others = getOtherAccounts()
    
    const newList = others.filter((a: any) => a.token !== currentToken)
    localStorage.setItem("other_accounts", JSON.stringify(newList))
    
    localStorage.removeItem("access_token")
    queryClient.clear()
    
    if (newList.length > 0) {
      switchAccount(newList[0].email)
    } else {
      navigate({ to: "/login" })
    }
  }

  const switchAccount = (email: string) => {
    const others = getOtherAccounts()
    const account = others.find((a: any) => a.email === email)
    if (account) {
      localStorage.setItem("access_token", account.token)
      queryClient.clear()
      window.location.href = "/" // Hard reload to reset all app state
    }
  }

  const addAccount = () => {
    navigate({ to: "/login", search: { add_account: true } as any })
  }

  return {
    signUpMutation,
    loginMutation,
    logout,
    user,
    accounts: getOtherAccounts(),
    switchAccount,
    addAccount,
  }
}

export { isLoggedIn }
export default useAuth
