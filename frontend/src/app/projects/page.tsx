import ComingSoon from '@/components/ComingSoon';
import AuthGuard from '@/components/AuthGuard';

export default function Page() {
  return (
    <AuthGuard>
      <ComingSoon />
    </AuthGuard>
  );
}
