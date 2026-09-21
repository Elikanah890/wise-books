import LegalPage from '../components/common/LegalPage';
import { useT } from '../contexts/LanguageContext';

export default function Privacy() {
  const t = useT();
  return <LegalPage title={t.privacy.title} intro={t.privacy.intro} sections={t.privacy.sections} />;
}
