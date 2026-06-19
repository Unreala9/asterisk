import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard/analytics')({
  component: () => {
    // Re-use the dashboard home for analytics or redirect
    return <div>Analytics Dashboard Content...</div>
  }
})
