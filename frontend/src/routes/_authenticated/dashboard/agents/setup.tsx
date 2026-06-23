import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard/agents/setup')({
  beforeLoad: ({ search }) => {
    throw redirect({
      to: '/dashboard/agents/new',
      search: {
        agentId: search.agentId,
      },
    })
  },
  validateSearch: (search: Record<string, unknown>) => ({
    agentId: typeof search.agentId === "string" ? search.agentId : undefined,
  }),
})
