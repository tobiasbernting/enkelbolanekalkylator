import { useMemo } from 'react'
import { isValidResultQuery } from '../utils/resultQueryValidation'

export function useShouldRedirectToResult(pathname: string, searchStr: string): boolean {
  return useMemo(
    () => pathname === '/' && isValidResultQuery(searchStr),
    [pathname, searchStr]
  )
}
