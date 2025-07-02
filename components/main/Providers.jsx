'use client'

import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import AuthHydrator from '@/components/main/AuthHydrator'

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthHydrator />
      {children}
    </Provider>
  )
}
