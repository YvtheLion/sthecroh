import { VerificationPage } from '../../../../components/VerificationPage';

export default function CertificateVerificationPage({ params }: { params: { token: string } }) {
  return <VerificationPage token={params.token} />;
}
