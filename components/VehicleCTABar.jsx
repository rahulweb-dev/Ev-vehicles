"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Bell, BarChart2, Calculator } from "lucide-react";
import LeadFormModal from "@/components/LeadFormModal";
import PriceAlertButton from "@/components/PriceAlertButton";

export default function VehicleCTABar({ vehicleName, vehicleSlug, vehicleType = "car" }) {
  const [showLead, setShowLead] = useState(false);

  return (
    <>
      <div className="sticky top-[65px] z-30 border-b border-gray-100 bg-white/95 backdrop-blur-xl shadow-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            <button onClick={() => setShowLead(true)}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-black text-white shadow hover:bg-green-700 active:scale-95 transition">
              <MessageCircle size={15} />
              Get Best Price
            </button>

            <PriceAlertButton vehicleName={vehicleName} vehicleSlug={vehicleSlug} />

            <Link href={`/emi-calculator`}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-green-400 hover:text-green-700 transition">
              <Calculator size={14} />
              EMI Calculator
            </Link>

            <Link href="/compare"
              className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-green-400 hover:text-green-700 transition">
              <BarChart2 size={14} />
              Compare
            </Link>
          </div>
        </div>
      </div>

      {showLead && (
        <LeadFormModal
          vehicleName={vehicleName}
          vehicleSlug={vehicleSlug}
          vehicleType={vehicleType}
          onClose={() => setShowLead(false)}
        />
      )}
    </>
  );
}
