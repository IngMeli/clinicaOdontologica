export type PortalPatient = {
    id: number;
    code: string;
    first_name: string;
    last_name: string;
    ci: string | null;
    birth_date: string | null;
    gender: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    blood_type: string | null;
    allergies: string | null;
    medical_notes: string | null;
    active: boolean;
};

export type PortalDoctor = {
    id: number;
    user?: { name: string } | null;
    specialty?: { name: string } | null;
};

export type PortalAppointment = {
    id: number;
    scheduled_at: string;
    duration_minutes: number;
    reason: string | null;
    status: string;
    notes: string | null;
    doctor?: PortalDoctor | null;
};

export type PortalTreatmentItem = {
    id: number;
    tooth: number | null;
    quantity: number;
    unit_price: string;
    subtotal: string;
    status: string;
    sessions_planned: number;
    sessions_done: number;
    notes: string | null;
    treatment?: { name: string } | null;
};

export type PortalTreatmentPlan = {
    id: number;
    code: string | null;
    status: string;
    start_date: string | null;
    end_date: string | null;
    total: string;
    notes: string | null;
    doctor?: PortalDoctor | null;
    items: PortalTreatmentItem[];
};

export type PortalInstallment = {
    id: number;
    number: number;
    due_date: string;
    amount: string;
    paid_amount: string;
    status: string;
    paid_at: string | null;
    plan?: { id: number; concept: string } | null;
};

export type PortalPaymentPlan = {
    id: number;
    concept: string;
    total: string;
    installments_count: number;
    frequency: string;
    start_date: string;
    status: string;
    paid_amount: string;
    installments: PortalInstallment[];
};

export type PortalPayment = {
    id: number;
    reference: string | null;
    amount: string;
    currency: string;
    status: string;
    type: string;
    paid_at: string | null;
    method?: { name: string; type: string; last4: string | null } | null;
    receipt?: { number: string; issued_at: string } | null;
};

export type PortalPrescriptionItem = {
    id: number;
    medication: string;
    presentation: string | null;
    dose: string | null;
    frequency: string | null;
    duration: string | null;
    quantity: number;
    instructions: string | null;
};

export type PortalPrescription = {
    id: number;
    code: string | null;
    issued_at: string;
    notes: string | null;
    doctor?: PortalDoctor | null;
    items: PortalPrescriptionItem[];
};

export type PortalOdontogramEntry = {
    id: number;
    tooth: number;
    surface: string | null;
    condition: string;
    notes: string | null;
};

export type PortalConsultation = {
    id: number;
    code: string | null;
    consulted_at: string;
    reason: string;
    diagnosis: string | null;
    observations: string | null;
    status: string;
    doctor?: PortalDoctor | null;
    odontogram_entries: PortalOdontogramEntry[];
};
