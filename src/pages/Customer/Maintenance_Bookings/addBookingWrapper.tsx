import { useSearchParams, useNavigate } from "react-router-dom";
import AddBookingModel from "./add_booking_modal";

const AddBookingWrapper = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mechanicId = searchParams.get("mechanicId");

  return (
    <AddBookingModel
      isOpen={true}
     preselectedMechanicId={mechanicId ?? undefined}
      onClose={() => navigate("/customer/maintenancebookings")}
    />
  );
};

export default AddBookingWrapper;