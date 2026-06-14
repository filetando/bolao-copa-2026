import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { router } from './router.tsx'

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
