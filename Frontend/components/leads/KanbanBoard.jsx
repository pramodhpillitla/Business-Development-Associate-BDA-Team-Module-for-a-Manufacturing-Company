import React, { useState } from "react";
import LeadCard from "./LeadCardjsx";

const KanbanBoard = () => {
  const [selectedLead, setSelectedLead] = useState(null);

  return (
    <>
      <LeadCard lead={lead} index={index} onClick={setSelectedLead} />
      <LeadDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
      />{" "}
    </>
  );
};

export default KanbanBoard;
