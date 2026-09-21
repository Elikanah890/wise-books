import { normalizeTzPhone as normalizeBackend } from '../src/utils/phone';
import { normalizeTzPhone as normalizeFrontend } from '../../frontend_book/src/utils/phone';

interface PhoneCase {
  input: string;
  expected: string | null;
  label: string;
}

const cases: PhoneCase[] = [
  { input: '0712345678', expected: '255712345678', label: 'local 0-prefixed' },
  { input: '255712345678', expected: '255712345678', label: 'already correct' },
  { input: '+255712345678', expected: '255712345678', label: 'leading +' },
  { input: '+255255712345678', expected: '255712345678', label: '+ and duplicated 255' },
  { input: '255255712345678', expected: '255712345678', label: 'duplicated 255' },
  { input: '1234567', expected: null, label: 'too short' },
  { input: '1234567890123456', expected: null, label: 'too long' },
  { input: 'abc123', expected: null, label: 'non-numeric' },
  // Additional UI-relevant cases
  { input: '688138821', expected: '255688138821', label: 'bare 9-digit mobile' },
  { input: '0784004690', expected: '255784004690', label: 'local with spaces ignored' },
  { input: '0712 345 678', expected: '255712345678', label: 'spaces' },
];

let failures = 0;
for (const testCase of cases) {
  const backend = normalizeBackend(testCase.input);
  const frontend = normalizeFrontend(testCase.input);
  const ok = backend === testCase.expected && frontend === testCase.expected;
  if (!ok) failures += 1;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${JSON.stringify(testCase.input)} (${testCase.label}) -> backend=${String(
      backend
    )} frontend=${String(frontend)} expected=${String(testCase.expected)}`
  );
}

console.log('---------------------------------------------');
if (failures === 0) {
  console.log(`ALL ${cases.length} CASES PASS`);
  process.exit(0);
}
console.log(`${failures} / ${cases.length} CASES FAILED`);
process.exit(1);
