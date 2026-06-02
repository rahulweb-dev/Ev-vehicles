import { notFound } from "next/navigation";
import VehicleEditor from "@/components/admin/VehicleEditor";

export const metadata = { title: "Edit Vehicle" };

async function getVehicle(id) {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Vehicle   = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    const vehicle = await Vehicle.findById(id).lean();
    return vehicle ? JSON.parse(JSON.stringify(vehicle)) : null;
  } catch {
    return null;
  }
}

export default async function EditVehiclePage({ params }) {
  const { id } = await params;
  const vehicle = await getVehicle(id);
  if (!vehicle) notFound();

  return <VehicleEditor initialData={vehicle} vehicleId={id} />;
}
