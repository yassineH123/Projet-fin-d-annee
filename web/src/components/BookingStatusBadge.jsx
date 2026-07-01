const labels = {
  pending:   { cls: 'badge-pending',   text: 'En attente' },
  accepted:  { cls: 'badge-accepted',  text: 'Acceptée' },
  refused:   { cls: 'badge-refused',   text: 'Refusée' },
  cancelled: { cls: 'badge-cancelled', text: 'Annulée' },
  active:    { cls: 'badge-active',    text: 'Actif' },
  completed: { cls: 'badge-accepted',  text: 'Terminé' },
  suspended: { cls: 'badge-pending',   text: 'Suspendu' },
  blocked:   { cls: 'badge-cancelled', text: 'Banni' },
};

export default function BookingStatusBadge({ status }) {
  const { cls, text } = labels[status] || { cls: 'badge-cancelled', text: status };
  return <span className={cls}>{text}</span>;
}
