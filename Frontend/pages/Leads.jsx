import PageWrapper from "../components/layout/PageWrapper";
import KanbanBoard from "../components/leads/KanbanBoard";

const Leads = () => {
  return (
    <PageWrapper>
      <h1 className="text-3xl font-bold mb-6">Lead Pipeline</h1>

      <KanbanBoard />
    </PageWrapper>
  );
};

export default Leads;