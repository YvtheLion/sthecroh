import { AboutDetailPage } from '../../../components/AboutDetailPage';

export default function Page({ params }: { params: { slug: string } }) {
  return <AboutDetailPage slug={params.slug} />;
}
