import { supabase } from "./supabase";

export interface ServiceProduct {
  name: string;
  description: string;
  price?: string;
  notes?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface PromotionItem {
  name: string;
  details: string;
  expiryDate?: string;
  terms?: string;
}

export interface SetupFormValues {
  // Section 1: General Business Information
  businessName: string;
  industry: string;
  businessDescription: string;
  businessAddress?: string;
  websiteUrl?: string;
  businessPhone?: string;
  businessEmail?: string;
  hoursOfOperation?: string;
  areasServed?: string;
  languagesSupported?: string;

  // Section 2: Services, Products & Pricing
  servicesProducts: ServiceProduct[];

  // Section 3: Booking, Orders & Customer Actions
  requiresAppointments: "yes" | "no";
  appointmentInfoToCollect: {
    name: boolean;
    phone: boolean;
    email: boolean;
    preferredDate: boolean;
    preferredTime: boolean;
    address: boolean;
    other: string;
  };
  collectDetailsFollowup: "yes" | "no";
  bookingLink?: string;
  postCollectionAction?: string;

  // Section 4: Frequently Asked Questions
  faqs: FAQItem[];

  // Section 5: Offers, Discounts & Promotions
  hasPromotions: "yes" | "no";
  promotions: PromotionItem[];

  // Section 6: Customer Qualification Questions
  qualificationQuestions: string[];

  // Section 7: Rules & Boundaries
  escalationPhone?: string;
  escalationEmail?: string;
  humanTransferSituations?: string;
  mustNeverSay?: string;
  topicsToAvoid?: string;

  // Section 8: AI Personality & Communication Style
  toneStyles: string[];
  otherToneStyle?: string;
  greetingMessage?: string;
  closingMessage?: string;
  communicationInstructions?: string;

  // Section 9: Additional Business Information & Final Notes
  additionalInfo?: string;
  finalNotes?: string;
}

/**
 * Compiles all 9 sections into a comprehensive system instruction prompt
 */
export function compileSystemPrompt(values: SetupFormValues): string {
  const sections: string[] = [];

  // Core Persona & General Biz Info
  sections.push(`# ROLE & IDENTITY
You are an advanced AI Voice Agent for "${values.businessName}" (${values.industry || "Business"}).
Your primary objective is to represent the business, engage customers, answer inquiries, and guide them toward the desired business action.

## BUSINESS DETAILS
- **Description:** ${values.businessDescription}
${values.businessAddress ? `- **Address:** ${values.businessAddress}` : ""}
${values.websiteUrl ? `- **Website:** ${values.websiteUrl}` : ""}
${values.businessPhone ? `- **Business Phone:** ${values.businessPhone}` : ""}
${values.businessEmail ? `- **Business Email:** ${values.businessEmail}` : ""}
${values.hoursOfOperation ? `- **Hours of Operation:** ${values.hoursOfOperation}` : ""}
${values.areasServed ? `- **Areas Served:** ${values.areasServed}` : ""}
${values.languagesSupported ? `- **Languages Supported:** ${values.languagesSupported}` : ""}`);

  // Tone & Personality
  const activeTones = [...values.toneStyles];
  if (values.otherToneStyle?.trim()) {
    activeTones.push(values.otherToneStyle.trim());
  }
  const toneDesc = activeTones.length > 0 ? activeTones.join(", ") : "Professional";

  sections.push(`## COMMUNICATION STYLE & PERSONALITY
- **Assigned Tone:** ${toneDesc}
- **Guidelines:** Maintain this style throughout the call. Be conversational, concise (crucial for voice latency and user engagement), and natural.
${values.greetingMessage ? `- **Greeting (First Sentence of Call):** You should greet the caller with: "${values.greetingMessage}"` : ""}
${values.closingMessage ? `- **Closing (When ending the call):** Wrap up the call with: "${values.closingMessage}"` : ""}
${values.communicationInstructions ? `- **Style Instructions:** ${values.communicationInstructions}` : ""}`);

  // Services & Products
  if (values.servicesProducts && values.servicesProducts.length > 0) {
    const servicesText = values.servicesProducts
      .filter((s) => s.name?.trim())
      .map(
        (s) =>
          `### ${s.name}
- **Description:** ${s.description}
${s.price ? `- **Price:** ${s.price}` : ""}
${s.notes ? `- **Special Notes:** ${s.notes}` : ""}`
      )
      .join("\n\n");

    if (servicesText) {
      sections.push(`# SERVICES, PRODUCTS & PRICING
Here are the core offerings of the business. Use these to explain options and answer questions:

${servicesText}`);
    }
  }

  // Booking, Orders & Customer Actions
  const infoCollect: string[] = [];
  if (values.appointmentInfoToCollect.name) infoCollect.push("Name");
  if (values.appointmentInfoToCollect.phone) infoCollect.push("Phone Number");
  if (values.appointmentInfoToCollect.email) infoCollect.push("Email Address");
  if (values.appointmentInfoToCollect.preferredDate) infoCollect.push("Preferred Appointment Date");
  if (values.appointmentInfoToCollect.preferredTime) infoCollect.push("Preferred Appointment Time");
  if (values.appointmentInfoToCollect.address) infoCollect.push("Physical Address");
  if (values.appointmentInfoToCollect.other?.trim()) infoCollect.push(values.appointmentInfoToCollect.other.trim());

  sections.push(`# ACTIONS, ORDERS & BOOKING
- **Requires Appointments:** ${values.requiresAppointments === "yes" ? "Yes" : "No"}
${
  values.requiresAppointments === "yes" && infoCollect.length > 0
    ? `- **Customer Information to Capture:** You MUST request and record the following information: ${infoCollect.join(", ")}`
    : ""
}
- **Collect Details for Follow-up:** ${values.collectDetailsFollowup === "yes" ? "Yes" : "No"}
${values.bookingLink ? `- **Online Booking Link:** Share this link if requested: ${values.bookingLink}` : ""}
${values.postCollectionAction ? `- **Post-Collection Instruction:** After capturing customer details, follow these instructions: ${values.postCollectionAction}` : ""}`);

  // FAQs
  if (values.faqs && values.faqs.length > 0) {
    const faqText = values.faqs
      .filter((f) => f.question?.trim())
      .map((f) => `**Q: ${f.question}**\n**A:** ${f.answer}`)
      .join("\n\n");

    if (faqText) {
      sections.push(`# FREQUENTLY ASKED QUESTIONS (FAQs)
Refer to these answers when customers query these topics:

${faqText}`);
    }
  }

  // Offers & Promotions
  if (values.hasPromotions === "yes" && values.promotions && values.promotions.length > 0) {
    const promoText = values.promotions
      .filter((p) => p.name?.trim())
      .map(
        (p) =>
          `### ${p.name}
- **Details:** ${p.details}
${p.expiryDate ? `- **Expires:** ${p.expiryDate}` : ""}
${p.terms ? `- **Terms & Conditions:** ${p.terms}` : ""}`
      )
      .join("\n\n");

    if (promoText) {
      sections.push(`# SPECIAL OFFERS & PROMOTIONS
Inform qualified customers of these current deals:

${promoText}`);
    }
  }

  // Qualification Questions
  const activeQuestions = (values.qualificationQuestions || []).filter((q) => q?.trim());
  if (activeQuestions.length > 0) {
    sections.push(`# CUSTOMER QUALIFICATION QUESTIONS
To evaluate lead fit, ask these questions as the conversation allows:
${activeQuestions.map((q, i) => `${i + 1}. ${q.trim()}`).join("\n")}`);
  }

  // Rules & Boundaries
  sections.push(`# RULES & BOUNDARIES
- **Escalation Contacts:** Phone: ${values.escalationPhone || "N/A"}, Email: ${values.escalationEmail || "N/A"}
${values.humanTransferSituations ? `- **Transfer to Human Agent if:** ${values.humanTransferSituations}` : ""}
${values.mustNeverSay ? `- **NEVER SAY THESE WORDS/PHRASES:** ${values.mustNeverSay}` : ""}
${values.topicsToAvoid ? `- **TOPICS TO AVOID DISCUSSING:** ${values.topicsToAvoid}` : ""}`);

  // Additional Information
  if (values.additionalInfo?.trim() || values.finalNotes?.trim()) {
    sections.push(`# ADDITIONAL CONTEXT
${values.additionalInfo ? `- **General Context:** ${values.additionalInfo}` : ""}
${values.finalNotes ? `- **Important Notes:** ${values.finalNotes}` : ""}`);
  }

  return sections.join("\n\n");
}

/**
 * Saves setup form data to agent kb_metadata and compiled system prompt
 */
export async function saveAgentSetup(agentId: string, formValues: SetupFormValues): Promise<any> {
  if (!supabase) {
    throw new Error("Supabase is not initialized.");
  }

  // 1. Get user session for backend token authorization
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("No active session found. Please log in.");
  }

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    'ngrok-skip-browser-warning': 'true',
  };

  // 2. Fetch workspace_id to resolve paths
  const setupRes = await fetch(`${apiUrl}/api/v1/workspaces/setup`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ user_id: session.user.id, email: session.user.email }),
  });
  if (!setupRes.ok) throw new Error("Workspace setup lookup failed");
  const { workspace_id } = await setupRes.json();

  // 3. Fetch current agent details from backend to merge existing metadata
  const getRes = await fetch(`${apiUrl}/api/v1/workspaces/${workspace_id}/agents/${agentId}`, { headers: { 'Authorization': headers.Authorization } });
  if (!getRes.ok) throw new Error("Failed to load existing agent config from server");
  const currentAgent = await getRes.json();

  const existingKb = currentAgent?.kb_metadata || {};

  // 4. Map form camelCase fields to snake_case inside kb_metadata (filtering empty rows)
  const cleanServicesProducts = (formValues.servicesProducts || []).filter(
    (s) => s.name?.trim() && s.description?.trim()
  );
  const cleanFaqs = (formValues.faqs || []).filter(
    (f) => f.question?.trim() && f.answer?.trim()
  );
  const cleanPromotions = (formValues.promotions || []).filter(
    (p) => p.name?.trim() && p.details?.trim()
  );
  const cleanQualificationQuestions = (formValues.qualificationQuestions || []).filter(
    (q) => q?.trim()
  );

  // Re-map with clean fields
  const cleanFormValues = {
    ...formValues,
    servicesProducts: cleanServicesProducts,
    faqs: cleanFaqs,
    promotions: cleanPromotions,
    qualificationQuestions: cleanQualificationQuestions,
  };

  const newKbMetadata = {
    ...existingKb,
    business_name: formValues.businessName,
    industry: formValues.industry,
    business_description: formValues.businessDescription,
    business_address: formValues.businessAddress || "",
    website_url: formValues.websiteUrl || "",
    business_phone: formValues.businessPhone || "",
    business_email: formValues.businessEmail || "",
    hours_of_operation: formValues.hoursOfOperation || "",
    areas_served: formValues.areasServed || "",
    languages_supported: formValues.languagesSupported || "",
    services_products: cleanServicesProducts,
    requires_appointments: formValues.requiresAppointments,
    appointment_info_to_collect: formValues.appointmentInfoToCollect,
    collect_details_followup: formValues.collectDetailsFollowup,
    booking_link: formValues.bookingLink || "",
    post_collection_action: formValues.postCollectionAction || "",
    faqs: cleanFaqs,
    has_promotions: formValues.hasPromotions,
    promotions: cleanPromotions,
    qualification_questions: cleanQualificationQuestions,
    escalation_phone: formValues.escalationPhone || "",
    escalation_email: formValues.escalationEmail || "",
    human_transfer_situations: formValues.humanTransferSituations || "",
    must_never_say: formValues.mustNeverSay || "",
    topics_to_avoid: formValues.topicsToAvoid || "",
    tone_styles: formValues.toneStyles || [],
    other_tone_style: formValues.otherToneStyle || "",
    greeting_message: formValues.greetingMessage || "",
    closing_message: formValues.closingMessage || "",
    communication_instructions: formValues.communicationInstructions || "",
    additional_info: formValues.additionalInfo || "",
    final_notes: formValues.finalNotes || "",
    // Retain keys the existing system might use
    top_services: cleanServicesProducts.map(s => s.name).join(", "),
    pricing_range: cleanServicesProducts.map(s => `${s.name}: ${s.price || "Contact"}`).join(" | "),
    faq_barrier: cleanFaqs?.[0]?.question || "",
    call_goal: formValues.postCollectionAction || formValues.bookingLink || "Answer customer queries",
    collect_info: Object.entries(formValues.appointmentInfoToCollect || {})
      .filter(([k, v]) => v === true)
      .map(([k]) => k)
      .join(", "),
  };

  // 5. Compile the system prompt using clean data
  const compiledPrompt = compileSystemPrompt(cleanFormValues);

  // 6. Update the agent record via Backend PATCH proxy
  const patchRes = await fetch(`${apiUrl}/api/v1/workspaces/${workspace_id}/agents/${agentId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      kb_metadata: newKbMetadata,
      system_prompt: compiledPrompt,
      website_url: formValues.websiteUrl || null,
    }),
  });

  if (!patchRes.ok) {
    const errorBody = await patchRes.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Failed to update agent database: HTTP ${patchRes.status}`);
  }

  return patchRes.json();
}
