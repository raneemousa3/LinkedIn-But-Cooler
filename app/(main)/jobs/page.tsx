import { getJobs } from "@/app/actions/job"
import { CreateJobForm } from "@/components/features/create-job-form"
import { JobListings } from "@/components/features/job-listings"

export default async function JobsPage() {
  const jobs = await getJobs()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Jobs & Opportunities</h1>
        <p className="text-muted-foreground">
          Find freelance gigs, full-time positions, and creative opportunities
        </p>
      </div>

      <CreateJobForm />

      <JobListings initialJobs={jobs} />
    </div>
  )
}
