
const LeadCard = ({ lead, index, onClick }) => {
  return (
    <div onClick={() => onClick(lead)}>
      ...
    </div>
  );
};

export default LeadCard;