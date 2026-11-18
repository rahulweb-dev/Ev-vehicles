"use client";

// "Get best price" call-to-action that opens the quick lead form. Usable from server components.
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import LeadFormModal from "@/components/LeadFormModal";

export default function LeadButton({
  vehicleName, vehicleSlug, vehicleType = "car",
  source = "website", defaultCity = "", defaultState = "", defaultIntent = "price_quote",
  label = "Get Best Price", title = "", className = "",
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className={className || "inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 transition"}>
        <MessageCircle size={14} />{label}
      </button>
      {open && (
        <LeadFormModal vehicleName={vehicleName} vehicleSlug={vehicleSlug} vehicleType={vehicleType}
          source={source} defaultCity={defaultCity} defaultState={defaultState} defaultIntent={defaultIntent}
          title={title} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
