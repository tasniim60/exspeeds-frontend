import { create } from "zustand";
import { shipmentRequestService } from "@/services";
import { ShipmentRequest } from "@/lib/adminData";

export const STORAGE_KEY_DRAFT = "xspeed_shipment_wizard_draft_v3";
export const STORAGE_KEY_STEP = "xspeed_shipment_wizard_step_v3";
export const STORAGE_KEY_SERVICE = "xspeed_shipment_wizard_service_v3";
export const STORAGE_KEY_SUBMITTED = "xspeed_shipment_wizard_submitted_v3";

export interface WizardFormData {
  customerName: string;
  companyName: string;
  phone: string;
  whatsapp: string;
  email: string;

  pickupCountry: string;
  pickupCity: string;
  pickupAddress: string;
  pickupContactName: string;
  pickupContactPhone: string;
  preferredPickupDate: string;
  pickupNotes: string;

  deliveryCountry: string;
  deliveryCity: string;
  deliveryShortAddress: string;
  deliveryAddress: string;
  consigneeName: string;
  consigneePhone: string;
  deliveryNotes: string;

  shipmentType: "Documents" | "Parcel" | "Commercial Goods" | "Other";
  customShipmentType: string;
  contents: string;
  packageCount: number | string;
  weight: number | string;
  length: number | string;
  width: number | string;
  height: number | string;
  declaredValue: number | string;
  currency: string;
  isFragile: boolean;
  isTemperatureControlled: boolean;
  specialInstructions: string;
}

export const initialWizardFormData: WizardFormData = {
  customerName: "",
  companyName: "",
  phone: "",
  whatsapp: "",
  email: "",

  pickupCountry: "Egypt",
  pickupCity: "Cairo",
  pickupAddress: "",
  pickupContactName: "",
  pickupContactPhone: "",
  preferredPickupDate: new Date().toISOString().split("T")[0],
  pickupNotes: "",

  deliveryCountry: "United Arab Emirates",
  deliveryCity: "",
  deliveryShortAddress: "",
  deliveryAddress: "",
  consigneeName: "",
  consigneePhone: "",
  deliveryNotes: "",

  shipmentType: "Commercial Goods",
  customShipmentType: "",
  contents: "",
  packageCount: 1,
  weight: 5.0,
  length: "",
  width: "",
  height: "",
  declaredValue: 500,
  currency: "USD",
  isFragile: false,
  isTemperatureControlled: false,
  specialInstructions: "",
};

interface ShipmentWizardState {
  step: number;
  selectedService: string;
  isSubmitting: boolean;
  submittedData: any | null;
  generalError: string | null;
  fieldErrors: Record<string, string>;
  confirmedCorrect: boolean;
  copiedReqNumber: boolean;
  formData: WizardFormData;
  isHydrated: boolean;

  // Actions
  setStep: (step: number) => void;
  setSelectedService: (serviceId: string) => void;
  updateFormData: (field: keyof WizardFormData | Partial<WizardFormData>, value?: any) => void;
  setFieldErrors: (errors: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  clearFieldError: (field: string) => void;
  setGeneralError: (err: string | null) => void;
  setConfirmedCorrect: (confirmed: boolean) => void;
  setCopiedReqNumber: (copied: boolean) => void;
  setSubmittedData: (data: any | null) => void;
  setIsSubmitting: (submitting: boolean) => void;
  initFromStorageAndUser: (user?: { name?: string; email?: string; company?: string; phone?: string } | null) => void;
  resetDraft: () => void;

  // Calculators
  calculateVolumetricWeight: () => number;
  calculateChargeableWeight: () => number;

  // Domain Submission
  submitBooking: (options: {
    locale: string;
    isRTL: boolean;
    serviceTitle?: string;
  }) => Promise<{ success: boolean; data?: any; error?: string }>;
}

export const useShipmentWizardStore = create<ShipmentWizardState>((set, get) => ({
  step: 1,
  selectedService: "express-parcel",
  isSubmitting: false,
  submittedData: null,
  generalError: null,
  fieldErrors: {},
  confirmedCorrect: false,
  copiedReqNumber: false,
  formData: initialWizardFormData,
  isHydrated: false,

  setStep: (newStep: number) => {
    set({ step: newStep });
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(STORAGE_KEY_STEP, String(newStep));
        const url = new URL(window.location.href);
        url.searchParams.set("step", String(newStep));
        window.history.replaceState(null, "", url.toString());
        const wizardEl = document.getElementById("shipment-wizard-root");
        if (wizardEl) {
          wizardEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    } catch {}
  },

  setSelectedService: (serviceId: string) => {
    set((state) => {
      const nextErrors = { ...state.fieldErrors };
      delete nextErrors.selectedService;
      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(STORAGE_KEY_SERVICE, serviceId);
        }
      } catch {}
      return { selectedService: serviceId, fieldErrors: nextErrors };
    });
  },

  updateFormData: (fieldOrPartial, value) => {
    set((state) => {
      const updated =
        typeof fieldOrPartial === "string"
          ? { ...state.formData, [fieldOrPartial]: value }
          : { ...state.formData, ...fieldOrPartial };

      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(updated));
        }
      } catch {}

      const nextErrors = { ...state.fieldErrors };
      if (typeof fieldOrPartial === "string" && nextErrors[fieldOrPartial]) {
        delete nextErrors[fieldOrPartial];
      }

      return { formData: updated, fieldErrors: nextErrors };
    });
  },

  setFieldErrors: (arg) => {
    set((state) => ({
      fieldErrors: typeof arg === "function" ? arg(state.fieldErrors) : arg,
    }));
  },

  clearFieldError: (field: string) => {
    set((state) => {
      const updated = { ...state.fieldErrors };
      delete updated[field];
      return { fieldErrors: updated };
    });
  },

  setGeneralError: (err: string | null) => set({ generalError: err }),

  setConfirmedCorrect: (confirmed: boolean) => set({ confirmedCorrect: confirmed }),

  setCopiedReqNumber: (copied: boolean) => set({ copiedReqNumber: copied }),

  setSubmittedData: (data: any | null) => {
    set({ submittedData: data });
    try {
      if (typeof window !== "undefined") {
        if (data) {
          sessionStorage.setItem(STORAGE_KEY_SUBMITTED, JSON.stringify(data));
        } else {
          sessionStorage.removeItem(STORAGE_KEY_SUBMITTED);
        }
      }
    } catch {}
  },

  setIsSubmitting: (submitting: boolean) => set({ isSubmitting: submitting }),

  initFromStorageAndUser: (user) => {
    try {
      if (typeof window === "undefined") return;

      const savedService = sessionStorage.getItem(STORAGE_KEY_SERVICE);
      const savedSubmitted = sessionStorage.getItem(STORAGE_KEY_SUBMITTED);
      const savedDraft = sessionStorage.getItem(STORAGE_KEY_DRAFT);
      const savedStep = sessionStorage.getItem(STORAGE_KEY_STEP);
      const urlStep = new URLSearchParams(window.location.search).get("step");

      let nextFormData = { ...initialWizardFormData };

      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        nextFormData = {
          ...nextFormData,
          ...parsed,
          customerName: parsed.customerName || user?.name || nextFormData.customerName,
          email: parsed.email || user?.email || nextFormData.email,
          companyName: parsed.companyName || user?.company || nextFormData.companyName,
          phone: parsed.phone || user?.phone || nextFormData.phone,
          whatsapp: parsed.whatsapp || user?.phone || nextFormData.whatsapp,
          pickupContactName: parsed.pickupContactName || user?.name || nextFormData.pickupContactName,
          pickupContactPhone: parsed.pickupContactPhone || user?.phone || nextFormData.pickupContactPhone,
        };
      } else if (user) {
        nextFormData = {
          ...nextFormData,
          customerName: user.name || "",
          email: user.email || "",
          companyName: user.company || "",
          phone: user.phone || "",
          whatsapp: user.phone || "",
          pickupContactName: user.name || "",
          pickupContactPhone: user.phone || "",
        };
      }

      const parsedStep = urlStep ? parseInt(urlStep, 10) : savedStep ? parseInt(savedStep, 10) : 1;
      const targetStep = parsedStep >= 1 && parsedStep <= 5 ? parsedStep : 1;

      set({
        formData: nextFormData,
        selectedService: savedService || "express-parcel",
        submittedData: savedSubmitted ? JSON.parse(savedSubmitted) : null,
        step: targetStep,
        isHydrated: true,
      });
    } catch (e) {
      console.error("[useShipmentWizardStore] Init failed:", e);
      set({ isHydrated: true });
    }
  },

  resetDraft: () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(STORAGE_KEY_DRAFT);
        sessionStorage.removeItem(STORAGE_KEY_STEP);
        sessionStorage.removeItem(STORAGE_KEY_SERVICE);
        sessionStorage.removeItem(STORAGE_KEY_SUBMITTED);
      }
    } catch {}
    set({
      formData: initialWizardFormData,
      step: 1,
      submittedData: null,
      fieldErrors: {},
      generalError: null,
      confirmedCorrect: false,
    });
  },

  calculateVolumetricWeight: () => {
    const { length, width, height } = get().formData;
    const l = parseFloat(String(length)) || 0;
    const w = parseFloat(String(width)) || 0;
    const h = parseFloat(String(height)) || 0;
    if (!l || !w || !h) return 0;
    return Math.round(((l * w * h) / 5000) * 10) / 10;
  },

  calculateChargeableWeight: () => {
    const { weight } = get().formData;
    const actual = parseFloat(String(weight)) || 0;
    const volumetric = get().calculateVolumetricWeight();
    return Math.max(actual, volumetric);
  },

  submitBooking: async ({ locale, isRTL, serviceTitle }) => {
    const state = get();
    state.setIsSubmitting(true);
    state.setGeneralError(null);

    const generatedReqNumber = `REQ-${Math.floor(10000 + Math.random() * 90000)}`;
    const f = state.formData;

    const newRequest: ShipmentRequest = {
      id: `req-${Date.now()}`,
      requestNumber: generatedReqNumber,
      customerName: f.customerName,
      companyName: f.companyName,
      phone: f.phone,
      whatsapp: f.whatsapp,
      email: f.email,
      country: f.pickupCountry,
      city: f.pickupCity,
      address: f.pickupAddress,

      pickupCountry: f.pickupCountry,
      pickupCity: f.pickupCity,
      pickupAddress: f.pickupAddress,
      pickupContactName: f.pickupContactName,
      pickupContactPhone: f.pickupContactPhone,
      preferredPickupDate: f.preferredPickupDate,
      pickupNotes: f.pickupNotes,

      deliveryCountry: f.deliveryCountry,
      deliveryCity: f.deliveryCity,
      deliveryShortAddress: f.deliveryShortAddress,
      deliveryAddress: f.deliveryAddress,
      consigneeName: f.consigneeName,
      consigneePhone: f.consigneePhone,
      deliveryNotes: f.deliveryNotes,

      serviceId: state.selectedService,
      serviceTitle: serviceTitle || "Express Courier & Parcel Booking",

      shipmentType: f.shipmentType,
      contents: f.shipmentType === "Other" && f.customShipmentType ? f.customShipmentType : f.contents,
      packageCount: parseInt(String(f.packageCount), 10) || 1,
      weight: parseFloat(String(f.weight)) || 1.0,
      length: parseFloat(String(f.length)) || undefined,
      width: parseFloat(String(f.width)) || undefined,
      height: parseFloat(String(f.height)) || undefined,
      declaredValue: parseFloat(String(f.declaredValue)) || undefined,
      currency: f.currency,
      isFragile: f.isFragile,
      isTemperatureControlled: f.isTemperatureControlled,
      specialInstructions: f.specialInstructions,

      status: "New",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const saved = await shipmentRequestService.createRequest(newRequest);
      state.setSubmittedData(saved);
      state.setIsSubmitting(false);
      state.setStep(5);
      return { success: true, data: saved };
    } catch (err: any) {
      console.error("[useShipmentWizardStore] Submission error:", err);
      const msg = isRTL ? "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة ثانية." : "Failed to submit request. Please try again.";
      state.setGeneralError(msg);
      state.setIsSubmitting(false);
      return { success: false, error: msg };
    }
  },
}));
