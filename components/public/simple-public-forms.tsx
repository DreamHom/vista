"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ReportListingForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
        Thank you, our team will review this.
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-4"
    >
      <label className="flex flex-col gap-2 text-sm text-muted-foreground">
        Property reference
        <Input placeholder="Listing ID or full DreamHomes URL" size="lg" required />
      </label>

      <label className="flex flex-col gap-2 text-sm text-muted-foreground">
        Reason
        <select className="h-12 rounded-md border border-input bg-background pl-4 pr-11 text-sm text-foreground outline-none" required>
          <option value="">Choose a reason</option>
          <option value="fraud">Fraudulent listing</option>
          <option value="wrong-info">Wrong information</option>
          <option value="taken">Already rented/sold</option>
          <option value="inappropriate">Inappropriate content</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm text-muted-foreground">
        Description
        <Textarea placeholder="Tell us what looks wrong and include any important context." className="min-h-[140px]" required />
      </label>

      <label className="flex flex-col gap-2 text-sm text-muted-foreground">
        Contact email
        <Input type="email" placeholder="Optional, but helpful if we need clarification" size="lg" />
      </label>

      <Button type="submit" size="lg" className="w-full">
        Submit report
      </Button>
    </form>
  );
}

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
        Thanks for reaching out. We have received your message.
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-muted-foreground">
          Name
          <Input size="lg" required />
        </label>
        <label className="flex flex-col gap-2 text-sm text-muted-foreground">
          Email
          <Input type="email" size="lg" required />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm text-muted-foreground">
        Subject
        <select className="h-12 rounded-md border border-input bg-background pl-4 pr-11 text-sm text-foreground outline-none" required>
          <option value="">Select a subject</option>
          <option value="general">General</option>
          <option value="issue">Report an Issue</option>
          <option value="partnership">Partnership</option>
          <option value="press">Press</option>
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm text-muted-foreground">
        Message
        <Textarea className="min-h-[160px]" required />
      </label>

      <Button type="submit" size="lg" className="w-full">
        Send message
      </Button>
    </form>
  );
}
