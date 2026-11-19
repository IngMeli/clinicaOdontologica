export type UserRef = {
    id: number;
    name: string;
    email?: string;
};

export type SpecialtyRef = {
    id: number;
    name: string;
    color?: string | null;
};

export type DoctorRef = {
    id: number;
    license_number: string;
    color?: string | null;
    active: boolean;
    user?: UserRef | null;
    specialty?: SpecialtyRef | null;
};

export type PatientRef = {
    id: number;
    code: string;
    first_name: string;
    last_name: string;
    ci?: string | null;
    phone?: string | null;
    email?: string | null;
};

export type Patient = PatientRef & {
    user_id?: number | null;
    birth_date?: string | null;
    gender?: string | null;
    address?: string | null;
    blood_type?: string | null;
    allergies?: string | null;
    medical_notes?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    active: boolean;
    appointments_count?: number;
    last_appointment_at?: string | null;
    created_at: string;
    updated_at?: string | null;
    appointments?: ClinicAppointment[];
    consultations?: Consultation[];
    treatment_plans?: TreatmentPlan[];
    prescriptions?: Prescription[];
    payments?: Payment[];
    payment_plans?: PaymentPlan[];
};

export type ClinicAppointment = {
    id: number;
    patient_id: number;
    doctor_id: number;
    scheduled_at: string;
    duration_minutes: number;
    status: string;
    reason?: string | null;
    notes?: string | null;
    patient?: PatientRef | null;
    doctor?: DoctorRef | null;
    consultation?: Consultation | null;
    created_at?: string;
};

export type Consultation = {
    id: number;
    code?: string | null;
    patient_id: number;
    doctor_id: number;
    appointment_id?: number | null;
    consulted_at: string;
    reason: string;
    diagnosis?: string | null;
    observations?: string | null;
    status: string;
    patient?: PatientRef | null;
    doctor?: DoctorRef | null;
    appointment?: ClinicAppointment | null;
    treatment_plans_count?: number;
    prescriptions_count?: number;
    odontogram_entries_count?: number;
};

export type OdontogramEntry = {
    id: number;
    patient_id: number;
    consultation_id?: number | null;
    tooth: number;
    surface?: string | null;
    condition: string;
    notes?: string | null;
    recorded_at: string;
    recorder?: UserRef | null;
};

export type Treatment = {
    id: number;
    code: string;
    name: string;
    category?: string | null;
    description?: string | null;
    price: string | number;
    duration_minutes: number;
    active: boolean;
    plan_items_count?: number;
};

export type TreatmentPlanItem = {
    id: number;
    treatment_plan_id: number;
    treatment_id?: number | null;
    tooth?: number | null;
    quantity: number;
    unit_price: string | number;
    subtotal: string | number;
    status: string;
    sessions_planned: number;
    sessions_done: number;
    notes?: string | null;
    treatment?: Treatment | null;
};

export type TreatmentPlan = {
    id: number;
    code?: string | null;
    patient_id: number;
    doctor_id: number;
    consultation_id?: number | null;
    status: string;
    start_date?: string | null;
    end_date?: string | null;
    total: string | number;
    notes?: string | null;
    items_count?: number;
    patient?: PatientRef | null;
    doctor?: DoctorRef | null;
    consultation?: Consultation | null;
    creator?: UserRef | null;
    items?: TreatmentPlanItem[];
    created_at?: string;
    updated_at?: string | null;
};

export type PrescriptionItem = {
    id: number;
    prescription_id: number;
    medication: string;
    presentation?: string | null;
    dose?: string | null;
    frequency?: string | null;
    duration?: string | null;
    quantity: number;
    instructions?: string | null;
};

export type Prescription = {
    id: number;
    code?: string | null;
    patient_id: number;
    doctor_id: number;
    consultation_id?: number | null;
    issued_at: string;
    notes?: string | null;
    items_count?: number;
    patient?: PatientRef | null;
    doctor?: DoctorRef | null;
    consultation?: Consultation | null;
    items?: PrescriptionItem[];
};

export type OdontogramConditionOption = {
    value: string;
    label: string;
};

export type ConsultationFormData = {
    consulted_at: string;
    reason: string;
    diagnosis: string;
    observations: string;
};

export type TreatmentFormData = {
    name: string;
    category: string;
    description: string;
    price: string;
    duration_minutes: string;
};

export type TreatmentPlanFormData = {
    patient_id: string;
    doctor_id: string;
    consultation_id: string;
    start_date: string;
    end_date: string;
    notes: string;
};

export type TreatmentPlanItemFormData = {
    treatment_id: string;
    tooth: string;
    quantity: string;
    unit_price: string;
    sessions_planned: string;
    notes: string;
};

export type PrescriptionItemFormData = {
    medication: string;
    presentation: string;
    dose: string;
    frequency: string;
    duration: string;
    quantity: string;
    instructions: string;
};

export type PrescriptionFormData = {
    patient_id: string;
    doctor_id: string;
    consultation_id: string;
    issued_at: string;
    notes: string;
    items: PrescriptionItemFormData[];
};

export type OdontogramFormData = {
    tooth: string;
    surface: string;
    condition: string;
    notes: string;
};

export type PaymentMethodRef = {
    id: number;
    name: string;
    type: string;
};

export type ReceiptRef = {
    id: number;
    number: string;
    amount: string | number;
    issued_at?: string | null;
};

export type Payment = {
    id: number;
    patient_id?: number | null;
    payment_method_id?: number | null;
    payable_type?: string | null;
    payable_id?: number | null;
    amount: string | number;
    currency: string;
    status: string;
    type: string;
    reference?: string | null;
    gateway?: string | null;
    gateway_reference?: string | null;
    qr_payload?: string | null;
    paid_at?: string | null;
    created_at?: string;
    patient?: PatientRef | null;
    method?: PaymentMethodRef | null;
    receipt?: ReceiptRef | null;
    creator?: UserRef | null;
    gateway_transactions?: Array<{
        id: number;
        gateway: string;
        transaction_id: string;
        status: string;
        amount: string | number;
        created_at: string;
    }>;
};

export type PatientFormData = {
    first_name: string;
    last_name: string;
    ci: string;
    birth_date: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
    blood_type: string;
    allergies: string;
    medical_notes: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
};

export type AppointmentFormData = {
    patient_id: string;
    doctor_id: string;
    scheduled_at: string;
    duration_minutes: string;
    reason: string;
    notes: string;
};

export type ProductCategoryRef = {
    id: number;
    name: string;
    description?: string | null;
    products_count?: number;
};

export type SupplierRef = {
    id: number;
    name: string;
    tax_id?: string | null;
    contact_name?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    active?: boolean;
    purchases_count?: number;
};

export type BatchRef = {
    id: number;
    product_id: number;
    lot_number: string;
    expiry_date?: string | null;
    quantity: number;
    unit_cost: string | number;
    supplier?: SupplierRef | null;
};

export type Product = {
    id: number;
    category_id?: number | null;
    sku: string;
    name: string;
    description?: string | null;
    unit: string;
    min_stock: number;
    stock: number;
    sale_price: string | number;
    active: boolean;
    category?: ProductCategoryRef | null;
    batches?: BatchRef[];
    created_at?: string;
};

export type StockMovement = {
    id: number;
    product_id: number;
    batch_id?: number | null;
    type: string;
    quantity: number;
    unit_cost?: string | number | null;
    reference_type?: string | null;
    reference_id?: number | null;
    reason?: string | null;
    created_at: string;
    product?: Product | null;
    batch?: BatchRef | null;
    creator?: UserRef | null;
};

export type Receipt = {
    id: number;
    number: string;
    payment_id?: number | null;
    pharmacy_sale_id?: number | null;
    document_type: string;
    customer_name: string;
    customer_tax_id?: string | null;
    amount: string | number;
    issued_at: string;
    status: string;
};

export type PharmacySaleItem = {
    id: number;
    pharmacy_sale_id: number;
    product_id: number;
    batch_id?: number | null;
    quantity: number;
    unit_price: string | number;
    subtotal: string | number;
    product?: Product | null;
    batch?: BatchRef | null;
};

export type PharmacySale = {
    id: number;
    sale_number: string;
    patient_id?: number | null;
    user_id?: number | null;
    subtotal: string | number;
    discount: string | number;
    total: string | number;
    status: string;
    sold_at: string;
    notes?: string | null;
    items_count?: number;
    patient?: PatientRef | null;
    seller?: UserRef | null;
    items?: PharmacySaleItem[];
    receipts?: Receipt[];
    payments?: Payment[];
};

export type PaymentPlanInstallment = {
    id: number;
    payment_plan_id: number;
    number: number;
    due_date: string;
    amount: string | number;
    paid_amount: string | number;
    status: string;
    paid_at?: string | null;
    payments?: Payment[];
};

export type PaymentPlan = {
    id: number;
    user_id?: number | null;
    patient_id?: number | null;
    treatment_plan_id?: number | null;
    concept: string;
    total: string | number;
    installments_count: number;
    frequency: string;
    start_date: string;
    status: string;
    paid_amount: string | number;
    notes?: string | null;
    installments?: PaymentPlanInstallment[];
    pending_installments_count?: number;
    patient?: PatientRef | null;
    treatment_plan?: TreatmentPlan | null;
    creator?: UserRef | null;
    created_at?: string;
};

export type DoctorSchedule = {
    id: number;
    doctor_id: number;
    weekday: number;
    start_time: string;
    end_time: string;
    slot_minutes: number;
    room?: string | null;
    active: boolean;
    doctor?: DoctorRef | null;
};

export type AdminUser = {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    active: boolean;
    email_verified_at?: string | null;
    last_login_at?: string | null;
    roles: Array<{ id: number; name: string }>;
    doctor?: DoctorRef | null;
    patient?: PatientRef | null;
    created_at?: string;
};

export type AdminMenuItem = {
    id: number;
    parent_id?: number | null;
    label: string;
    icon?: string | null;
    route_name?: string | null;
    url?: string | null;
    permission_name?: string | null;
    sort_order: number;
    active: boolean;
    depth: number;
    parent?: { id: number; label: string } | null;
};

export type Option = {
    value: string | number;
    label: string;
};

export type PharmacySaleItemFormData = {
    product_id: string;
    quantity: string;
    unit_price: string;
};

export type PharmacySaleFormData = {
    patient_id: string;
    prescription_id: string;
    discount: string;
    notes: string;
    items: PharmacySaleItemFormData[];
};

export type PaymentFormData = {
    patient_id: string;
    type: string;
    amount: string;
    status: string;
    paid_at: string;
    reference: string;
};

export type PaymentPlanFormData = {
    patient_id: string;
    treatment_plan_id: string;
    concept: string;
    total: string;
    installments_count: string;
    frequency: string;
    start_date: string;
    notes: string;
};

export type AdminRole = {
    id: number;
    name: string;
    users_count?: number;
    permissions: Array<{ id: number; name: string }>;
};

export type AdminSpecialty = SpecialtyRef & {
    description?: string | null;
    active: boolean;
    doctors_count?: number;
};

export type AdminDoctor = {
    id: number;
    user_id: number;
    specialty_id?: number | null;
    license_number?: string | null;
    active: boolean;
    user?: UserRef | null;
    specialty?: SpecialtyRef | null;
};

export type AdminUserFormData = {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    roles: string[];
    specialty_id: string;
    license_number: string;
    active: boolean;
};
