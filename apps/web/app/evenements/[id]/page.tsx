import { EventDetailPage } from '../../../components/EventDetailPage';

export default function Page({ params }: { params: { id: string } }) {
  return <EventDetailPage id={params.id} />;
}
