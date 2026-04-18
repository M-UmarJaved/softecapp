import type { RawEmail } from "@/lib/types";

/** 8 realistic sample emails — mix of real opportunities + 1 spam for demo realism */
export const SAMPLE_EMAILS: RawEmail[] = [
  {
    id: "sample-1",
    subject: "Fully Funded MS Scholarship 2026 — Germany",
    sender: "admissions@global-scholarships.org",
    body: `Dear Student,

Applications are now open for a fully funded Masters scholarship at TU Munich.
Deadline: 30 May 2026. Eligible majors: Computer Science, Software Engineering, Data Science.
Minimum CGPA: 3.0. Benefits: full tuition, EUR 850/month stipend, accommodation.
Required documents: CV, transcript, statement of purpose, recommendation letter.
Apply at https://global-scholarships.org/apply`,
  },
  {
    id: "sample-2",
    subject: "Summer Internship 2026 — Product Engineering at ByteWorks",
    sender: "careers@byteworks.io",
    body: `Hi,

ByteWorks Summer Internship is open for 6th–8th semester students in CS/SE/IT.
Location: Lahore (hybrid). Duration: 8 weeks. Stipend: PKR 40,000/month.
Deadline: 15 June 2026. Skills required: React, TypeScript, problem solving.
Submit resume and cover letter at https://byteworks.io/internships`,
  },
  {
    id: "sample-3",
    subject: "National AI Challenge 2026 — PKR 500,000 Prize Pool",
    sender: "challenge@aipakistan.pk",
    body: `Calling all innovators!

Register your team for the National AI Challenge 2026.
Cash prize pool: PKR 500,000. Mentorship from industry leaders.
Deadline: 10 June 2026. Open to all majors with interest in machine learning.
Team size: 2–4 members. Required: project idea deck and team profile.
Register at https://aipakistan.pk/challenge`,
  },
  {
    id: "sample-4",
    subject: "Social Impact Tech Fellowship — 12-Month Program",
    sender: "fellowships@impacthub.org",
    body: `Dear Applicant,

ImpactHub is accepting applications for a 12-month fellowship for emerging builders.
International cohort with remote collaboration. Deadline: July 5, 2026.
Benefits: USD 1,200/month stipend, mentorship, global network.
Skills preferred: leadership, communication, research, project management.
Apply at https://impacthub.org/fellowship`,
  },
  {
    id: "sample-5",
    subject: "MS Computer Science Admissions Open — Fall 2026",
    sender: "gradadmissions@techuniversity.edu",
    body: `Applications are now open for MS Computer Science, Fall 2026 intake.
Deadline: 01 July 2026. Minimum GPA: 2.8.
Required documents: transcript, two recommendation letters, statement of purpose, GRE scores.
Scholarships available for meritorious students.
Program details: https://techuniversity.edu/grad/apply`,
  },
  {
    id: "sample-6",
    subject: "IEEE Conference on AI — Call for Papers 2026",
    sender: "cfp@ieeeai2026.org",
    body: `IEEE International Conference on Artificial Intelligence 2026.
Submission deadline: 20 May 2026. Notification: 15 June 2026.
Topics: machine learning, NLP, computer vision, robotics.
Best paper award: USD 500. Travel grants available for students.
Submit at https://ieeeai2026.org/submit`,
  },
  {
    id: "sample-7",
    subject: "Google Summer of Code 2026 — Applications Open",
    sender: "gsoc-noreply@google.com",
    body: `Google Summer of Code 2026 is now accepting student applications.
Program duration: 12 weeks (June–August). Stipend: USD 1,500–3,300.
Open to students enrolled in an accredited university.
Deadline: April 2, 2026. Required: proposal, code sample, CV.
Apply at https://summerofcode.withgoogle.com`,
  },
  {
    id: "sample-8",
    subject: "Congratulations! You have won a prize",
    sender: "noreply@prizenotification.xyz",
    body: `Dear Winner,

You have been selected to receive a prize of USD 10,000.
Click the link below to claim your prize immediately.
This offer expires in 24 hours. No documents required.
Claim now: http://suspicious-link.xyz/claim?ref=abc123

This is not spam. You opted in by visiting our website.`,
  },
];

export function getSampleEmailText(): string {
  return SAMPLE_EMAILS.map(
    (e) => `Subject: ${e.subject}\nFrom: ${e.sender ?? ""}\n${e.body}`,
  ).join("\n---\n");
}
