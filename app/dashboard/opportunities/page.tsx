"use client";

import { useMemo, useState, useEffect, type ChangeEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  Loader2Icon,
  MailIcon,
  SparklesIcon,
  UploadIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  OPPORTUNITY_LOCATIONS,
  OPPORTUNITY_TYPES,
  type AnalyzeOpportunitiesResponse,
  type OpportunityLocation,
  type OpportunityType,
  type RawOpportunityEmail,
  type StudentProfile,
} from "@/lib/opportunity-inbox/types";
import { InboxSimulator } from "@/components/InboxSimulator";

const DEGREE_LEVEL_OPTIONS = ["bachelors", "masters", "phd"] as const;

const SAMPLE_EMAILS = [
  {
    subject: "Scholarship Call 2026 - Fully Funded Masters in Germany",
    sender: "admissions@global-scholarships.org",
    body: "Applications are now open for a fully funded masters scholarship. Deadline: 30 May 2026. Eligible majors include computer science, software engineering, and data science. Minimum CGPA 3.0. Required documents: CV, transcript, statement of purpose, recommendation letter. Apply at https://global-scholarships.org/apply",
  },
  {
    subject: "Summer Internship Program - Product Engineering",
    sender: "careers@byteworks.io",
    body: "ByteWorks Summer Internship is open for 6th-8th semester students in CS/SE/IT. Location: Lahore hybrid. Deadline 15 June 2026. Skills: React, TypeScript, problem solving. Submit resume and cover letter at https://byteworks.io/internships",
  },
  {
    subject: "National AI Challenge 2026",
    sender: "challenge@aipakistan.pk",
    body: "Register your team for National AI Challenge. Cash prize and mentorship available. Deadline: 10-06-2026. Open to all majors with interest in machine learning. Required: project idea deck and team profile. Registration link: https://aipakistan.pk/challenge",
  },
  {
    subject: "Fellowship Opportunity - Social Impact Tech",
    sender: "fellowships@impacthub.org",
    body: "12-month fellowship for emerging builders. International cohort with remote collaboration. Deadline July 5, 2026. Benefits include stipend and mentorship. Skills preferred: leadership, communication, research. Apply: https://impacthub.org/fellowship",
  },
  {
    subject: "Graduate Admissions Open - Fall 2026",
    sender: "gradadmissions@techuniversity.edu",
    body: "Applications now open for MS Computer Science. Deadline: 01/07/2026. Minimum GPA 2.8. Required documents: transcript, recommendation letter, statement of purpose, test scores. Program details: https://techuniversity.edu/grad/apply",
  },
] satisfies Array<Pick<RawOpportunityEmail, "subject" | "sender" | "body">>;

function createDefaultProfile(): StudentProfile {
  const now = new Date();

  return {
    fullName: "",
    university: "FAST-NUCES Lahore",
    degreeLevel: "bachelors",
    major: "Computer Science",
    semester: 6,
    cgpa: 3,
    graduationYear: now.getFullYear() + 2,
    targetOpportunityTypes: ["internship", "scholarship", "competition"],
    preferredLocations: ["pakistan", "remote"],
    skills: ["javascript", "react"],
    interests: ["ai", "product engineering"],
    availabilityHoursPerWeek: 12,
    needsFinancialAid: true,
  };
}

function parseCommaSeparated(input: string) {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBulkEmails(text: string): RawOpportunityEmail[] {
  const blocks = text
    .split(/\n\s*---\s*\n/g)
    .map((entry) => entry.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const subjectLine = lines.find((line) => line.toLowerCase().startsWith("subject:"));
    const senderLine = lines.find((line) => line.toLowerCase().startsWith("from:"));

    const bodyStart = Math.max(
      subjectLine ? lines.indexOf(subjectLine) + 1 : 0,
      senderLine ? lines.indexOf(senderLine) + 1 : 0,
    );

    return {
      id: `email-${index + 1}`,
      subject: subjectLine ? subjectLine.replace(/^subject:\s*/i, "") : `Opportunity Email ${index + 1}`,
      sender: senderLine ? senderLine.replace(/^from:\s*/i, "") : "unknown@source.local",
      receivedAt: new Date().toISOString(),
      body: lines.slice(bodyStart).join(" ") || block,
    } satisfies RawOpportunityEmail;
  });
}

function formatOpportunityType(type: OpportunityType) {
  return `${type[0]?.toUpperCase() ?? ""}${type.slice(1)}`;
}

function formatLocation(location: OpportunityLocation) {
  return `${location[0]?.toUpperCase() ?? ""}${location.slice(1)}`;
}

export default function OpportunityInboxPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<StudentProfile>(createDefaultProfile);
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<RawOpportunityEmail[]>([]);

  // Auto-load sample data when ?demo=true
  useEffect(() => {
    if (searchParams.get("demo") === "true") {
      handleLoadSample();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AnalyzeOpportunitiesResponse | null>(null);
  const [useDemoFallback, setUseDemoFallback] = useState(true);

  const emailCount = emails.length;

  const readinessIssues = useMemo(() => {
    const issues: string[] = [];

    if (!profile.fullName.trim()) {
      issues.push("Student name is required.");
    }

    if (emailCount < 5 || emailCount > 15) {
      issues.push("Add between 5 and 15 emails.");
    }

    return issues;
  }, [profile.fullName, emailCount]);

  const canAnalyze = readinessIssues.length === 0 && !isAnalyzing;

  const handleLoadSample = () => {
    const sample = SAMPLE_EMAILS.map((entry, index) => ({
      id: `email-${index + 1}`,
      subject: entry.subject,
      sender: entry.sender,
      receivedAt: new Date().toISOString(),
      body: entry.body,
    }));

    setEmails(sample);
    setEmailInput(
      SAMPLE_EMAILS.map(
        (entry) => `Subject: ${entry.subject}\nFrom: ${entry.sender}\n${entry.body}`,
      ).join("\n---\n"),
    );
  };

  const handleParseEmails = () => {
    const parsed = parseBulkEmails(emailInput);
    setEmails(parsed);

    if (parsed.length === 0) {
      setError("Could not parse emails. Please provide valid email blocks.");
    } else {
      setError(null);
    }
  };

  const handleUploadEmails = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    const contents = await Promise.all(
      files.map(async (file) => {
        try {
          return await file.text();
        } catch {
          return "";
        }
      }),
    );

    const uploadedText = contents
      .map((content) => content.trim())
      .filter(Boolean)
      .join("\n---\n");

    if (!uploadedText) {
      setError("Could not read selected files. Please upload plain-text email files.");
      event.target.value = "";
      return;
    }

    const nextInput = emailInput.trim()
      ? `${emailInput.trim()}\n---\n${uploadedText}`
      : uploadedText;

    setEmailInput(nextInput);

    const parsed = parseBulkEmails(nextInput);
    setEmails(parsed);
    setError(null);
    event.target.value = "";
  };

  const updateTypeSelection = (type: OpportunityType) => {
    setProfile((current) => {
      const hasType = current.targetOpportunityTypes.includes(type);
      const next = hasType
        ? current.targetOpportunityTypes.filter((item) => item !== type)
        : [...current.targetOpportunityTypes, type];

      return {
        ...current,
        targetOpportunityTypes: next.length > 0 ? next : [type],
      };
    });
  };

  const updateLocationSelection = (location: OpportunityLocation) => {
    setProfile((current) => {
      const hasLocation = current.preferredLocations.includes(location);
      const next = hasLocation
        ? current.preferredLocations.filter((item) => item !== location)
        : [...current.preferredLocations, location];

      return {
        ...current,
        preferredLocations: next.length > 0 ? next : [location],
      };
    });
  };

  const analyze = async () => {
    if (!canAnalyze) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/opportunities/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emails,
          profile,
          useDemoFallback,
        }),
      });

      const data = (await res.json()) as
        | (AnalyzeOpportunitiesResponse & { sessionId?: string })
        | { error?: string };

      if (!res.ok) {
        throw new Error(
          "error" in data && data.error ? data.error : "Failed to analyze opportunities.",
        );
      }

      const result = data as AnalyzeOpportunitiesResponse & { sessionId?: string };

      // Redirect to session results page if we got a sessionId
      if (result.sessionId) {
        router.push(`/dashboard/results/${result.sessionId}`);
        return;
      }

      setResponse(result);
    } catch (analysisError) {
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "Failed to analyze opportunities.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="surface-glass border-border/70">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            Opportunity Inbox Copilot
          </CardTitle>
          <CardDescription>
            Parse 5-15 opportunity emails, match against a structured student profile,
            and get deterministic priority ranking with evidence-backed reasons.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full-name">Student Name</Label>
              <Input
                id="full-name"
                value={profile.fullName}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    fullName: event.target.value,
                  }))
                }
                placeholder="Ayesha Khan"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                value={profile.university}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    university: event.target.value,
                  }))
                }
                placeholder="FAST-NUCES Lahore"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="degree-level">Degree Level</Label>
              <select
                id="degree-level"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={profile.degreeLevel}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    degreeLevel: event.target.value as StudentProfile["degreeLevel"],
                  }))
                }
              >
                {DEGREE_LEVEL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option[0]?.toUpperCase()}
                    {option.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="major">Major</Label>
              <Input
                id="major"
                value={profile.major}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    major: event.target.value,
                  }))
                }
                placeholder="Computer Science"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Input
                id="semester"
                type="number"
                min={1}
                max={16}
                value={profile.semester}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    semester: Number(event.target.value || 1),
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cgpa">CGPA (0-4)</Label>
              <Input
                id="cgpa"
                type="number"
                min={0}
                max={4}
                step={0.01}
                value={profile.cgpa}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    cgpa: Number(event.target.value || 0),
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="graduation-year">Graduation Year</Label>
              <Input
                id="graduation-year"
                type="number"
                value={profile.graduationYear}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    graduationYear: Number(event.target.value || new Date().getFullYear()),
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability-hours">Availability Hours / Week</Label>
              <Input
                id="availability-hours"
                type="number"
                min={1}
                max={80}
                value={profile.availabilityHoursPerWeek}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    availabilityHoursPerWeek: Number(event.target.value || 1),
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={profile.skills.join(", ")}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    skills: parseCommaSeparated(event.target.value),
                  }))
                }
                placeholder="python, react, research"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Interests (comma-separated)</Label>
              <Input
                id="interests"
                value={profile.interests.join(", ")}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    interests: parseCommaSeparated(event.target.value),
                  }))
                }
                placeholder="machine learning, product, social impact"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target Opportunity Types</Label>
            <div className="flex flex-wrap gap-2">
              {OPPORTUNITY_TYPES.map((type) => {
                const active = profile.targetOpportunityTypes.includes(type);

                return (
                  <Button
                    key={type}
                    type="button"
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateTypeSelection(type)}
                  >
                    {formatOpportunityType(type)}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preferred Locations</Label>
            <div className="flex flex-wrap gap-2">
              {OPPORTUNITY_LOCATIONS.map((location) => {
                const active = profile.preferredLocations.includes(location);

                return (
                  <Button
                    key={location}
                    type="button"
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateLocationSelection(location)}
                  >
                    {formatLocation(location)}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={profile.needsFinancialAid}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    needsFinancialAid: event.target.checked,
                  }))
                }
              />
              Needs financial aid priority
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useDemoFallback}
                onChange={(event) => setUseDemoFallback(event.target.checked)}
              />
              Use fallback if API fails
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="surface-glass border-border/70">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Email Intake</CardTitle>
          <CardDescription>
            Paste 5-15 email blocks with this format: Subject, From, Body. Separate each
            email by a line containing ---
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={emailInput}
            onChange={(event) => setEmailInput(event.target.value)}
            className="min-h-64"
            placeholder={[
              "Subject: Scholarship Opportunity 2026",
              "From: opportunities@xyz.org",
              "Deadline 20 June 2026. Minimum CGPA 3.2. Apply at https://...",
              "---",
              "Subject: Internship Program 2026",
              "From: careers@abc.com",
              "...",
            ].join("\n")}
          />

          <div className="space-y-2">
            <Label htmlFor="email-file-upload">Optional: Upload email text files</Label>
            <input
              id="email-file-upload"
              type="file"
              accept=".txt,.md,.eml"
              multiple
              onChange={handleUploadEmails}
              className="block w-full cursor-pointer rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={handleLoadSample}>
              <SparklesIcon className="size-4" />
              Load Sample Emails
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEmailInput("");
                setEmails([]);
              }}
            >
              <UploadIcon className="size-4" />
              Clear Text
            </Button>
            <Button type="button" variant="outline" onClick={handleParseEmails}>
              <MailIcon className="size-4" />
              Parse Emails
            </Button>
            <Button type="button" onClick={analyze} disabled={!canAnalyze}>
              {isAnalyzing ? <Loader2Icon className="size-4 animate-spin" /> : <CheckCircle2Icon className="size-4" />}
              Analyze & Rank Opportunities
            </Button>
          </div>

          <div className="rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-sm">
            Parsed emails: <span className="font-medium">{emailCount}</span>
            {readinessIssues.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-destructive">
                {readinessIssues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-primary">Ready for analysis.</p>
            )}
          </div>

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {emails.length > 0 ? (
        <Card className="surface-glass border-border/70">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Inbox Preview</CardTitle>
            <CardDescription>
              {emails.length} email{emails.length !== 1 ? "s" : ""} loaded — ready for analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InboxSimulator emails={emails} />
          </CardContent>
        </Card>
      ) : null}

      {response ? (
        <section className="space-y-4">
          <Card className="surface-glass border-border/70">
            <CardHeader>
              <CardTitle className="font-heading text-xl">Analysis Summary</CardTitle>
              <CardDescription>
                Provider: {response.provider === "grok" ? "Grok AI" : "Heuristic fallback"} | Extracted: {response.extractedCount} opportunity items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-border/70 bg-background/70 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Generated At</p>
                  <p className="mt-1 font-medium">{new Date(response.generatedAt).toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-background/70 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Top Rank Score</p>
                  <p className="mt-1 font-medium">{response.opportunities[0]?.scoreBreakdown.total ?? 0}/100</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-background/70 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Total Opportunities</p>
                  <p className="mt-1 font-medium">{response.opportunities.length}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-background/70 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Average Score</p>
                  <p className="mt-1 font-medium">{response.summary?.avgScore ?? 0}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {response.opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="surface-glass border-border/70">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="font-heading text-lg">
                        #{opportunity.rank} {opportunity.title}
                      </CardTitle>
                      <CardDescription>
                        {opportunity.organization} | {formatOpportunityType(opportunity.opportunityType)} | {formatLocation(opportunity.location)}
                      </CardDescription>
                    </div>

                    <Badge variant={opportunity.rank <= 3 ? "default" : "secondary"}>
                      Score {opportunity.scoreBreakdown.total}/100
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 text-sm">
                  <p className="text-muted-foreground">{opportunity.summary}</p>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Profile Fit</p>
                      <Progress value={(opportunity.scoreBreakdown.profileFit / 60) * 100} />
                      <p>{opportunity.scoreBreakdown.profileFit}/60</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Urgency</p>
                      <Progress value={(opportunity.scoreBreakdown.urgency / 25) * 100} />
                      <p>{opportunity.scoreBreakdown.urgency}/25</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Completeness</p>
                      <Progress value={(opportunity.scoreBreakdown.completeness / 15) * 100} />
                      <p>{opportunity.scoreBreakdown.completeness}/15</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium">Evidence-backed reasons</p>
                    <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                      {opportunity.reasons.slice(0, 6).map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium">Action checklist</p>
                    <ul className="space-y-2">
                      {opportunity.actionChecklist.map((item) => (
                        <li
                          key={item.id}
                          className="rounded-lg border border-border/70 bg-background/60 px-3 py-2"
                        >
                          <p className="font-medium">{item.task}</p>
                          <p className="text-xs text-muted-foreground">{item.evidence}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {opportunity.applicationLink ? (
                      <a
                        className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary"
                        href={opportunity.applicationLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open Application Link
                      </a>
                    ) : (
                      <Badge variant="outline">No application link extracted</Badge>
                    )}

                    {opportunity.urgencyDays !== null && opportunity.urgencyDays <= 7 ? (
                      <Badge className="bg-destructive/15 text-destructive" variant="outline">
                        <AlertTriangleIcon className="mr-1 size-3" />
                        Deadline in {opportunity.urgencyDays} day(s)
                      </Badge>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
