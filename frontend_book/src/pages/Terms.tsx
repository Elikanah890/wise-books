import LegalPage from '../components/common/LegalPage';
import { useT } from '../contexts/LanguageContext';

export default function Terms() {
  const t = useT();
  return <LegalPage title={t.terms.title} intro={t.terms.intro} sections={t.terms.sections} />;
}
