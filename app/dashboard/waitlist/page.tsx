import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  listWaitlistSignups,
  type WaitlistSignup,
  WaitlistError,
} from "@/lib/db/waitlist";

const dateFormatter = new Intl.DateTimeFormat("en-PK", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function countUniqueDomains(signups: WaitlistSignup[]) {
  const domains = new Set(
    signups
      .map((entry) => entry.email.split("@")[1]?.toLowerCase())
      .filter((domain): domain is string => Boolean(domain)),
  );

  return domains.size;
}

export default async function DashboardWaitlistPage() {
  let signups: WaitlistSignup[] = [];
  let loadError: string | null = null;

  try {
    signups = await listWaitlistSignups(500);
  } catch (error) {
    loadError =
      error instanceof WaitlistError
        ? error.message
        : "Unable to load waitlist entries.";
  }

  const totalSignups = signups.length;
  const uniqueDomains = countUniqueDomains(signups);
  const latestSignup = signups[0]?.created_at;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="surface-glass border-border/70">
          <CardHeader className="pb-2">
            <CardDescription>Total Waitlist Signups</CardDescription>
            <CardTitle className="font-heading text-3xl">{totalSignups}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="surface-glass border-border/70">
          <CardHeader className="pb-2">
            <CardDescription>Unique Email Domains</CardDescription>
            <CardTitle className="font-heading text-3xl">{uniqueDomains}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="surface-glass border-border/70 sm:col-span-2 xl:col-span-1">
          <CardHeader className="pb-2">
            <CardDescription>Latest Signup</CardDescription>
            <CardTitle className="font-heading text-lg">
              {latestSignup ? formatDate(latestSignup) : "No signups yet"}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="surface-glass border-border/70">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Waitlist Entries</CardTitle>
          <CardDescription>
            Protected view for your team. Data is sourced directly from Supabase.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loadError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {loadError}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {signups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No waitlist signups yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  signups.map((signup) => (
                    <TableRow key={signup.id}>
                      <TableCell className="font-medium">{signup.email}</TableCell>
                      <TableCell>{signup.source}</TableCell>
                      <TableCell>{signup.city ?? "-"}</TableCell>
                      <TableCell>{signup.company_name ?? "-"}</TableCell>
                      <TableCell>{formatDate(signup.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}