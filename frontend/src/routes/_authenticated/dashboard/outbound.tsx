import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PhoneForwarded, Upload, PlayCircle, Clock } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/dashboard/outbound')({
  component: OutboundPage,
})

function OutboundPage() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Outbound Campaigns</h1>
        <p className="text-muted-foreground">
          Create and manage automated outbound calling campaigns.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Call Action */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneForwarded className="h-5 w-5 text-primary" />
              Quick Call
            </CardTitle>
            <CardDescription>
              Make a single automated call immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input placeholder="+91 98765-43210" />
            </div>
            <div className="space-y-2">
              <Label>Select Agent</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent1">Sales BDR</SelectItem>
                  <SelectItem value="agent2">Survey Collector</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Context / Custom Data (Optional)</Label>
              <Input placeholder="e.g. Lead's name is John" />
            </div>
          </CardContent>
          <CardFooter className="pt-4 border-t mt-auto">
            <Button className="w-full gap-2">
              <PlayCircle className="h-4 w-4" />
              Start Call Now
            </Button>
          </CardFooter>
        </Card>

        {/* Batch Campaign */}
        <Card className="flex flex-col lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              New Batch Campaign
            </CardTitle>
            <CardDescription>
              Upload a list of leads to start an automated calling campaign.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input placeholder="e.g. Q3 Reactivation" />
              </div>
              <div className="space-y-2">
                <Label>Select Agent</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent1">Sales BDR</SelectItem>
                    <SelectItem value="agent2">Survey Collector</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Upload Contact List (CSV)</Label>
              <div className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center bg-muted/20">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-medium text-sm">Click to upload or drag and drop</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                  CSV must include a "phone" column. Optional columns: name, email, company.
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  Browse Files
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4 border-t mt-auto flex justify-between">
            <Button variant="ghost" className="gap-2">
              <Clock className="h-4 w-4" />
              Schedule for Later
            </Button>
            <Button className="gap-2">
              <PlayCircle className="h-4 w-4" />
              Launch Campaign
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Active Campaigns List placeholder */}
      <h3 className="text-xl font-semibold tracking-tight mt-6">Active & Recent Campaigns</h3>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <PhoneForwarded className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
          <h4 className="text-lg font-medium">No campaigns yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Start a quick call or launch a batch campaign to see it here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
