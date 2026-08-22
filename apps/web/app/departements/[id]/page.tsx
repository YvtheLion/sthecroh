import { DepartmentDetailPage } from '../../../components/DepartmentDetailPage';

export default function Page({ params }: { params: { id: string } }) {
  return <DepartmentDetailPage id={params.id} />;
}
