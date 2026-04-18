import type { RawEmail } from "@/lib/types";

/**
 * 8 realistic demo emails — mix of genuine opportunities + spam.
 * Used by the "Load Sample Emails" button on the analyze page.
 */
export const sampleEmails: RawEmail[] = [
  {
    id: "sample-1",
    subject: "HEC Need-Based Scholarship 2026 — Applications Close April 25",
    sender: "scholarships@hec.gov.pk",
    receivedDate: new Date().toISOString(),
    body: `Dear Student,

The Higher Education Commission of Pakistan announces the HEC Need-Based Scholarship 2026.

Eligible students must be enrolled in BS/MS programs, maintain minimum CGPA of 2.5, and demonstrate financial need.

Benefit: PKR 25,000 per month.

Required documents: transcript, income certificate, 2 recommendation letters.

Apply at hec.gov.pk/scholarships by April 25, 2026.

Contact: scholarships@hec.gov.pk`,
  },
  {
    id: "sample-2",
    subject: "Summer Internship 2026 — Systems Limited (Lahore)",
    sender: "careers@systemslimited.com",
    receivedDate: new Date().toISOString(),
    body: `Systems Limited is offering paid summer internships for CS/SE students.

Duration: June–August 2026.
Stipend: PKR 50,000/month.
Required skills: Python, SQL, or React.
Minimum CGPA: 3.0.

Apply by May 10, 2026 at careers.systemslimited.com.

Only BS students in semester 5 or above are eligible.`,
  },
  {
    id: "sample-3",
    subject: "National AI Challenge 2026 — Win PKR 200,000",
    sender: "info@nationalai.pk",
    receivedDate: new Date().toISOString(),
    body: `PITB and P@SHA announce the National AI Challenge 2026.

Open to all university students. Teams of 2–4 members.
Build an AI solution in 48 hours.

Top prize: PKR 200,000.
Registration deadline: May 1, 2026.

Register at nationalai.pk.

No CGPA requirement. All majors welcome.`,
  },
  {
    id: "sample-4",
    subject: "Google Generation Scholarship — APAC Region",
    sender: "scholarships-noreply@google.com",
    receivedDate: new Date().toISOString(),
    body: `Google announces the Generation Scholarship for outstanding CS students in the Asia Pacific region.

Award: USD 1,000 + mentorship from Google engineers.

Eligibility: CS/IT degree, full-time student, demonstrated leadership.

Apply by June 30, 2026 at buildyourfuture.withgoogle.com/scholarships.

Requires 2 essays and 1 recommendation letter.`,
  },
  {
    id: "sample-5",
    subject: "IEEE INMIC 2026 — Call for Papers",
    sender: "cfp@inmic2026.ieee.org.pk",
    receivedDate: new Date().toISOString(),
    body: `IEEE invites submission of research papers for the 24th International Multi-Topic Conference (INMIC 2026).

Held in Islamabad, December 2026.
Topics: AI, Networks, Robotics, Signal Processing.

Submission deadline: August 15, 2026.
Student registration fee: $50.

Submit at inmic2026.ieee.org.pk.`,
  },
  {
    id: "sample-6",
    subject: "You have won a prize! Claim your MacBook Pro now!",
    sender: "noreply@prize-winner.xyz",
    receivedDate: new Date().toISOString(),
    body: `Congratulations!

You have been selected to receive a free MacBook Pro.

Click here to claim your prize within 24 hours.

Limited offer! Act now before it expires!

http://suspicious-prize-link.xyz/claim?ref=abc123`,
  },
  {
    id: "sample-7",
    subject: "50% off on online courses this weekend only",
    sender: "promo@onlinecourses.io",
    receivedDate: new Date().toISOString(),
    body: `Hey there!

Don't miss our weekend sale. Get 50% off on all programming courses.

Use code WEEKEND50 at checkout.

Offer valid till Sunday midnight.

Shop now at onlinecourses.io`,
  },
  {
    id: "sample-8",
    subject: "Free Workshop: Introduction to Cybersecurity — LUMS",
    sender: "events@cs.lums.edu.pk",
    receivedDate: new Date().toISOString(),
    body: `LUMS CS Department invites students for a free 1-day cybersecurity workshop.

Date: May 20, 2026.
Open to all university students.
Registration required. Seats limited to 50.

Register at cs.lums.edu.pk/workshop by May 15, 2026.

No prerequisites required.`,
  },
];

/** Formats the sample emails as paste-ready text separated by --- */
export function getSampleEmailText(): string {
  return sampleEmails
    .map((e) => `Subject: ${e.subject}\nFrom: ${e.sender ?? ""}\n${e.body}`)
    .join("\n---\n");
}
