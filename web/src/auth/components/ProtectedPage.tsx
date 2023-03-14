import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { isLoggedIn } from "@app/auth/helpers/auth.helper"
import { paths } from "@app/consts"

const ProtedtedPage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  if (!isLoggedIn()) {
    const currentPath = `${location.pathname}${location.search}`
    return <Navigate to={`${paths.login}?go=${encodeURI(currentPath)}`} />
  }

  return <>{children}</>
}

export default ProtedtedPage