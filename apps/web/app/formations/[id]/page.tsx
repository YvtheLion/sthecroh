import { ProgramDetailPage } from '../../../components/ProgramDetailPage';

export default function Page({ params }: { params: { id: string } }) {
  return <ProgramDetailPage id={params.id} />;
}
