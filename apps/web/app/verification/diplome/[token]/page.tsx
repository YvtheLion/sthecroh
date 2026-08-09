import { VerificationPage } from '../../../../components/VerificationPage';

export default function DiplomaVerificationPage({ params }: { params: { token: string } }) {
  return <VerificationPage token={params.token} />;
}
