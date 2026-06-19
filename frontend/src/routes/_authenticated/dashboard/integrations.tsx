import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Blocks, Key, Webhook } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/dashboard/integrations')({
  component: IntegrationsPage,
})

function IntegrationsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Connect external systems, manage API keys, and configure webhooks.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              API Keys
            </CardTitle>
            <CardDescription>
              Use these keys to authenticate API requests from your application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Secret Key</div>
              <div className="flex gap-2">
                <Input type="password" value="No API key generated" readOnly />
                <Button variant="outline">Copy</Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="ghost">Generate New Key</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" />
              Webhooks
            </CardTitle>
            <CardDescription>
              Receive real-time updates about call status and transcripts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-4 bg-muted/20">
              <h4 className="text-sm font-medium mb-1">No Webhook Configured</h4>
              <p className="text-xs text-muted-foreground mb-3">Add an endpoint to receive real-time updates.</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Edit</Button>
                <Button size="sm" variant="outline">Test Ping</Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="ghost">Add Endpoint</Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Blocks className="h-5 w-5 text-primary" />
              Third-Party Integrations
            </CardTitle>
            <CardDescription>
              Native integrations with CRMs and external platforms.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {['HubSpot', 'Salesforce', 'Make.com', 'Zapier', 'Slack', 'Zendesk'].map(integration => (
                <div key={integration} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <span className="font-medium">{integration}</span>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
